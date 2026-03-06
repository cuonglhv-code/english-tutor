import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, writeAuditLog } from "@/lib/admin-auth";

export const runtime = "nodejs";

// ─── Branded email HTML template ─────────────────────────────────────────────
function buildEmailHtml(subject: string, body: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:#1a2744;padding:28px 40px;">
              <span style="font-size:24px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">
                JAXTINA <span style="color:#3b82f6;">IELTS</span>
              </span>
            </td>
          </tr>
          <!-- Subject -->
          <tr>
            <td style="padding:32px 40px 8px 40px;">
              <h1 style="margin:0;font-size:20px;font-weight:700;color:#1a2744;">${subject}</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:16px 40px 32px 40px;font-size:15px;color:#374151;line-height:1.7;">
              ${body.replace(/\n/g, "<br/>")}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                This message was sent by Jaxtina IELTS. 
                If you did not expect this email, you can safely ignore it.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── GET /api/admin/messages ────────────────────────────────────────────────
// Paginated list of sent messages
export async function GET(req: NextRequest) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;
    const { service } = auth;

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, parseInt(searchParams.get("limit") ?? "20", 10));
    const offset = (page - 1) * limit;

    const { data, count, error } = await service
        .from("messages")
        .select(
            `*, sender:sender_id(email, full_name, display_name), 
             recipient:recipient_id(email, full_name, display_name)`,
            { count: "exact" }
        )
        .order("sent_at", { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ messages: data ?? [], total: count ?? 0, page, limit });
}

// ── POST /api/admin/messages ───────────────────────────────────────────────
// Send an in-app or email message
export async function POST(req: NextRequest) {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;
    const { user: admin, service } = auth;

    const body = await req.json();
    const {
        recipient_id = null,    // null = broadcast
        subject,
        body: messageBody,
        message_type = "in_app",
    } = body;

    if (!subject || !messageBody) {
        return NextResponse.json({ error: "subject and body are required" }, { status: 400 });
    }

    if (!["in_app", "email"].includes(message_type)) {
        return NextResponse.json({ error: "message_type must be 'in_app' or 'email'" }, { status: 400 });
    }

    let recipientCount = 1;
    let warning: string | null = null;

    // ── Resolve recipients for broadcast ──────────────────────────────────────
    let recipientEmails: { id: string; email: string }[] = [];

    if (message_type === "email") {
        const resendKey = process.env.RESEND_API_KEY;

        if (!resendKey) {
            // Fallback: save as in_app only
            warning = "Email not configured — saved as in-app only";
        } else {
            if (recipient_id) {
                // Single recipient
                const { data: prof } = await service
                    .from("profiles")
                    .select("id, email")
                    .eq("id", recipient_id)
                    .single();
                if (prof) recipientEmails = [{ id: prof.id, email: prof.email }];
            } else {
                // Broadcast — fetch all active students
                const { data: profs } = await service
                    .from("profiles")
                    .select("id, email")
                    .in("role", ["student", "user"])
                    .eq("is_active", true);
                recipientEmails = (profs ?? []).map((p: any) => ({ id: p.id, email: p.email }));
            }

            recipientCount = recipientEmails.length;

            if (recipientEmails.length > 0) {
                try {
                    // Dynamically import Resend to avoid crashing if not installed
                    const { Resend } = await import("resend");
                    const resend = new Resend(resendKey);
                    const htmlContent = buildEmailHtml(subject, messageBody);
                    const fromAddress = "Jaxtina IELTS <no-reply@jaxtina.com>";

                    // Send emails (batch in chunks of 50 to avoid rate limits)
                    const BATCH = 50;
                    for (let i = 0; i < recipientEmails.length; i += BATCH) {
                        const chunk = recipientEmails.slice(i, i + BATCH);
                        await Promise.allSettled(
                            chunk.map(r =>
                                resend.emails.send({
                                    from: fromAddress,
                                    to: r.email,
                                    subject,
                                    html: htmlContent,
                                })
                            )
                        );
                    }
                } catch (emailErr: any) {
                    console.error("[admin/messages POST] Resend error:", emailErr);
                    warning = `Email sending failed: ${emailErr.message}. Message saved as in-app only.`;
                }
            }
        }
    }

    // ── Save to messages table ─────────────────────────────────────────────────
    // For broadcast: insert one row per recipient (allows per-user read tracking)
    // For single: insert one row
    const effectiveType = warning ? "in_app" : message_type;

    if (recipient_id === null) {
        // Broadcast — insert one record (null recipient_id = broadcast)
        const { error: insertErr } = await service.from("messages").insert({
            sender_id: admin.id,
            recipient_id: null,
            subject,
            body: messageBody,
            message_type: effectiveType,
        });

        if (insertErr) {
            console.error("[admin/messages POST] DB insert error:", insertErr);
            return NextResponse.json({ error: insertErr.message }, { status: 500 });
        }
    } else {
        const { error: insertErr } = await service.from("messages").insert({
            sender_id: admin.id,
            recipient_id,
            subject,
            body: messageBody,
            message_type: effectiveType,
        });

        if (insertErr) {
            console.error("[admin/messages POST] DB insert error:", insertErr);
            return NextResponse.json({ error: insertErr.message }, { status: 500 });
        }
    }

    await writeAuditLog(service, admin.id, "SEND_MESSAGE", {
        target_table: "messages",
        detail: { type: effectiveType, recipient_count: recipientCount, broadcast: recipient_id === null },
    });

    const response: Record<string, unknown> = { success: true, recipient_count: recipientCount };
    if (warning) response.warning = warning;

    return NextResponse.json(response, { status: 201 });
}
