import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, FileText, Sparkles, GraduationCap } from "lucide-react";
import LehrlyMark from "@/components/LehrlyMark";
import { cn } from "@/lib/utils";

export const ONBOARDED_KEY = "lehrly_onboarded";

type Step = 0 | 1 | 2 | 3; // 0 = landing, 1-3 = onboarding

const markOnboarded = () => {
  try {
    localStorage.setItem(ONBOARDED_KEY, "true");
  } catch {
    /* ignore */
  }
};

const FirstLaunch = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(0);

  const goRegister = () => {
    markOnboarded();
    navigate("/auth/register", { replace: true });
  };
  const goLogin = () => {
    markOnboarded();
    navigate("/auth/login", { replace: true });
  };
  const goGuest = () => {
    markOnboarded();
    navigate("/", { replace: true });
  };

  return (
    <div
      className="relative min-h-dvh w-full overflow-hidden bg-bg-base text-text-primary"
      style={{
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {/* soft brand glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[60vh] opacity-60"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 0%, hsl(var(--brand) / 0.18) 0%, transparent 70%)",
        }}
      />

      <AnimatePresence mode="wait">
        {step === 0 && <Landing key="landing" onStart={() => setStep(1)} />}
        {step === 1 && (
          <Welcome
            key="welcome"
            onSkip={() => setStep(3)}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <HowItWorks
            key="how"
            onSkip={() => setStep(3)}
            onNext={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <GetStarted
            key="get-started"
            onRegister={goRegister}
            onLogin={goLogin}
            onGuest={goGuest}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

/* ---------------- Screen 1 — Landing ---------------- */

const Landing = ({ onStart }: { onStart: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.32 }}
    className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pb-8 pt-10"
  >
    <div className="flex justify-center">
      <span className="inline-flex items-center gap-1.5 rounded-pill bg-brand-soft px-3 py-1 text-[11.5px] font-medium text-brand-hover ring-1 ring-brand/30">
        <span className="h-1.5 w-1.5 rounded-full bg-brand" />
        Für DaF/DaZ-Lehrkräfte
      </span>
    </div>

    <div className="mt-5 flex justify-center">
      <LehrlyMark size={22} />
    </div>

    <div className="mt-auto flex flex-col items-center text-center">
      <h1 className="font-display text-[34px] font-bold leading-[1.05] tracking-[-0.025em]">
        Arbeitsblätter,
        <br />
        in Sekunden.
      </h1>
      <p className="mt-4 max-w-[300px] text-[14px] leading-relaxed text-text-secondary">
        Lehrly erstellt druckfertige DaF/DaZ-Arbeitsblätter — mit KI.
      </p>

      <button
        onClick={onStart}
        className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-pill bg-brand text-[14px] font-medium text-primary-foreground transition-colors hover:bg-brand-hover active:scale-[0.99]"
      >
        Kostenlos starten <ArrowRight size={15} />
      </button>
      <p className="mt-3 text-[11.5px] text-text-tertiary">
        Kein Konto nötig · 3 Blätter kostenlos
      </p>
    </div>

    <div className="mt-8 flex items-center justify-center gap-2">
      <FeaturePill icon={<GraduationCap size={12} />}>A1–C1</FeaturePill>
      <FeaturePill icon={<Sparkles size={12} />}>30 Sek.</FeaturePill>
      <FeaturePill icon={<FileText size={12} />}>PDF</FeaturePill>
    </div>

    <footer className="mt-6 flex items-center justify-center gap-3 text-[10.5px] uppercase tracking-[0.12em] text-text-tertiary/70">
      <span>Impressum</span>
      <span>·</span>
      <span>Datenschutz</span>
      <span>·</span>
      <span>Kontakt</span>
    </footer>
  </motion.div>
);

const FeaturePill = ({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
}) => (
  <span className="inline-flex items-center gap-1.5 rounded-pill bg-surface-2 px-3 py-1.5 text-[11.5px] font-medium text-text-secondary ring-1 ring-hairline/15">
    <span className="text-brand-hover">{icon}</span>
    {children}
  </span>
);

/* ---------------- Onboarding shell with progress dots ---------------- */

const Dots = ({ active }: { active: 0 | 1 | 2 }) => (
  <div className="flex items-center justify-center gap-1.5 pt-3">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className={cn(
          "h-1 rounded-full transition-all duration-300",
          i === active ? "w-6 bg-brand" : "w-1.5 bg-hairline/20",
        )}
      />
    ))}
  </div>
);

