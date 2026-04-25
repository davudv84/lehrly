import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const SEEDED_KEY = "lehrly_demo_seeded_v1";

/**
 * Seeds the demo content on first authenticated load (per browser).
 * Safe to call repeatedly — the SQL function is idempotent.
 */
export const useSeedDemoOnce = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const key = `${SEEDED_KEY}:${user.id}`;
    if (localStorage.getItem(key)) return;
    let cancelled = false;
    (async () => {
      const { error } = await supabase.rpc("seed_demo_content");
      if (!cancelled && !error) localStorage.setItem(key, "1");
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);
};
