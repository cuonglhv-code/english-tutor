-- ─── Migration 012: Add image and prompt for Writing Task 1 ─────────────────
-- Sets the chart image URL and matching prompt text for the Task 1
-- "Percentage of the population living in cities" line chart.
--
-- IMPORTANT: Replace the image_url value below with the actual URL after you
-- upload the chart image to Supabase Storage (bucket: placement-audio or a
-- dedicated "placement-images" bucket).
--
-- To upload: Supabase Dashboard → Storage → placement-audio → Upload file
-- Then copy the public URL and paste it below.

UPDATE public.placement_writing_tasks
SET
  prompt_text = 'The graph below shows the percentage of the population living in cities in four Asian countries between 1970 and 2040.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.',
  visual_description = 'Line graph showing urbanisation trends (% of total population living in cities) for Philippines, Malaysia, Thailand and Indonesia from 1970 to 2040 (projected). Malaysia shows the steepest rise, reaching over 80% by 2040. Indonesia shows the strongest projected growth after 2010.',
  image_url = 'REPLACE_WITH_YOUR_IMAGE_URL'
WHERE task_type = 'task1'
  AND is_active = TRUE;
