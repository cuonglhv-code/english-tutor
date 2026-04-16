import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase-server";
import { BOOKING_STAFF_EMAIL } from "@/lib/consultationConstants";

export const runtime = "nodejs";

// ─── Email HTML template (same pattern as messages route) ─────────────────────
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

function buildStudentEmailBody(params: {
  studentName: string;
  phone: string;
  email: string;
  centerName: string;
  preferredDate: string;
  preferredTime: string;
}): string {
  const { studentName, phone, email, centerName, preferredDate, preferredTime } = params;
  return `
<p>Xin chào <strong>${studentName}</strong>,</p>

<p>Cảm ơn bạn đã đặt lịch tư vấn IELTS với Jaxtina. Chúng tôi đã nhận được yêu cầu của bạn và sẽ liên hệ vào thời gian đã chọn.</p>

<p>Dear <strong>${studentName}</strong>,</p>

<p>Thank you for booking a free IELTS consultation with Jaxtina. We have received your request and our advisor will contact you at the scheduled time.</p>

<table style="border-collapse:collapse;width:100%;margin:20px 0;">
  <thead>
    <tr style="background:#1a2744;color:#ffffff;">
      <th style="padding:10px 16px;text-align:left;font-size:13px;">Field / Thông tin</th>
      <th style="padding:10px 16px;text-align:left;font-size:13px;">Details / Chi tiết</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background:#f9fafb;">
      <td style="padding:10px 16px;font-size:14px;color:#374151;border-bottom:1px solid #e5e7eb;">Full Name / Họ và tên</td>
      <td style="padding:10px 16px;font-size:14px;color:#111827;font-weight:600;border-bottom:1px solid #e5e7eb;">${studentName}</td>
    </tr>
    <tr>
      <td style="padding:10px 16px;font-size:14px;color:#374151;border-bottom:1px solid #e5e7eb;">Phone / Điện thoại</td>
      <td style="padding:10px 16px;font-size:14px;color:#111827;font-weight:600;border-bottom:1px solid #e5e7eb;">${phone}</td>
    </tr>
    <tr style="background:#f9fafb;">
      <td style="padding:10px 16px;font-size:14px;color:#374151;border-bottom:1px solid #e5e7eb;">Email</td>
      <td style="padding:10px 16px;font-size:14px;color:#111827;font-weight:600;border-bottom:1px solid #e5e7eb;">${email}</td>
    </tr>
    <tr>
      <td style="padding:10px 16px;font-size:14px;color:#374151;border-bottom:1px solid #e5e7eb;">Center / Cơ sở</td>
      <td style="padding:10px 16px;font-size:14px;color:#111827;font-weight:600;border-bottom:1px solid #e5e7eb;">${centerName}</td>
    </tr>
    <tr style="background:#f9fafb;">
      <td style="padding:10px 16px;font-size:14px;color:#374151;border-bottom:1px solid #e5e7eb;">Date / Ngày</td>
      <td style="padding:10px 16px;font-size:14px;color:#111827;font-weight:600;border-bottom:1px solid #e5e7eb;">${preferredDate}</td>
    </tr>
    <tr>
      <td style="padding:10px 16px;font-size:14px;color:#374151;">Time Slot / Khung giờ</td>
      <td style="padding:10px 16px;font-size:14px;color:#111827;font-weight:600;">${preferredTime}</td>
    </tr>
  </tbody>
</table>

<p style="background:#eff6ff;border-left:4px solid #3b82f6;padding:12px 16px;border-radius:4px;font-size:14px;color:#1e40af;">
  Our advisor will call you at <strong>${preferredTime}</strong> on <strong>${preferredDate}</strong>.<br/>
  Tư vấn viên sẽ gọi điện cho bạn vào lúc <strong>${preferredTime}</strong> ngày <strong>${preferredDate}</strong>.
</p>

<p>If you have any questions, please contact us at <a href="mailto:${BOOKING_STAFF_EMAIL}">${BOOKING_STAFF_EMAIL}</a>.</p>
<p>Nếu có thắc mắc, vui lòng liên hệ chúng tôi tại <a href="mailto:${BOOKING_STAFF_EMAIL}">${BOOKING_STAFF_EMAIL}</a>.</p>

<p>Trân trọng,<br/>Đội ngũ Jaxtina IELTS</p>
`.trim();
}

