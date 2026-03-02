import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Returns a new Supabase browser client (anon key). Safe to call from Client Components.
export function createBrowserClient() {
  return createSupabaseBrowserClient(url, anonKey);
}
