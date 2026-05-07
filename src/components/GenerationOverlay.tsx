import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  "Thema wird analysiert",
  "Wortschatz wird aufgebaut",
  "Aufgaben werden formuliert",
  "Lösungen werden geprüft",
  "PDF wird vorbereitet",
];

type Props = {
  active: boolean;
  /** When true, jump to last step + check (used right before navigate). */
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
    }, 1100);
    return () => clearInterval(id);
  }, [active, finishing]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-bg-base/80 backdrop-blur-xl"
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 0.61, 0.36, 1] }}
            className="glass relative mx-5 w-full max-w-sm overflow-hidden rounded-large border border-white/[0.08] bg-bg-elevated/95 p-6 shadow-2xl"
          >
            {/* Glow */}
            <div
              aria-hidden
              className="pointer-events-none absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-brand/30 blur-3xl"
            />

            <div className="relative flex flex-col items-center">
              <div className="relative flex h-16 w-16 items-center justify-center">
                <motion.div
                  className="absolute inset-0 rounded-full bg-brand/20 blur-xl"
                  animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0.7, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  className="relative flex h-16 w-16 items-center justify-center rounded-full bg-brand-gradient shadow-brand-glow"
                  animate={{ rotate: [0, 4, -4, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Sparkles size={26} className="text-white" />
                </motion.div>
              </div>
              <p className="mt-5 text-[16px] font-semibold tracking-[-0.01em] text-text-primary">
                Wird erstellt
              </p>
              <p className="mt-1 text-[12.5px] text-text-tertiary">
                Lehrly-AI baut dein Arbeitsblatt …
              </p>
            </div>

            <ul className="relative mt-6 space-y-2.5">
              {STEPS.map((label, i) => {
                const done = i < step || (finishing && i <= step);
                const active = i === step && !finishing;
                return (
                  <li
                    key={label}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-2.5 py-1.5 text-[12.5px] transition-colors",
                      done
                        ? "text-text-secondary"
                        : active
                          ? "bg-brand/8 text-text-primary"
                          : "text-text-tertiary/70",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded-full border transition-colors",
                        done
                          ? "border-brand bg-brand text-white"
                          : active
                            ? "border-brand"
                            : "border-white/15",
                      )}
                    >
                      {done ? (
                        <Check size={10} strokeWidth={3} />
                      ) : active ? (
                        <motion.span
                          className="h-1.5 w-1.5 rounded-full bg-brand"
                          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
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
