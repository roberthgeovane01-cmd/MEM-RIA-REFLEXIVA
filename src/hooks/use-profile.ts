import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

/** The current user's profile row (see supabase/migrations — public.profiles). */
export function useProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, created_at, updated_at")
        .eq("id", user!.id)
        .single();

      if (error) throw error;
      return data;
    },
  });
}