const StepFrame = ({
  active,
  children,
  bottom,
}: {
  active: 0 | 1 | 2;
  children: React.ReactNode;
  bottom: React.ReactNode;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
    className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pb-8"
  >
    <Dots active={active} />
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      {children}
    </div>
    <div className="pt-4">{bottom}</div>
  </motion.div>
);

const SkipNextBar = ({
  onSkip,
  onNext,
}: {
  onSkip: () => void;
  onNext: () => void;
}) => (
  <div className="flex items-center justify-between">
    <button
      onClick={onSkip}
      className="px-2 py-2 text-[13px] text-text-tertiary transition-colors hover:text-text-secondary"
    >
      Überspringen
    </button>
    <button
      onClick={onNext}
      className="flex h-11 items-center gap-1.5 rounded-pill bg-brand px-5 text-[13.5px] font-medium text-primary-foreground transition-colors hover:bg-brand-hover"
    >
      Weiter <ArrowRight size={14} />
    </button>
  </div>
);

/* ---------------- Screen 2 — Welcome ---------------- */

const Welcome = ({
  onSkip,
  onNext,
}: {
  onSkip: () => void;
  onNext: () => void;
}) => (
  <StepFrame active={0} bottom={<SkipNextBar onSkip={onSkip} onNext={onNext} />}>
    <LehrlyMark size={36} />
    <h2 className="mt-6 font-display text-[26px] font-bold tracking-[-0.02em]">
      Willkommen bei Lehrly
    </h2>
    <p className="mt-3 max-w-[280px] text-[14px] leading-relaxed text-text-secondary">
      Dein KI-Assistent für DaF/DaZ-Arbeitsblätter.
    </p>
  </StepFrame>
);

/* ---------------- Screen 3 — How it works ---------------- */

const STEPS = [
  {
    n: 1,
    title: "Niveau wählen",
    desc: "A1 bis C1",
    icon: <GraduationCap size={16} />,
  },
  {
    n: 2,
    title: "Thema & Aufgaben",
    desc: "Lückentext, Grammatik & mehr",
    icon: <Sparkles size={16} />,
  },
  {
    n: 3,
    title: "PDF herunterladen",
    desc: "Druckfertig mit Lösungsblatt",
    icon: <FileText size={16} />,
  },
];

const HowItWorks = ({
  onSkip,
  onNext,
}: {
  onSkip: () => void;
  onNext: () => void;
}) => (
  <StepFrame active={1} bottom={<SkipNextBar onSkip={onSkip} onNext={onNext} />}>
    <h2 className="font-display text-[24px] font-bold leading-tight tracking-[-0.02em]">
      In drei Schritten
      <br />
      zum Arbeitsblatt
    </h2>

    <ul className="mt-8 flex w-full flex-col gap-2.5 text-left">
      {STEPS.map((s) => (
        <li
          key={s.n}
          className="flex items-center gap-3 rounded-card bg-surface-1 p-3.5 ring-1 ring-hairline/10"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-hover ring-1 ring-brand/20 text-[12.5px] font-semibold tabular-nums">
            {s.n}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13.5px] font-semibold text-text-primary">
              {s.title}
            </p>
            <p className="mt-0.5 text-[12px] text-text-tertiary">{s.desc}</p>
          </div>
          <span className="text-text-tertiary/70">{s.icon}</span>
        </li>
      ))}
    </ul>
  </StepFrame>
);

/* ---------------- Screen 4 — Get Started ---------------- */

const GetStarted = ({
  onRegister,
  onLogin,
  onGuest,
}: {
  onRegister: () => void;
  onLogin: () => void;
  onGuest: () => void;
}) => (
  <StepFrame
    active={2}
    bottom={
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={onRegister}
          className="flex h-12 w-full items-center justify-center rounded-pill bg-brand text-[14px] font-medium text-primary-foreground transition-colors hover:bg-brand-hover active:scale-[0.99]"
        >
          Konto erstellen
        </button>
        <button
          onClick={onLogin}
          className="text-[13px] font-medium text-text-secondary transition-colors hover:text-text-primary"
        >
          Ich habe schon ein Konto
        </button>
        <button
          onClick={onGuest}
          className="text-[11.5px] text-text-tertiary transition-colors hover:text-text-secondary"
        >
          Erst mal als Gast ausprobieren
        </button>
      </div>
    }
  >
    <h2 className="font-display text-[26px] font-bold tracking-[-0.02em]">
      Lass uns loslegen
    </h2>
    <p className="mt-3 max-w-[280px] text-[14px] leading-relaxed text-text-secondary">
      Wir richten dich kurz ein — dauert keine Minute.
    </p>
  </StepFrame>
);

export default FirstLaunch;
