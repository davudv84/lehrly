import { useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Mail, User } from "lucide-react";
import { z } from "zod";
import LehrlyMark from "@/components/LehrlyMark";
import AuthInput from "@/components/auth/AuthInput";
import PrimaryButton from "@/components/auth/PrimaryButton";
import OAuthButtons from "@/components/auth/OAuthButtons";
import PasswordStrength, { getPasswordStrength } from "@/components/auth/PasswordStrength";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Mindestens 2 Zeichen.").max(80),
  email: z.string().trim().email("Bitte gib eine gültige E-Mail ein.").max(255),
  password: z.string().min(8, "Mindestens 8 Zeichen.").max(72),
});

const Divider = () => (
  <div className="my-6 flex items-center gap-3">
    <span className="h-px flex-1 bg-white/10" />
    <span className="text-caption text-text-tertiary">oder</span>
    <span className="h-px flex-1 bg-white/10" />
  </div>
);

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const strong = useMemo(() => getPasswordStrength(password) >= 2, [password]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = registerSchema.safeParse({ name, email, password });
    if (!parsed.success) {
      const fieldErrors: typeof errors = {};
      parsed.error.errors.forEach((err) => {
        const k = err.path[0] as "name" | "email" | "password";
        if (!fieldErrors[k]) fieldErrors[k] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    if (!strong) {
      setErrors({ password: "Bitte wähle ein etwas stärkeres Passwort." });
      return;
    }
    setErrors({});
    setSubmitting(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { name: parsed.data.name },
      },
    });
    setSubmitting(false);
    if (error) {
      toast({
        title: "Registrierung fehlgeschlagen",
        description:
          error.message === "User already registered"
            ? "Diese E-Mail ist bereits registriert."
            : error.message,
        variant: "destructive",
      });
      return;
    }
    navigate("/onboarding", { replace: true });
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
            Konto erstellen
          </h1>
          <p className="mt-2 text-body text-text-secondary">
            Kostenlos. Keine Kreditkarte nötig.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3">
          <AuthInput
            autoComplete="name"
            placeholder="Dein Name"
            icon={<User size={18} />}
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={submitting}
            error={errors.name}
          />
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
          <div>
            <AuthInput
              passwordToggle
              autoComplete="new-password"
              placeholder="Mindestens 8 Zeichen"
              icon={<Lock size={18} />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
              error={errors.password}
            />
            <PasswordStrength value={password} />
          </div>

          <p className="px-1 pt-1 text-caption text-text-tertiary">
            Mit der Registrierung akzeptierst du unsere{" "}
            <a href="/terms" className="text-brand hover:text-brand-hover">
              AGB
            </a>{" "}
            und{" "}
            <a href="/privacy" className="text-brand hover:text-brand-hover">
              Datenschutzerklärung
            </a>
            .
          </p>

          <div className="mt-3">
            <PrimaryButton type="submit" loading={submitting}>
              Konto erstellen
            </PrimaryButton>
          </div>
        </form>

        <Divider />
        <OAuthButtons />

        <div className="mt-auto pt-10 text-center text-body-sm text-text-secondary">
          Schon ein Konto?{" "}
          <Link to="/auth/login" className="font-semibold text-brand hover:text-brand-hover">
            Anmelden
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Register;
