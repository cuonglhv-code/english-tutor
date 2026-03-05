-- ============================================================
-- Migration 004: Add user role
-- ============================================================

-- ─── profiles: add role column ────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user';

-- ─── RLS: admins can bypass RLS ──────────────────────────────────────
-- Give admins full access to all tables where RLS is enabled.
-- Note: This requires the `current_user_role` function below.

-- essay_submissions
DROP POLICY IF EXISTS "Admins can manage all submissions" ON public.essay_submissions;
CREATE POLICY "Admins can manage all submissions"
  ON public.essay_submissions FOR ALL
  USING (public.is_admin());

-- feedback_results
DROP POLICY IF EXISTS "Admins can manage all feedback" ON public.feedback_results;
CREATE POLICY "Admins can manage all feedback"
  ON public.feedback_results FOR ALL
  USING (public.is_admin());
  
-- profiles
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can manage all profiles"
  ON public.profiles FOR ALL
  USING (public.is_admin());

-- ─── Helper function to check for admin role ─────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  user_role text;
BEGIN
  -- This will be null if the user is not logged in
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  -- Fetch the role of the currently authenticated user
  SELECT role
  INTO user_role
  FROM public.profiles
  WHERE id = auth.uid();

  -- Return true if the user's role is 'admin'
  RETURN user_role = 'admin';
END;
$$;
