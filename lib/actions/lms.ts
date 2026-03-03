"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase-server";
import type { UserGoals } from "@/types/lms";

// ─── Auth helper ─────────────────────────────────────────────────────────────
// Reads the session from cookies so mutations are always tied to the
// authenticated user — never trusting a userId from the client.

async function getAuthenticatedUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore: called from a Server Component where cookies are read-only
          }
        },
      },
    }
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

// ─── updateExamDateAction ─────────────────────────────────────────────────────
// Upserts a single exam date row for the logged-in user.

export async function updateExamDateAction(
  examDate: string
): Promise<{ error: string | null }> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { error: "Not authenticated" };

  const supabase = createServiceClient();
  const { error } = await supabase.from("user_exam_dates").upsert(
    {
      user_id:    userId,
      exam_date:  examDate,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  return { error: error?.message ?? null };
}

// ─── updateUserGoalsAction ────────────────────────────────────────────────────
// Upserts band-score goals for the logged-in user.

export async function updateUserGoalsAction(
  goals: Omit<UserGoals, "id" | "user_id" | "updated_at">
): Promise<{ error: string | null }> {
  const userId = await getAuthenticatedUserId();
  if (!userId) return { error: "Not authenticated" };

  const supabase = createServiceClient();
  const { error } = await supabase.from("user_goals").upsert(
    {
      ...goals,
      user_id:    userId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  return { error: error?.message ?? null };
}
