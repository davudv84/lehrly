import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, GraduationCap, BookOpen, FileText, X } from "lucide-react";
import LehrlyMark from "@/components/LehrlyMark";
import { cn } from "@/lib/utils";

export const ONBOARDED_KEY = "lehrly_onboarded";
export const GUEST_KEY = "is_guest";

const TOTAL = 5;

const markOnboarded = () => {
  try {
    localStorage.setItem(ONBOARDED_KEY, "true");
  } catch {
    /* ignore */
  }
};

const setGuest = () => {
  try {
    localStorage.setItem(GUEST_KEY, "true");
  } catch {
    /* ignore */
  }
};

const FirstLaunch = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0..4
  const [dir, setDir] = useState(1);

  const next = () => {
    setDir(1);
    setStep((s) => Math.min(TOTAL - 1, s + 1));
  };
  const skip = () => {
    setDir(1);
    setStep(TOTAL - 1);
  };

  const startGuest = () => {
    setGuest();
    markOnboarded();
    navigate("/generate", { replace: true });
  };
  const goRegister = () => {
    markOnboarded();
    navigate("/auth/register", { replace: true });
  };
  const goLogin = () => {
    markOnboarded();
    navigate("/auth/login", { replace: true });
  };

  return (
    <div
      className="relative min-h-dvh w-full overflow-hidden text-text-primary"
      style={{ background: "#0E0F11" }}
    >
      {/* Subtle radial green glow at top center */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2"
        style={{
          width: 560,
          height: 280,
          background:
            "radial-gradient(50% 100% at 50% 0%, rgba(16,185,129,0.10) 0%, transparent 70%)",
        }}
      />

      <div
        className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col"
        style={{
          paddingTop: "calc(env(safe-area-inset-top, 0px) + 56px)",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 32px)",
          paddingLeft: 24,
          paddingRight: 24,
        }}
      >
        {/* Progress dots */}
        <Dots active={step} />

        {/* Screens */}
        <div className="relative flex flex-1 flex-col">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              initial={{ opacity: 0, x: 24 * dir }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 * dir }}
              transition={{ duration: 0.24, ease: [0.22, 0.61, 0.36, 1] }}
              className="flex flex-1 flex-col"
            >
              {step === 0 && <ScreenWelcome />}
              {step === 1 && <ScreenValue />}
              {step === 2 && <ScreenHow />}
              {step === 3 && <ScreenKorrektur />}
              {step === 4 && (
                <ScreenStart
                  onGuest={startGuest}
                  onRegister={goRegister}
                  onLogin={goLogin}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer nav */}
        {step < TOTAL - 1 && <FooterNav onSkip={skip} onNext={next} />}
      </div>
    </div>
  );
};

/* ---------------- Shared bits ---------------- */

const Dots = ({ active }: { active: number }) => (
  <div className="flex items-center justify-center" style={{ gap: 8, marginTop: -32, marginBottom: 16 }}>
    {Array.from({ length: TOTAL }).map((_, i) => (
      <span
        key={i}
        style={{
          width: 6,
          height: 6,
          borderRadius: 999,
          background: i === active ? "#FFFFFF" : "rgba(255,255,255,0.25)",
          transition: "background 200ms",
        }}
      />
    ))}
  </div>
);

const FooterNav = ({ onSkip, onNext }: { onSkip: () => void; onNext: () => void }) => (
  <div className="flex items-center justify-between pt-4">
    <button
      onClick={onSkip}
      className="px-2 py-2 text-[13.5px] transition-colors"
      style={{ color: "rgba(255,255,255,0.55)" }}
    >
      Überspringen
    </button>
    <button
      onClick={onNext}
      className="flex h-11 items-center gap-1.5 rounded-pill px-5 text-[14px] font-semibold text-white transition-colors hover:opacity-90"
      style={{ background: "#10B981" }}
    >
      Weiter <ArrowRight size={15} />
    </button>
  </div>
);

