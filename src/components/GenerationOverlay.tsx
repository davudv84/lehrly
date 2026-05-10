import { useEffect, useState } from "react";
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
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!active) {
      setStep(0);
      return;
    }
    if (finishing) {
      setStep(STEPS.length - 1);
      return;
    }
    const id = setInterval(() => {
      setStep((s) => Math.min(s + 1, STEPS.length - 2));
    }, 1300);
    return () => clearInterval(id);
  }, [active, finishing]);

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
                const done = i < step || (finishing && i <= step);
                const isActive = i === step && !finishing;
                return (
                  <motion.li
                    key={label}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.06 }}
                    className={cn(
                      "flex items-center gap-3 text-[13px] transition-colors duration-300",
                      done
                        ? "text-text-secondary"
                        : isActive
                          ? "text-text-primary"
                          : "text-text-tertiary/60",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded-full transition-colors",
                        done
                          ? "bg-brand text-primary-foreground"
                          : isActive
                            ? "ring-1 ring-white/40"
                            : "ring-1 ring-hairline/15",
                      )}
                    >
                      {done ? (
                        <Check size={9} strokeWidth={3.5} />
                      ) : isActive ? (
                        <motion.span
                          className="h-1.5 w-1.5 rounded-full bg-white"
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1.2, repeat: Infinity }}
                        />
                      ) : null}
                    </span>
                    <span className="truncate">{label}</span>
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
