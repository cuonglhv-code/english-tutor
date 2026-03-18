"use client";
import { useEffect, useState, useRef } from "react";
import type { User } from "@supabase/supabase-js";
import { createBrowserClient } from "@/lib/supabase";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  // Track whether the initial load has completed — prevents refetch flicker on tab focus
  const initialised = useRef(false);

  useEffect(() => {
    const supabase = createBrowserClient();

    async function fetchUserAndRole(authUser: User | null) {
      setUser(authUser);
      if (!authUser) {
        setRole(null);
        setLoading(false);
        initialised.current = true;
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
      initialised.current = true;
    }

    supabase.auth.getUser().then(({ data }) => {
      fetchUserAndRole(data.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // Only set loading=true before the initial fetch completes.
      // Subsequent events (TOKEN_REFRESHED, etc.) fire when the user returns
      // to the tab — we update silently without triggering a loading flash.
      if (!initialised.current) {
        setLoading(true);
      }
      fetchUserAndRole(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, role, loading };
}
