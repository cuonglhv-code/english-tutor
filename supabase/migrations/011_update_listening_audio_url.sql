-- ─── Migration 011: Update listening audio URL ───────────────────────────────
-- All 4 parts share a single continuous audio file hosted in Supabase Storage.
-- Update every active audio row to point to the new URL.

UPDATE public.placement_listening_audio
SET
  public_url   = 'https://wuejnsqetupivmidxylv.supabase.co/storage/v1/object/public/placement-audio/listening-audio.mp3',
  storage_path = 'listening-audio.mp3'
WHERE is_active = TRUE;
