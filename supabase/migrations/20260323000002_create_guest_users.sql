-- supabase/migrations/20260323000002_create_guest_users.sql
CREATE TABLE IF NOT EXISTS guest_users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  source text, -- 'quiz' or 'tutor' — where they first registered
  created_at timestamptz DEFAULT now()
);

-- Allow public inserts via service role (API route)
ALTER TABLE guest_users ENABLE ROW LEVEL SECURITY;

-- Deny all public access by default (no policies)
-- Access will be managed via service role in server-side API routes
