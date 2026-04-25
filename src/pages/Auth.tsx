import AppHeader from "@/components/AppHeader";

const AuthLayout = ({
  children,
  eyebrow,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) => {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-bg-base">
      <AppHeader />
      <main className="flex flex-1 flex-col px-6 pt-6 pb-10">
        <div className="mb-8">
          {eyebrow && <p className="section-label mb-3">{eyebrow}</p>}
          <h1 className="text-h1 text-text-primary">{title}</h1>
          {subtitle && (
            <p className="mt-3 text-body text-text-secondary">{subtitle}</p>
          )}
        </div>
        {children}
      </main>
    </div>
  );
};

export const Login = () => (
  <AuthLayout
    eyebrow="Anmelden"
    title="Willkommen zurück."
    subtitle="Melde dich an, um deine Arbeitsblätter zu öffnen."
  >
    <div className="rounded-card border border-white/[0.06] bg-surface px-5 py-6 text-center">
      <p className="text-body text-text-secondary">Login-Formular folgt in Phase 2.</p>
    </div>
  </AuthLayout>
);

export const Register = () => (
  <AuthLayout
    eyebrow="Registrieren"
    title="Lehrly starten."
    subtitle="Erstelle ein Konto, um Arbeitsblätter zu generieren und zu speichern."
  >
    <div className="rounded-card border border-white/[0.06] bg-surface px-5 py-6 text-center">
      <p className="text-body text-text-secondary">Registrierungs-Formular folgt in Phase 2.</p>
    </div>
  </AuthLayout>
);

export default Login;