const Headline = ({ children }: { children: React.ReactNode }) => (
  <h1
    className="font-bold tracking-[-0.02em] text-text-primary"
    style={{ fontSize: 28, lineHeight: 1.15 }}
  >
    {children}
  </h1>
);

const Body = ({ children }: { children: React.ReactNode }) => (
  <p
    className="mt-3"
    style={{ fontSize: 15, lineHeight: 1.55, color: "rgba(255,255,255,0.65)" }}
  >
    {children}
  </p>
);

/* ---------------- Screen 1 — Welcome ---------------- */

const ScreenWelcome = () => (
  <div className="flex flex-1 flex-col items-center justify-center text-center">
    <LehrlyMark size={26} />
    <div style={{ height: 28 }} />
    <Headline>Druckfertige Arbeitsblätter in 30 Sekunden.</Headline>
    <div className="max-w-[300px]">
      <Body>Für DaF/DaZ-Lehrkräfte. Von A1 bis C1.</Body>
    </div>
  </div>
);

/* ---------------- Screen 2 — Value ---------------- */

const ScreenValue = () => (
  <div className="flex flex-1 flex-col items-center text-center">
    <div className="flex flex-col items-center" style={{ marginTop: 24 }}>
      <span
        className="text-[11px] font-semibold uppercase"
        style={{ color: "#10B981", letterSpacing: "0.14em" }}
      >
        Dein AI-Assistent
      </span>
      <div style={{ height: 14 }} />
      <Headline>Sag, was du brauchst. Lehrly macht den Rest.</Headline>
      <div className="max-w-[320px]">
        <Body>
          Niveau, Thema, Aufgabentyp wählen — fertig. Keine leeren Word-Vorlagen mehr.
        </Body>
      </div>
    </div>

    {/* Worksheet mock */}
    <div className="relative mt-10 flex flex-1 items-center justify-center">
      <div
        className="relative bg-white shadow-2xl"
        style={{
          width: 200,
          height: 260,
          borderRadius: 8,
          transform: "rotate(-3deg)",
          padding: 18,
        }}
      >
        <div style={{ height: 8, width: "70%", borderRadius: 2, background: "#E5E7EB" }} />
        <div style={{ height: 6, width: "45%", borderRadius: 2, background: "#EEF0F2", marginTop: 8 }} />
        <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 10 }}>
          {[100, 90, 95, 80, 92, 70].map((w, i) => (
            <div key={i} style={{ height: 6, width: `${w}%`, borderRadius: 2, background: "#E5E7EB" }} />
          ))}
        </div>
        {/* green check corner */}
        <div
          className="absolute"
          style={{
            right: 12,
            bottom: 12,
            width: 26,
            height: 26,
            borderRadius: 999,
            background: "#10B981",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Check size={15} color="#fff" strokeWidth={3} />
        </div>
      </div>
    </div>
  </div>
);

/* ---------------- Screen 3 — How ---------------- */

const HOW_STEPS = [
  { n: 1, title: "Niveau wählen", desc: "A1 bis C1 — passgenau für deine Lerngruppe", Icon: GraduationCap },
  { n: 2, title: "Thema & Aufgaben", desc: "Lückentext, Dialog, Grammatik & mehr", Icon: BookOpen },
  { n: 3, title: "PDF herunterladen", desc: "Druckfertig mit Lösungsblatt", Icon: FileText },
];

const ScreenHow = () => (
  <div className="flex flex-1 flex-col" style={{ paddingTop: 24 }}>
    <Headline>
      In drei Schritten
      <br />
      zum Arbeitsblatt
    </Headline>

    <ul className="mt-8 flex w-full flex-col" style={{ gap: 10 }}>
      {HOW_STEPS.map(({ n, title, desc, Icon }) => (
        <li
          key={n}
          className="flex items-center"
          style={{
            background: "rgba(255,255,255,0.04)",
            borderRadius: 12,
            padding: 14,
            gap: 14,
          }}
        >
          <span
            className="flex shrink-0 items-center justify-center text-white"
            style={{
              width: 36,
              height: 36,
              borderRadius: 999,
              background: "#10B981",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            {n}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[14.5px] font-semibold text-text-primary">{title}</p>
            <p className="mt-0.5 text-[12.5px]" style={{ color: "rgba(255,255,255,0.55)" }}>
              {desc}
            </p>
          </div>
          <Icon size={18} color="rgba(255,255,255,0.35)" />
        </li>
      ))}
    </ul>
  </div>
);

/* ---------------- Screen 4 — Korrektur ---------------- */

const ScreenKorrektur = () => (
  <div className="flex flex-1 flex-col" style={{ paddingTop: 16 }}>
    <span
      className="inline-flex items-center self-start rounded-pill px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.12em] text-white"
      style={{ background: "#10B981" }}
    >
      Neu
    </span>
    <div style={{ height: 16 }} />
    <Headline>
      Foto scannen. Korrektur in Sekunden.
    </Headline>
    <div className="max-w-[340px]">
      <Body>
        Fotografiere ein ausgefülltes Arbeitsblatt — die KI vergleicht es mit dem
        Lösungsschlüssel und gibt eine Note.
      </Body>
    </div>

    {/* Worksheet mock with marks */}
    <div className="relative mt-8 flex flex-1 items-center justify-center">
      <div
        className="relative bg-white shadow-2xl"
        style={{
          width: 220,
          height: 280,
          borderRadius: 8,
          padding: 20,
        }}
      >
        <div style={{ height: 8, width: "60%", borderRadius: 2, background: "#E5E7EB" }} />
        <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { w: 90, ok: true },
            { w: 80, ok: true },
            { w: 95, ok: false },
            { w: 70, ok: true },
            { w: 88, ok: true },
          ].map((r, i) => (
            <div key={i} className="flex items-center" style={{ gap: 8 }}>
              <div style={{ height: 6, flex: 1, borderRadius: 2, background: "#E5E7EB", maxWidth: `${r.w}%` }} />
              {r.ok ? (
                <Check size={14} color="#10B981" strokeWidth={3} />
              ) : (
                <X size={14} color="#EF4444" strokeWidth={3} />
              )}
            </div>
          ))}
        </div>

        {/* floating points chip */}
        <div
          className="absolute flex items-center justify-center text-[11.5px] font-semibold text-white"
          style={{
            top: -12,
            right: -10,
            background: "#1A1B1E",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 999,
            padding: "6px 10px",
          }}
        >
          17 / 20 Punkte
        </div>
      </div>
    </div>
  </div>
);

/* ---------------- Screen 5 — Start ---------------- */

const ScreenStart = ({
  onGuest,
  onRegister,
  onLogin,
}: {
  onGuest: () => void;
  onRegister: () => void;
  onLogin: () => void;
}) => (
  <div className="flex flex-1 flex-col">
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <Headline>Bereit?</Headline>
      <div className="max-w-[300px]">
        <Body>3 Arbeitsblätter gratis. Ohne Anmeldung.</Body>
      </div>
    </div>

    <div className="flex flex-col items-center" style={{ gap: 12 }}>
      <button
        onClick={onGuest}
        className="w-full rounded-pill text-[15px] font-semibold text-white transition-opacity hover:opacity-90"
        style={{ height: 52, background: "#10B981" }}
      >
        Als Gast starten
      </button>
      <button
        onClick={onRegister}
        className="w-full rounded-pill bg-transparent text-[15px] font-semibold text-text-primary transition-colors"
        style={{ height: 52, border: "1px solid rgba(255,255,255,0.4)" }}
      >
        Konto erstellen
      </button>
      <button
        onClick={onLogin}
        className="text-[13.5px] font-medium transition-colors"
        style={{ color: "rgba(255,255,255,0.65)", marginTop: 4 }}
      >
        Ich habe schon ein Konto
      </button>
      <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.45)" }}>
        Kostenlos · Keine Kreditkarte
      </p>
    </div>
  </div>
);

export default FirstLaunch;
