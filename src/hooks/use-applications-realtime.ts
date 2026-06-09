import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useApplicationsRealtime(userId: string | undefined, onChange: () => void) {
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`applications-user-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "applications",
          filter: `applicant_id=eq.${userId}`,
        },
        onChange,
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [onChange, userId]);
}
