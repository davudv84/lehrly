import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  "Thema wird analysiert",
  "Pädagogische Progression wird aufgebaut",
  "Aufgaben werden formuliert",
  "Lösungen werden überprüft",
  "Druckversion wird vorbereitet",
];

// Target completion percentage for each step (with slight randomization)
const STEP_TARGETS = [0.18, 0.38, 0.58, 0.78, 1.0];

// Sub-messages cycled while a step lingers (when backend is slow)
const SUB_MESSAGES: Record<number, string[]> = {
  0: ["Kontext wird erfasst…", "Niveau wird abgestimmt…"],
  1: ["Lernziele werden geordnet…", "Schwierigkeit wird austariert…"],
  2: ["Formulierungen werden verfeinert…", "Beispiele werden gewählt…"],
  3: ["Lösungen werden überprüft…", "Konsistenz wird geprüft…"],
  4: ["Layout wird vorbereitet…", "Druckversion wird gerendert…"],
};

// Estimated nominal duration; backend may be faster or slower
const ESTIMATED_MS = 22000;
const MIN_DURATION_MS = 3500;
const FINISH_RAMP_MS = 700;

type Props = {
  active: boolean;
  finishing?: boolean;
  onCancel?: () => void;
};

const DocumentDraw = () => (
  <svg viewBox="0 0 56 64" className="h-12 w-12" fill="none">
    <motion.path
      d="M8 4 H38 L48 14 V60 H8 Z"
      stroke="hsl(var(--text-primary))"
      strokeWidth="2"
      strokeLinejoin="round"
      initial={{ pathLength: 0, opacity: 0.4 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 1.2, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
    />
    <motion.path
      d="M38 4 V14 H48"
      stroke="hsl(var(--text-primary))"
      strokeWidth="2"
      strokeLinejoin="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.8, delay: 0.3, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
    />
    {[26, 34, 42, 50].map((y, i) => (
      <motion.line
        key={y}
        x1="14"
        x2={i % 2 === 0 ? "40" : "34"}
        y1={y}
        y2={y}
        stroke="hsl(var(--text-tertiary))"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          duration: 0.6,
          delay: 0.4 + i * 0.18,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
    ))}
  </svg>
);

const GenerationOverlay = ({ active, finishing, onCancel }: Props) => {
  const [progress, setProgress] = useState(0); // 0..1
  const [subIdx, setSubIdx] = useState(0);
  const startRef = useRef<number>(0);
  const finishStartRef = useRef<number | null>(null);
  // Per-step random jitter so timing feels human, not robotic
  const targetsRef = useRef<number[]>(STEP_TARGETS);

  useEffect(() => {
    if (!active) {
      setProgress(0);
      finishStartRef.current = null;
      return;
    }
    startRef.current = performance.now();
    finishStartRef.current = null;
    // Apply small jitter to step targets (±2.5%), keep last at 1
    targetsRef.current = STEP_TARGETS.map((t, i) =>
      i === STEP_TARGETS.length - 1 ? 1 : Math.max(0.05, Math.min(0.95, t + (Math.random() - 0.5) * 0.05)),
    );

    let raf = 0;
    const tick = () => {
      const now = performance.now();
      const elapsed = now - startRef.current;

      let p: number;
      if (finishing) {
        if (finishStartRef.current == null) finishStartRef.current = now;
        const baseAtFinish = Math.max(progress, 0);
        const finishElapsed = now - finishStartRef.current;
        // Ensure minimum total visible duration
        const minRemaining = Math.max(0, MIN_DURATION_MS - elapsed);
        const ramp = Math.max(FINISH_RAMP_MS, minRemaining);
        p = Math.min(1, baseAtFinish + (1 - baseAtFinish) * (finishElapsed / ramp));
      } else {
        // Cap at 0.92 so we don't reach the last step without backend completion
        p = Math.min(0.92, elapsed / ESTIMATED_MS);
      }
      setProgress(p);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, finishing]);

  // Determine current step from progress + targets
  const currentStep = (() => {
    const targets = targetsRef.current;
    for (let i = 0; i < targets.length; i++) {
      if (progress < targets[i]) return i;
    }
    return targets.length - 1;
  })();

  // Cycle sub-messages while waiting on the same step
  useEffect(() => {
    if (!active) return;
    setSubIdx(0);
    const id = setInterval(() => setSubIdx((s) => s + 1), 2400);
    return () => clearInterval(id);
  }, [active, currentStep]);

  const subList = SUB_MESSAGES[currentStep] ?? [];
  const subMessage = subList.length ? subList[subIdx % subList.length] : null;

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.24 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-bg-base/85 backdrop-blur-2xl"
        >
          <motion.div
            initial={{ scale: 0.98, opacity: 0, y: 6 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 0.61, 0.36, 1] }}
            className="surface-card relative mx-5 w-full max-w-sm bg-surface-2 p-7 shadow-elevated"
          >
            <div className="relative flex flex-col items-center">
              <DocumentDraw />

              <p className="mt-5 font-display text-[18px] font-semibold tracking-[-0.015em] text-text-primary">
                Arbeitsblatt entsteht
              </p>
              <p className="mt-1 text-[13px] text-text-secondary">
                Lehrly bereitet alles druckfertig vor.
              </p>
              <p className="mt-1 text-[12px] text-text-tertiary">
                Dauert ca. 20–30 Sekunden
              </p>
            </div>

            <ul className="relative mt-6 space-y-3">
              {STEPS.map((label, i) => {
                const done = i < currentStep || (progress >= 1 && i <= currentStep);
                const isActive = i === currentStep && progress < 1;
                return (
                  <motion.li
                    key={label}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.05 }}
                    className={cn(
                      "flex flex-col gap-1 text-[13px] transition-colors duration-300",
                      done
                        ? "text-text-secondary"
                        : isActive
                          ? "text-text-primary"
                          : "text-text-tertiary/55",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "relative flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-colors",
                          done
                            ? "bg-brand text-primary-foreground"
                            : isActive
                              ? "ring-1 ring-white/50"
                              : "ring-1 ring-hairline/15",
                        )}
                      >
                        {done ? (
                          <Check size={9} strokeWidth={3.5} />
                        ) : isActive ? (
                          <motion.span
                            className="absolute inset-0 rounded-full border border-white/70 border-t-transparent"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
                          />
                        ) : null}
                      </span>
                      <span className="truncate">{label}</span>
                    </div>
                    {isActive && subMessage && (
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={subMessage}
                          initial={{ opacity: 0, y: 2 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -2 }}
                          transition={{ duration: 0.25 }}
                          className="ml-7 text-[11.5px] text-text-tertiary"
                        >
                          {subMessage}
                        </motion.span>
                      </AnimatePresence>
                    )}
                  </motion.li>
                );
              })}
            </ul>

            {onCancel && (
              <button
                onClick={onCancel}
                className="mt-6 block w-full text-center text-[12.5px] text-text-tertiary hover:text-text-primary transition-colors"
              >
                Abbrechen
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GenerationOverlay;
