import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Edit3, FileText, GraduationCap, Sparkles } from "lucide-react";
import LehrlyMark from "@/components/LehrlyMark";
import PrimaryButton from "@/components/auth/PrimaryButton";
import TapButton from "@/components/TapButton";
import { cn } from "@/lib/utils";

type Slide = {
  key: string;
  title: React.ReactNode;
  subtitle?: string;
  body: React.ReactNode;
};

const Step = ({
  n,
  icon,
  title,
  body,
}: {
  n: string;
  icon: React.ReactNode;
  title: string;
  body: string;
}) => (
  <div className="flex items-start gap-3 rounded-card border border-white/[0.06] bg-surface p-4">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill border border-brand/30 bg-brand/10 text-[14px] font-semibold text-brand">
      {n}
    </div>
    <div className="flex-1 pt-0.5">
      <p className="text-[15px] font-semibold text-text-primary">{title}</p>
      <p className="mt-0.5 text-[13px] text-text-secondary">{body}</p>
    </div>
    <span className="mt-1.5">{icon}</span>
  </div>
);


const SLIDES: Slide[] = [
  {
    key: "welcome",
    title: (
      <>
        <div className="flex justify-center pt-4">
          <span className="brand-dot inline-block h-3 w-3 rounded-full" />
        </div>
        <h1 className="mt-6 text-center text-[28px] font-bold tracking-[-0.02em] text-text-primary">
          Lehrly
        </h1>
      </>
    ),
    body: (
      <div className="text-center">
        <h2 className="text-[24px] font-bold tracking-[-0.02em] text-text-primary">
          Willkommen bei Lehrly
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-text-secondary">
          Dein KI-Assistent für DaF/DaZ-Arbeitsblätter.
        </p>
      </div>
    ),
  },
  {
    key: "how",
    title: null,
    body: (
      <div>
        <h2 className="text-center text-[24px] font-bold leading-tight tracking-[-0.02em] text-text-primary">
          In drei Schritten zum
          <br />
          Arbeitsblatt
        </h2>
        <div className="mt-8 flex flex-col gap-3">
          <Step
            n="1"
            icon={<Sparkles size={18} className="text-brand" />}
            title="Niveau wählen"
            body="A1 bis C1 — passgenau für deine Lerngruppe"
          />
          <Step
            n="2"
            icon={<Edit3 size={18} className="text-brand" />}
            title="Thema & Aufgaben"
            body="Lückentext, Dialog, Grammatik & mehr"
          />
          <Step
            n="3"
            icon={<FileText size={18} className="text-brand" />}
            title="PDF herunterladen"
            body="Druckfertig mit Lösungsblatt"
          />
        </div>
      </div>
    ),
  },
  {
    key: "go",
    title: null,
    body: (
      <div className="text-center">
        <div
          className="mx-auto flex h-20 w-20 items-center justify-center bg-brand-gradient shadow-brand-glow"
          style={{ borderRadius: "22%" }}
        >
          <GraduationCap size={36} className="text-white" />
        </div>
        <h2 className="mt-8 text-[28px] font-bold tracking-[-0.02em] text-text-primary">
          Lass uns loslegen
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-text-secondary">
          Wir richten dich kurz ein — dauert keine Minute.
        </p>
      </div>
    ),
  },
];

const Step = ({
  n,
  icon,
  title,
  body,
}: {
  n: string;
  icon: React.ReactNode;
  title: string;
  body: string;
}) => (
  <div className="flex items-start gap-3 rounded-card border border-white/[0.06] bg-surface p-4">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill border border-brand/30 bg-brand/10 text-[14px] font-semibold text-brand">
      {n}
    </div>
    <div className="flex-1 pt-0.5">
      <p className="text-[15px] font-semibold text-text-primary">{title}</p>
      <p className="mt-0.5 text-[13px] text-text-secondary">{body}</p>
    </div>
    <span className="mt-1.5">{icon}</span>
  </div>
);

const Intro = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const isLast = step === SLIDES.length - 1;

  const next = () => {
    if (isLast) navigate("/auth/register");
    else setStep((s) => s + 1);
  };

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col overflow-hidden bg-bg-base">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full opacity-50 blur-3xl"
        style={{ background: "radial-gradient(circle, hsl(var(--brand) / 0.18), transparent 65%)" }}
      />

      <header
        className="relative z-10 flex items-center justify-between px-6 pt-4"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)" }}
      >
        <LehrlyMark size={18} />
        <TapButton
          onClick={() => navigate("/auth/register")}
          className="text-[13px] font-medium text-text-tertiary hover:text-text-secondary"
        >
          Überspringen
        </TapButton>
      </header>

      {/* Dots */}
      <div className="relative z-10 mt-6 flex justify-center gap-1.5">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            aria-label={`Schritt ${i + 1}`}
            className={cn(
              "h-1.5 rounded-pill transition-all",
              i === step ? "w-6 bg-brand" : "w-1.5 bg-white/20",
            )}
          />
        ))}
      </div>

      <main className="relative z-10 flex flex-1 flex-col justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={SLIDES[step].key}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.24, ease: [0.32, 0.72, 0, 1] }}
          >
            {SLIDES[step].title}
            <div className="mt-2">{SLIDES[step].body}</div>
          </motion.div>
        </AnimatePresence>
      </main>

      <footer
        className="relative z-10 flex items-center justify-between gap-4 px-6 pb-10"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 32px)" }}
      >
        {isLast ? (
          <div className="flex w-full flex-col gap-3">
            <PrimaryButton onClick={() => navigate("/auth/register")}>
              Konto erstellen
            </PrimaryButton>
            <Link
              to="/auth/login"
              className="text-center text-[13px] font-medium text-text-secondary hover:text-text-primary"
            >
              Ich habe schon ein Konto
            </Link>
            <button
              onClick={() => navigate("/auth/register")}
              className="text-center text-[12px] text-text-tertiary hover:text-text-secondary"
            >
              Erst mal als Gast ausprobieren
            </button>
          </div>
        ) : (
          <>
            <TapButton
              onClick={() => navigate("/auth/register")}
              className="text-[14px] font-medium text-text-tertiary hover:text-text-secondary"
            >
              Überspringen
            </TapButton>
            <div className="w-40">
              <PrimaryButton onClick={next}>Weiter →</PrimaryButton>
            </div>
          </>
        )}
      </footer>
    </div>
  );
};

export default Intro;
