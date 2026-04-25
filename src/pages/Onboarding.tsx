import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import LehrlyMark from "@/components/LehrlyMark";
import PrimaryButton from "@/components/auth/PrimaryButton";
import TapButton from "@/components/TapButton";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const NIVEAUS = ["A1", "A2", "B1", "B2", "C1"] as const;
const KURSTYPEN = [
  "Integrationskurs",
  "Berufssprachkurs",
  "Alphabetisierungskurs",
  "Allgemeiner Deutschkurs",
] as const;

type Niveau = (typeof NIVEAUS)[number];
type Kurstyp = (typeof KURSTYPEN)[number];

const ProgressBar = ({ step }: { step: number }) => (
  <div
    className="mx-auto flex w-3/5 max-w-xs gap-1"
    style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 40px)" }}
  >
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className={cn(
          "h-1 flex-1 rounded-pill transition-colors duration-300",
          i <= step ? "bg-brand" : "bg-white/10",
        )}
      />
    ))}
  </div>
);

const StepShell = ({
  children,
  stepKey,
}: {
  children: React.ReactNode;
  stepKey: string;
}) => (
  <motion.div
    key={stepKey}
    initial={{ opacity: 0, x: 16 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -16 }}
    transition={{ duration: 0.24, ease: [0.32, 0.72, 0, 1] }}
    className="flex flex-1 flex-col px-6"
  >
    {children}
  </motion.div>
);

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const [step, setStep] = useState(0);

  // step 2 state
  const [niveau, setNiveau] = useState<Niveau>("A2");
  const [kurstyp, setKurstyp] = useState<Kurstyp>("Integrationskurs");

  // step 3 state
  const [name, setName] = useState("");
  const [kuerzel, setKuerzel] = useState("");
  const [kuerzelEdited, setKuerzelEdited] = useState(false);
  const [saving, setSaving] = useState(false);

  // Hydrate from existing profile
  useEffect(() => {
    if (profile) {
      if (profile.default_niveau && NIVEAUS.includes(profile.default_niveau as Niveau)) {
        setNiveau(profile.default_niveau as Niveau);
      }
      if (profile.default_kurstyp && KURSTYPEN.includes(profile.default_kurstyp as Kurstyp)) {
        setKurstyp(profile.default_kurstyp as Kurstyp);
      }
      if (profile.name) setName(profile.name);
      if (profile.kuerzel) {
        setKuerzel(profile.kuerzel);
        setKuerzelEdited(true);
      }
    }
  }, [profile]);

  // Auto-fill kürzel from name unless user edited it manually
  useEffect(() => {
    if (kuerzelEdited) return;
    const auto = name.trim().slice(0, 1).toUpperCase();
    setKuerzel(auto);
  }, [name, kuerzelEdited]);

  const canSaveStep3 = useMemo(() => name.trim().length >= 2, [name]);

  const persist = async (patch: Record<string, unknown>) => {
    if (!user) return false;
    const { error } = await supabase
      .from("profiles")
      .update(patch)
      .eq("id", user.id);
    if (error) {
      toast({
        title: "Speichern fehlgeschlagen",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
    await refreshProfile();
    return true;
  };

  const handleStep2Next = async () => {
    setSaving(true);
    const ok = await persist({
      default_niveau: niveau,
      default_kurstyp: kurstyp,
    });
    setSaving(false);
    if (ok) setStep(2);
  };

  const handleFinish = async () => {
    if (!canSaveStep3) return;
    setSaving(true);
    const ok = await persist({
      name: name.trim(),
      kuerzel: kuerzel.trim().slice(0, 2).toUpperCase() || null,
      onboarding_completed: true,
    });
    setSaving(false);
    if (ok) navigate("/", { replace: true });
  };

  const handleSkip = async () => {
    setSaving(true);
    await persist({ onboarding_completed: true });
    setSaving(false);
    navigate("/", { replace: true });
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-bg-base">
      <header className="flex items-center justify-center pt-4">
        <LehrlyMark size={20} />
      </header>
      <ProgressBar step={step} />

      <AnimatePresence mode="wait">
        {step === 0 && (
          <StepShell stepKey="welcome">
            <div className="mt-[60px] flex flex-col items-center text-center">
              <div
                className="flex h-20 w-20 items-center justify-center bg-brand-gradient shadow-brand-glow"
                style={{ borderRadius: "22%" }}
              >
                <Sparkles size={36} className="text-white" />
              </div>
              <h1 className="mt-8 text-[28px] font-bold tracking-[-0.02em] text-text-primary">
                Willkommen bei Lehrly 👋
              </h1>
              <p className="mt-3 max-w-[320px] text-body text-text-secondary">
                Lehrly erstellt professionelle Arbeitsblätter für deinen
                Sprachkurs — mit künstlicher Intelligenz.
              </p>
            </div>
            <div className="mt-auto flex items-center justify-between pb-10 pt-10">
              <TapButton
                onClick={handleSkip}
                className="text-body-sm text-text-tertiary hover:text-text-secondary"
              >
                Überspringen
              </TapButton>
              <div className="w-40">
                <PrimaryButton onClick={() => setStep(1)}>Weiter →</PrimaryButton>
              </div>
            </div>
          </StepShell>
        )}

        {step === 1 && (
          <StepShell stepKey="context">
            <div className="mt-10 text-center">
              <h1 className="text-[28px] font-bold tracking-[-0.02em] text-text-primary">
                Wie unterrichtest du?
              </h1>
              <p className="mt-2 text-body text-text-secondary">
                Wir füllen den Generator passend für dich vor.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-4">
              <section className="rounded-card border border-white/[0.06] bg-surface p-5">
                <p className="section-label mb-3">Standard-Niveau</p>
                <div className="flex flex-wrap gap-2">
                  {NIVEAUS.map((n) => (
                    <TapButton
                      key={n}
                      onClick={() => setNiveau(n)}
                      className={cn(
                        "h-10 min-w-[56px] rounded-pill border px-4 text-button transition-colors",
                        niveau === n
                          ? "border-brand bg-brand-muted text-brand"
                          : "border-white/10 bg-bg-elevated text-text-secondary",
                      )}
                    >
                      {n}
                    </TapButton>
                  ))}
                </div>
              </section>

              <section className="rounded-card border border-white/[0.06] bg-surface p-5">
                <p className="section-label mb-3">Häufigster Kurstyp</p>
                <div className="flex flex-col gap-2">
                  {KURSTYPEN.map((k) => {
                    const active = kurstyp === k;
                    return (
                      <TapButton
                        key={k}
                        onClick={() => setKurstyp(k)}
                        className={cn(
                          "flex h-12 w-full items-center justify-between rounded-input border px-4 text-left text-body transition-colors",
                          active
                            ? "border-brand bg-brand-muted text-text-primary"
                            : "border-white/10 bg-bg-elevated text-text-secondary",
                        )}
                      >
                        <span>{k}</span>
                        {active && <Check size={18} className="text-brand" />}
                      </TapButton>
                    );
                  })}
                </div>
              </section>
            </div>

            <div className="mt-auto flex items-center justify-between pb-10 pt-10">
              <TapButton
                onClick={handleSkip}
                className="text-body-sm text-text-tertiary hover:text-text-secondary"
              >
                Überspringen
              </TapButton>
              <div className="w-40">
                <PrimaryButton onClick={handleStep2Next} loading={saving}>
                  Weiter →
                </PrimaryButton>
              </div>
            </div>
          </StepShell>
        )}

        {step === 2 && (
          <StepShell stepKey="identity">
            <div className="mt-10 text-center">
              <h1 className="text-[28px] font-bold tracking-[-0.02em] text-text-primary">
                Fast fertig ✨
              </h1>
              <p className="mt-2 text-body text-text-secondary">
                Diese Angaben erscheinen auf deinen Arbeitsblättern. Du kannst
                sie jederzeit ändern.
              </p>
            </div>

            <section className="mt-8 rounded-card border border-white/[0.06] bg-surface p-5">
              <label className="section-label block">Dein Name oder Schulname</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="z. B. VHS München / Frau Müller"
                maxLength={80}
                className="mt-3 h-[52px] w-full rounded-input border border-white/10 bg-bg-elevated px-4 text-body text-text-primary placeholder:text-text-tertiary outline-none focus:border-white/25"
              />

              <div className="mt-5 flex items-end gap-4">
                <div className="flex-1">
                  <label className="section-label block">Kürzel (1–2 Buchstaben)</label>
                  <input
                    value={kuerzel}
                    onChange={(e) => {
                      setKuerzelEdited(true);
                      setKuerzel(e.target.value.replace(/[^A-Za-zÄÖÜäöüß]/g, "").slice(0, 2).toUpperCase());
                    }}
                    placeholder="MM"
                    className="mt-3 h-[52px] w-[60px] rounded-input border border-white/10 bg-bg-elevated px-3 text-center text-body font-semibold text-text-primary outline-none focus:border-white/25"
                  />
                </div>
              </div>
            </section>

            <div className="mt-auto flex items-center justify-between pb-10 pt-10">
              <TapButton
                onClick={handleSkip}
                className="text-body-sm text-text-tertiary hover:text-text-secondary"
              >
                Überspringen
              </TapButton>
              <div className="w-44">
                <PrimaryButton
                  onClick={handleFinish}
                  loading={saving}
                  disabled={!canSaveStep3}
                >
                  Los geht's 🚀
                </PrimaryButton>
              </div>
            </div>
          </StepShell>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Onboarding;