function buildStaffEmailBody(params: {
  studentName: string;
  phone: string;
  email: string;
  centerName: string;
  preferredDate: string;
  preferredTime: string;
  sourceContext: string;
  bookingId: string;
}): string {
  const { studentName, phone, email, centerName, preferredDate, preferredTime, sourceContext, bookingId } = params;
  const sourceLabel: Record<string, string> = {
    main_button: "Main Button",
    placement_results: "Placement Results",
    study_plan: "Study Plan",
    practice_submission: "Practice Submission",
  };
  return `
<p style="font-size:16px;font-weight:700;color:#dc2626;">NEW BOOKING RECEIVED</p>

<table style="border-collapse:collapse;width:100%;margin:16px 0;">
  <tr style="background:#f9fafb;">
    <td style="padding:8px 16px;font-size:13px;color:#6b7280;width:160px;border-bottom:1px solid #e5e7eb;">Booking ID</td>
    <td style="padding:8px 16px;font-size:13px;color:#111827;font-family:monospace;border-bottom:1px solid #e5e7eb;">${bookingId}</td>
  </tr>
  <tr>
    <td style="padding:8px 16px;font-size:13px;color:#6b7280;border-bottom:1px solid #e5e7eb;">Student Name</td>
    <td style="padding:8px 16px;font-size:14px;color:#111827;font-weight:700;border-bottom:1px solid #e5e7eb;">${studentName}</td>
  </tr>
  <tr style="background:#f9fafb;">
    <td style="padding:8px 16px;font-size:13px;color:#6b7280;border-bottom:1px solid #e5e7eb;">Phone</td>
    <td style="padding:8px 16px;font-size:14px;color:#111827;font-weight:700;border-bottom:1px solid #e5e7eb;">${phone}</td>
  </tr>
  <tr>
    <td style="padding:8px 16px;font-size:13px;color:#6b7280;border-bottom:1px solid #e5e7eb;">Email</td>
    <td style="padding:8px 16px;font-size:14px;color:#111827;border-bottom:1px solid #e5e7eb;">${email}</td>
  </tr>
  <tr style="background:#f9fafb;">
    <td style="padding:8px 16px;font-size:13px;color:#6b7280;border-bottom:1px solid #e5e7eb;">Center</td>
    <td style="padding:8px 16px;font-size:14px;color:#111827;border-bottom:1px solid #e5e7eb;">${centerName}</td>
  </tr>
  <tr>
    <td style="padding:8px 16px;font-size:13px;color:#6b7280;border-bottom:1px solid #e5e7eb;">Date</td>
    <td style="padding:8px 16px;font-size:14px;color:#111827;font-weight:700;border-bottom:1px solid #e5e7eb;">${preferredDate}</td>
  </tr>
  <tr style="background:#f9fafb;">
    <td style="padding:8px 16px;font-size:13px;color:#6b7280;border-bottom:1px solid #e5e7eb;">Time Slot</td>
    <td style="padding:8px 16px;font-size:14px;color:#111827;font-weight:700;border-bottom:1px solid #e5e7eb;">${preferredTime}</td>
  </tr>
  <tr>
    <td style="padding:8px 16px;font-size:13px;color:#6b7280;">Source</td>
    <td style="padding:8px 16px;font-size:13px;color:#6b7280;">${sourceLabel[sourceContext] ?? sourceContext}</td>
  </tr>
</table>

<p style="font-size:13px;color:#6b7280;">Please call the student at the booked time slot and update the status in the admin dashboard.</p>
`.trim();
}

