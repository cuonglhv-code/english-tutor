import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Service-role client: NEVER expose to the client bundle.
// Use only in API routes and Server Components.
export function createServiceClient() {
  return createSupabaseClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

// Session-aware client: Uses cookies to manage authentication.
// Use in server-side contexts where you need to check the user's session.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch (error) {
          // This can be ignored if the client is used in a context where cookies cannot be set
        }
      },
      remove(name: string, options: any) {
        try {
          cookieStore.set({ name, value: "", ...options });
        } catch (error) {
          // Same here
        }
      },
    },
  });
}
