import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useApplicantsRealtime(recruiterId: string | undefined, onChange: () => void) {
  useEffect(() => {
    if (!recruiterId) return;

    const channel = supabase
      .channel(`applicants-recruiter-${recruiterId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "applications",
        },
        onChange,
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [onChange, recruiterId]);
}
