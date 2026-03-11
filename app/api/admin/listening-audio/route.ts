import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, writeAuditLog } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Maximum upload size: 50 MB
const MAX_BYTES = 50 * 1024 * 1024;
const ALLOWED_TYPES = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/mp4", "audio/aac"];
const BUCKET = "placement-audio";

/**
 * POST /api/admin/listening-audio
 *
 * Accepts multipart/form-data with fields:
 *   - file    : audio file (required)
 *   - title   : display name (required)
 *   - partNumber: integer (optional, default 1)
 *   - transcript: text (optional)
 *
 * Uploads the file to Supabase Storage bucket "placement-audio" and inserts
 * a row in placement_listening_audio.
 */
export async function POST(req: NextRequest) {
  // ── Admin auth ──────────────────────────────────────────────────────────────
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { user, service } = auth;

  // ── Parse multipart form ─────────────────────────────────────────────────
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid multipart form data" },
      { status: 400 }
    );
  }

  const file = formData.get("file") as File | null;
  const title = (formData.get("title") as string | null)?.trim();
  const partNumber = parseInt(
    (formData.get("partNumber") as string | null) ?? "1",
    10
  );
  const transcript = (formData.get("transcript") as string | null) ?? null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  // ── Validate file ──────────────────────────────────────────────────────────
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File too large. Maximum size is ${MAX_BYTES / 1024 / 1024} MB.` },
      { status: 413 }
    );
  }

  const mimeType = file.type;
  if (!ALLOWED_TYPES.some((t) => mimeType.startsWith(t.split("/")[0]) || mimeType === t)) {
    // Be permissive: only block obviously non-audio
    if (!mimeType.startsWith("audio/")) {
      return NextResponse.json(
        { error: `File type not allowed: ${mimeType}` },
        { status: 415 }
      );
    }
  }

  // ── Upload to Supabase Storage ─────────────────────────────────────────────
  const ext = file.name.split(".").pop() ?? "mp3";
  const storagePath = `part${partNumber}/${Date.now()}-${file.name.replace(/\s+/g, "_")}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { data: uploadData, error: uploadError } = await service.storage
    .from(BUCKET)
    .upload(storagePath, buffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (uploadError) {
    console.error("[admin/listening-audio] Storage upload error:", uploadError);
    return NextResponse.json(
      { error: `Upload failed: ${uploadError.message}` },
      { status: 500 }
    );
  }

  // ── Get public URL ─────────────────────────────────────────────────────────
  const { data: urlData } = service.storage
    .from(BUCKET)
    .getPublicUrl(storagePath);

  const publicUrl = urlData?.publicUrl ?? "";

  // ── Insert DB row ──────────────────────────────────────────────────────────
  const { data: inserted, error: insertError } = await service
    .from("placement_listening_audio")
    .insert({
      title,
      storage_path: storagePath,
      public_url: publicUrl,
      part_number: isNaN(partNumber) ? 1 : partNumber,
      transcript: transcript ?? null,
      is_active: true,
    })
    .select("id, public_url, storage_path")
    .single();

  if (insertError) {
    // Clean up uploaded file on DB insert failure
    await service.storage.from(BUCKET).remove([storagePath]).catch(() => {});
    console.error("[admin/listening-audio] DB insert error:", insertError);
    return NextResponse.json(
      { error: `DB insert failed: ${insertError.message}` },
      { status: 500 }
    );
  }

  // ── Audit log ─────────────────────────────────────────────────────────────
  await writeAuditLog(service, user.id, "upload_listening_audio", {
    target_table: "placement_listening_audio",
    target_id: inserted.id,
    detail: { title, storagePath, partNumber },
  });

  return NextResponse.json({
    ok: true,
    id: inserted.id,
    public_url: inserted.public_url,
    storage_path: inserted.storage_path,
  });
}
