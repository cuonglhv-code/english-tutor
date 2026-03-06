"use client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createBrowserClient } from "@/lib/supabase";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createBrowserClient();

    async function fetchUserAndRole(authUser: User | null) {
      setUser(authUser);
      if (!authUser) {
        setRole(null);
        setLoading(false);
        return;
      }

      // Fetch role from profiles table
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authUser.id)
        .single();

      setRole(data?.role ?? null);
      setLoading(false);
    }

    supabase.auth.getUser().then(({ data }) => {
      fetchUserAndRole(data.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoading(true);
      fetchUserAndRole(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, role, loading };
}
