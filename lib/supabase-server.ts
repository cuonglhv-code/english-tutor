import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Service-role client: NEVER expose to the client bundle.
// Use only in API routes and Server Components.
export function createServiceClient() {
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