// ── POST /api/consultations ────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const service = createServiceClient();

  // Optionally get current user (not required)
  let userId: string | null = null;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  } catch {
    // unauthenticated — allowed
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    studentName,
    phone,
    email,
    centerName,
    preferredDate,
    preferredTime,
    sourceContext = "main_button",
    consentContacted = true,
  } = body as {
    studentName?: string;
    phone?: string;
    email?: string;
    centerName?: string;
    preferredDate?: string;
    preferredTime?: string;
    sourceContext?: string;
    consentContacted?: boolean;
  };

  // ── Server-side validation ──────────────────────────────────────────────────
  if (!studentName?.trim()) {
    return NextResponse.json({ error: "studentName is required" }, { status: 400 });
  }
  if (!phone?.trim()) {
    return NextResponse.json({ error: "phone is required" }, { status: 400 });
  }
  if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }
  if (!centerName?.trim()) {
    return NextResponse.json({ error: "centerName is required" }, { status: 400 });
  }
  if (!preferredDate?.trim()) {
    return NextResponse.json({ error: "preferredDate is required" }, { status: 400 });
  }
  if (!preferredTime?.trim()) {
    return NextResponse.json({ error: "preferredTime is required" }, { status: 400 });
  }

  // Date must be today or future
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dateVal = new Date(preferredDate);
  if (isNaN(dateVal.getTime()) || dateVal < today) {
    return NextResponse.json({ error: "preferredDate must be today or a future date" }, { status: 400 });
  }

  const validSources = ["main_button", "placement_results", "study_plan", "practice_submission"];
  const safeSource = validSources.includes(sourceContext) ? sourceContext : "main_button";

  // ── Duplicate check ─────────────────────────────────────────────────────────
  if (userId) {
    const { data: existing } = await service
      .from("consultation_bookings")
      .select("id")
      .eq("user_id", userId)
      .eq("preferred_date", preferredDate)
      .eq("preferred_time", preferredTime)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "You already have a booking for this date and time slot" },
        { status: 409 }
      );
    }
  }

  // ── Insert ──────────────────────────────────────────────────────────────────
  const { data: inserted, error: insertErr } = await service
    .from("consultation_bookings")
    .insert({
      student_name: studentName.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      center_name: centerName.trim(),
      preferred_date: preferredDate,
      preferred_time: preferredTime,
      source_context: safeSource,
      user_id: userId,
      consent_contacted: Boolean(consentContacted),
    })
    .select("id")
    .single();

  if (insertErr || !inserted) {
    console.error("[consultations POST] DB insert error:", insertErr);
    return NextResponse.json({ error: "Failed to save booking" }, { status: 500 });
  }

  // ── Send emails ─────────────────────────────────────────────────────────────
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(resendKey);
      // RESEND_FROM_EMAIL must be an address from a verified Resend domain.
      // e.g. "noreply@jaxtina.com" after verifying jaxtina.com in Resend dashboard.
      // If not set, fall back to Resend sandbox (can only deliver to account owner).
      const fromAddress = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

      const studentSubject = "Xác nhận đặt lịch tư vấn IELTS / Consultation Booking Confirmed";
      const studentBody = buildStudentEmailBody({
        studentName: studentName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        centerName: centerName.trim(),
        preferredDate,
        preferredTime,
      });

      const staffSubject = `New Consultation Booking — ${studentName.trim()} — ${centerName.trim()}`;
      const staffBody = buildStaffEmailBody({
        studentName: studentName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        centerName: centerName.trim(),
        preferredDate,
        preferredTime,
        sourceContext: safeSource,
        bookingId: inserted.id,
      });

      await Promise.allSettled([
        resend.emails.send({
          from: fromAddress,
          to: email.trim().toLowerCase(),
          subject: studentSubject,
          html: buildEmailHtml(studentSubject, studentBody),
        }),
        resend.emails.send({
          from: fromAddress,
          to: BOOKING_STAFF_EMAIL,
          subject: staffSubject,
          html: buildEmailHtml(staffSubject, staffBody),
        }),
      ]);
    } catch (emailErr: unknown) {
      console.error("[consultations POST] Resend error:", emailErr);
      // Non-fatal — booking is already saved
    }
  }

  return NextResponse.json({ id: inserted.id, success: true }, { status: 201 });
}
