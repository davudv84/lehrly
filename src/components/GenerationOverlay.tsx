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
};

const GenerationOverlay = ({ active, finishing }: Props) => {
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
              {/* Calm spinner — monochrome with brand arc */}
              <div className="relative h-10 w-10">
                <svg viewBox="0 0 40 40" className="h-10 w-10">
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    stroke="hsl(var(--hairline) / 0.10)"
                    strokeWidth="2.5"
                    fill="none"
                  />
                  <motion.circle
                    cx="20"
                    cy="20"
                    r="16"
                    stroke="hsl(var(--brand-hover))"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray="30 100"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
                    style={{ transformOrigin: "20px 20px" }}
                  />
                </svg>
              </div>

              <p className="mt-5 font-display text-[18px] font-semibold tracking-[-0.015em] text-text-primary">
                Arbeitsblatt entsteht
              </p>
              <p className="mt-1 text-[13px] text-text-secondary">
                Lehrly bereitet alles druckfertig vor.
              </p>
            </div>

            <ul className="relative mt-7 space-y-3">
              {STEPS.map((label, i) => {
                const done = i < step || (finishing && i <= step);
                const isActive = i === step && !finishing;
                return (
                  <li
                    key={label}
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
                            ? "ring-1 ring-brand-hover"
                            : "ring-1 ring-hairline/15",
                      )}
                    >
                      {done ? (
                        <Check size={9} strokeWidth={3.5} />
                      ) : isActive ? (
                        <motion.span
                          className="h-1.5 w-1.5 rounded-full bg-brand-hover"
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1.2, repeat: Infinity }}
                        />
                      ) : null}
                    </span>
                    <span className="truncate">{label}</span>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GenerationOverlay;
