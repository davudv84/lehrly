import { useState } from "react";
import PrimaryButton from "./PrimaryButton";
import { toast } from "@/hooks/use-toast";
import { lovable } from "@/integrations/lovable";

const AppleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden fill="currentColor">
    <path d="M16.365 1.43c0 1.14-.42 2.23-1.18 3.04-.81.86-2.13 1.52-3.21 1.43-.13-1.13.42-2.31 1.16-3.07.83-.86 2.24-1.5 3.23-1.4zM20.5 17.39c-.55 1.27-.81 1.84-1.52 2.96-.99 1.56-2.39 3.5-4.12 3.51-1.54.02-1.94-1-4.04-.99-2.1.01-2.54 1.01-4.08.99-1.73-.02-3.05-1.77-4.04-3.33C-.05 16.07-.34 10.95 1.69 8.21c1.42-1.93 3.66-3.07 5.77-3.07 2.14 0 3.49 1.18 5.26 1.18 1.71 0 2.76-1.18 5.24-1.18 1.86 0 3.83 1.01 5.24 2.77-4.6 2.52-3.85 9.1-2.7 9.48z"/>
  </svg>
);

type Props = {
  onStart?: () => void;
};

const OAuthButtons = ({ onStart }: Props) => {
  const [loading, setLoading] = useState(false);

  const handleAppleLogin = async () => {
    onStart?.();
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("apple", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setLoading(false);
      toast({
        title: "Anmeldung fehlgeschlagen",
        description: result.error.message ?? "Bitte versuche es erneut.",
        variant: "destructive",
      });
      return;
    }
    if (result.redirected) return;
    window.location.assign("/");
  };

  return (
    <div className="flex flex-col gap-3">
      <PrimaryButton variant="outline" onClick={handleAppleLogin} loading={loading}>
        <AppleIcon />
        <span>Mit Apple fortfahren</span>
      </PrimaryButton>
    </div>
  );
};

export default OAuthButtons;
