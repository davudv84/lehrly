import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Mail } from "lucide-react";
import { z } from "zod";
import LehrlyMark from "@/components/LehrlyMark";
import AuthInput from "@/components/auth/AuthInput";
import PrimaryButton from "@/components/auth/PrimaryButton";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().trim().email("Bitte gib eine gültige E-Mail ein.").max(255),
  password: z.string().min(8, "Mindestens 8 Zeichen.").max(72),
});


const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const fieldErrors: typeof errors = {};
      parsed.error.errors.forEach((err) => {
        const k = err.path[0] as "email" | "password";
        if (!fieldErrors[k]) fieldErrors[k] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    setSubmitting(false);
    if (error) {
      toast({
        title: "Anmeldung fehlgeschlagen",
        description:
          error.message === "Invalid login credentials"
            ? "E-Mail oder Passwort ist falsch."
            : error.message,
        variant: "destructive",
      });
      return;
    }
    navigate("/", { replace: true });
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-bg-base">
      <header
        className="flex items-center justify-center pb-2"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 24px)" }}
      >
        <LehrlyMark size={24} />
      </header>

      <main className="flex flex-1 flex-col px-6 pt-[80px] pb-10">
        <div className="text-center">
          <h1 className="text-[28px] font-bold tracking-[-0.02em] text-text-primary">
            Willkommen zurück
          </h1>
          <p className="mt-2 text-body text-text-secondary">
            Schön dich wiederzusehen.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3">
          <AuthInput
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="deine@email.de"
            icon={<Mail size={18} />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={submitting}
            error={errors.email}
          />
          <AuthInput
            passwordToggle
            autoComplete="current-password"
            placeholder="Dein Passwort"
            icon={<Lock size={18} />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={submitting}
            error={errors.password}
          />

          <div className="mt-1 flex items-center justify-between">
            <label className="flex items-center gap-2 text-[13px] font-medium text-text-secondary">
              <Checkbox
                checked={remember}
                onCheckedChange={(v) => setRemember(Boolean(v))}
                className="h-4 w-4 border-white/20 data-[state=checked]:bg-brand data-[state=checked]:border-brand"
              />
              <span>Angemeldet bleiben</span>
            </label>
            <Link
              to="/auth/forgot-password"
              className="text-[13px] font-medium text-brand hover:text-brand-hover"
            >
              Passwort vergessen?
            </Link>
          </div>

          <div className="mt-3">
            <PrimaryButton type="submit" loading={submitting}>
              Anmelden
            </PrimaryButton>
          </div>
        </form>

        <div className="mt-auto pt-10 text-center text-body-sm text-text-secondary">
          Noch kein Konto?{" "}
          <Link to="/auth/register" className="font-semibold text-brand hover:text-brand-hover">
            Registrieren
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Login;
