import { lovable } from "@/integrations/lovable";
import PrimaryButton from "./PrimaryButton";
import { toast } from "@/hooks/use-toast";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
    <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.17-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.61z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"/>
    <path fill="#FBBC05" d="M3.97 10.71A5.41 5.41 0 0 1 3.68 9c0-.59.1-1.17.29-1.71V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.82.96 4.04l3.01-2.33z"/>
    <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.96l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"/>
  </svg>
);

const AppleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden fill="currentColor">
    <path d="M16.365 12.957c-.025-2.567 2.094-3.797 2.19-3.857-1.193-1.745-3.05-1.984-3.708-2.011-1.581-.16-3.085.93-3.886.93-.81 0-2.044-.91-3.36-.885-1.726.026-3.32.999-4.21 2.539-1.795 3.108-.46 7.71 1.29 10.232.852 1.234 1.87 2.62 3.21 2.572 1.288-.05 1.776-.832 3.331-.832 1.555 0 1.992.832 3.358.806 1.388-.024 2.27-1.262 3.122-2.5.984-1.434 1.39-2.821 1.414-2.892-.031-.014-2.722-1.043-2.751-4.102zM13.83 5.39c.71-.86 1.19-2.052 1.06-3.243-1.024.043-2.27.683-3.005 1.541-.66.766-1.236 1.99-1.082 3.156 1.144.089 2.314-.582 3.027-1.454z"/>
  </svg>
);

type Props = {
  onStart?: () => void;
};

const OAuthButtons = ({ onStart }: Props) => {
  const handleOAuth = async (provider: "google" | "apple") => {
    onStart?.();
    const result = await lovable.auth.signInWithOAuth(provider, {
      redirect_uri: `${window.location.origin}/`,
    });
    if (result?.error) {
      toast({
        title: "Anmeldung fehlgeschlagen",
        description:
          result.error.message ?? "Bitte versuche es erneut.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <PrimaryButton variant="outline" onClick={() => handleOAuth("google")}>
        <GoogleIcon />
        <span>Mit Google fortfahren</span>
      </PrimaryButton>
      <PrimaryButton variant="outline" onClick={() => handleOAuth("apple")}>
        <AppleIcon />
        <span>Mit Apple fortfahren</span>
      </PrimaryButton>
    </div>
  );
};

export default OAuthButtons;
