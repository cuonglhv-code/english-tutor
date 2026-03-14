-- ─── Migration 010: Writing Task 1 – urbanisation line graph ─────────────────
-- Updates the active Writing Task 1 row to add:
--   • prompt_text   — proper IELTS Task 1 rubric for the line graph
--   • image_url     — path served from Next.js public/ folder
--   • visual_description — text description for screen-readers / fallback

UPDATE public.placement_writing_tasks
SET
  prompt_text = 'The graph below shows the percentage of the population living in cities in four Asian countries from 1970 to 2040.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.',

  image_url = '/images/writing-task1-chart.png',

  visual_description = 'Line graph titled "Percentage of the population living in cities". '
    'X-axis: Year (1970–2040). Y-axis: Percentage (%) of total population (0–90%). '
    'Four countries are shown: Malaysia (diamond markers, dotted line) starts at ~30% in 1970 and rises steeply to ~83% by 2040, the highest of all. '
    'Philippines (square markers, dashed line) starts highest in 1970 (~32%), stays relatively flat around 43–56% through 2040. '
    'Thailand (X markers, dashed line) shows moderate growth from ~15% in 1970 to ~50% by 2040. '
    'Indonesia (triangle markers, solid line) begins lowest at ~14% in 1970 but surges sharply after 2000, reaching ~64% by 2040, overtaking Thailand and Philippines.'

WHERE task_type = 'task1'
  AND is_active = TRUE;
