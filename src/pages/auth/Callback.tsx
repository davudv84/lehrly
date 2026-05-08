import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
          if (error) throw error;
        } else {
          // Fallback: implicit flow with hash tokens — getSession will pick them up via detectSessionInUrl
          await supabase.auth.getSession();
        }

        navigate("/", { replace: true });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Anmeldung fehlgeschlagen.";
        toast({
          title: "Anmeldung fehlgeschlagen",
          description: message,
          variant: "destructive",
        });
        navigate("/auth/login", { replace: true });
      }
    };
    run();
  }, [navigate]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg-base">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-brand" />
    </div>
  );
};

export default AuthCallback;
