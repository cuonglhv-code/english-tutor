CREATE TABLE IF NOT EXISTS public.consultation_bookings (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name        TEXT        NOT NULL,
  phone               TEXT        NOT NULL,
  email               TEXT        NOT NULL,
  center_name         TEXT        NOT NULL,
  preferred_date      DATE        NOT NULL,
  preferred_time      TEXT        NOT NULL,   -- e.g. "08:00-10:00"
  source_context      TEXT        NOT NULL DEFAULT 'main_button',
                                               -- 'main_button' | 'placement_results' | 'study_plan' | 'practice_submission'
  user_id             UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  status              TEXT        NOT NULL DEFAULT 'pending'
                                   CHECK (status IN ('pending','contacted','completed','cancelled')),
  staff_notes         TEXT,
  assigned_staff_id   UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  consent_contacted   BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.consultation_bookings ENABLE ROW LEVEL SECURITY;

-- Students can insert their own bookings
DROP POLICY IF EXISTS "Students can create bookings" ON public.consultation_bookings;
CREATE POLICY "Students can create bookings"
  ON public.consultation_bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Students can view their own bookings
DROP POLICY IF EXISTS "Students can view own bookings" ON public.consultation_bookings;
CREATE POLICY "Students can view own bookings"
  ON public.consultation_bookings FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can do everything
DROP POLICY IF EXISTS "Admins manage bookings" ON public.consultation_bookings;
CREATE POLICY "Admins manage bookings"
  ON public.consultation_bookings FOR ALL USING (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_consultation_bookings_user ON public.consultation_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_status ON public.consultation_bookings(status);
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_date ON public.consultation_bookings(preferred_date);
