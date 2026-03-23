-- supabase/migrations/20260323000003_create_guest_registrations.sql

CREATE TABLE IF NOT EXISTS guest_registrations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Allow public inserts via service role (API route)
ALTER TABLE guest_registrations ENABLE ROW LEVEL SECURITY;

-- No direct public insert policy needed since we use service role, 
-- but the user explicitly asked for these policies:
CREATE POLICY "Service role can insert" ON guest_registrations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can read" ON guest_registrations
  FOR SELECT USING (true);
