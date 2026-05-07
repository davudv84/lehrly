import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Sparkles, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import TapButton from "@/components/TapButton";
import Chip from "@/components/Chip";
import GenerationOverlay from "@/components/GenerationOverlay";
import { toast } from "sonner";

const NIVEAUS = ["A1", "A2", "B1", "B2", "C1"] as const;
const TOPICS = ["Einkaufen", "Arztbesuch", "Arbeit", "Familie", "Verkehr"];
const TASK_TYPES = ["Lückentext", "Multiple Choice", "Zuordnung", "Grammatik"];

type Niveau = (typeof NIVEAUS)[number];

type PrefillState = {
  prefill?: {
    niveau?: Niveau;
    topics?: string[];
    taskTypes?: string[];
    count?: number;
    templateId?: string;
  };
};

type Phase = "form" | "loading" | "success" | "error";

const Generate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile } = useAuth();
  const prefill = (location.state as PrefillState | null)?.prefill;

  const [niveau, setNiveau] = useState<Niveau>(
    (prefill?.niveau as Niveau) ?? (profile?.default_niveau as Niveau) ?? "B1",
  );
  const [topics, setTopics] = useState<string[]>(prefill?.topics ?? ["Einkaufen"]);
  const [taskTypes, setTaskTypes] = useState<string[]>(
    prefill?.taskTypes ?? ["Lückentext"],
  );
  const [count, setCount] = useState<number>(prefill?.count ?? 6);

  const [phase, setPhase] = useState<Phase>("form");
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const previewBadge = useMemo(
    () => `${niveau} · ${count} Aufgaben`,
    [niveau, count],
  );

  const toggle = (arr: string[], v: string, setter: (n: string[]) => void) => {
    setter(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  };

  const close = () => navigate(-1);

  const submit = async () => {
    if (!user) {
      toast.error("Bitte zuerst anmelden.");
      return;
    }
    if (taskTypes.length === 0) {
      toast.error("Wähle mindestens einen Aufgabentyp.");
      return;
    }
    setErrorMsg(null);
    setPhase("loading");
    try {
      const { data, error } = await supabase.functions.invoke(
        "generate-worksheet",
        {
          body: { niveau, topics, taskTypes, count },
        },
      );
      if (error || !data || (data as any).error) {
        const msg =
          (data as any)?.error || error?.message || "Unbekannter Fehler";
        setErrorMsg(msg);
        setPhase("error");
        return;
      }
      // bump template usage if prefilled
      if (prefill?.templateId) {
        await supabase
          .from("templates")
          .update({
            last_used_at: new Date().toISOString(),
            usage_count: (await getUsage(prefill.templateId)) + 1,
          })
          .eq("id", prefill.templateId);
      }
      setCreatedId((data as any).id);
      setPhase("success");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Unbekannter Fehler");
      setPhase("error");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-bg-base/70 backdrop-blur-md"
      onClick={phase === "form" ? close : undefined}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="mx-auto w-full max-w-md rounded-t-large border-t border-white/[0.06] bg-bg-elevated"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-white/15" />

        <AnimatePresence mode="wait">
          {phase === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-5 pb-5 pt-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-h2 text-text-primary">Neues Arbeitsblatt</h2>
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-pill border border-brand/30 bg-brand/15 px-3 py-1 text-[12px] font-semibold text-brand">
                    <Sparkles size={12} /> Vorschau: {previewBadge}
                  </div>
                </div>
                <TapButton
                  aria-label="Schließen"
                  onClick={close}
                  className="h-9 w-9 rounded-pill bg-surface text-text-secondary"
                >
                  <X size={18} />
                </TapButton>
              </div>

              <Section label="Sprachniveau">
                <div className="flex flex-wrap gap-2">
                  {NIVEAUS.map((n) => (
                    <Chip
                      key={n}
                      active={niveau === n}
                      onClick={() => setNiveau(n)}
                      size="sm"
                    >
                      {n}
                    </Chip>
                  ))}
                </div>
              </Section>

              <Section label="Thema">
                <div className="flex flex-wrap gap-2">
                  {TOPICS.map((t) => (
                    <Chip
                      key={t}
                      active={topics.includes(t)}
                      onClick={() => toggle(topics, t, setTopics)}
                      size="sm"
                    >
                      {t}
                    </Chip>
                  ))}
                </div>
              </Section>

              <Section label="Aufgabentypen">
                <div className="flex flex-wrap gap-2">
                  {TASK_TYPES.map((t) => (
                    <Chip
                      key={t}
                      active={taskTypes.includes(t)}
                      onClick={() => toggle(taskTypes, t, setTaskTypes)}
                      size="sm"
                    >
                      {t}
                    </Chip>
                  ))}
                </div>
              </Section>

              <Section label="Umfang">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-text-tertiary">
                    3–15 Aufgaben
                  </span>
                  <span className="text-[16px] font-bold text-brand">{count}</span>
                </div>
                <input
                  type="range"
                  min={3}
                  max={15}
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="mt-2 h-1.5 w-full appearance-none rounded-full bg-white/10 accent-brand"
                  style={{
                    background: `linear-gradient(to right, hsl(var(--brand)) ${
                      ((count - 3) / 12) * 100
                    }%, hsl(0 0% 100% / 0.1) ${((count - 3) / 12) * 100}%)`,
                  }}
                />
              </Section>

              <button
                onClick={submit}
                className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-input bg-brand-gradient text-button text-white shadow-brand-glow transition-opacity active:opacity-80"
              >
                <Sparkles size={16} /> Arbeitsblatt erstellen
              </button>
            </motion.div>
          )}

          {phase === "loading" && null}

          {phase === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center px-5 pb-8 pt-10"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 250, damping: 15 }}
                className="relative flex h-20 w-20 items-center justify-center"
              >
                <div className="absolute inset-0 rounded-full bg-brand/20 blur-xl" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-brand-gradient shadow-brand-glow">
                  <Check size={32} className="text-white" strokeWidth={3} />
                </div>
              </motion.div>
              <p className="mt-6 text-[22px] font-bold text-text-primary">
                Fertig! ✨
              </p>
              <p className="mt-1 text-center text-[14px] text-text-secondary">
                Dein Arbeitsblatt ist druckbereit.
              </p>

              <div className="mt-8 flex w-full flex-col gap-2">
                <button
                  onClick={() => {
                    if (createdId) navigate(`/worksheets/${createdId}`);
                    else close();
                  }}
                  className="flex h-12 w-full items-center justify-center rounded-input bg-brand-gradient text-button text-white shadow-brand-glow"
                >
                  Anzeigen
                </button>
                <button
                  onClick={close}
                  className="flex h-12 w-full items-center justify-center rounded-input border border-white/10 bg-surface text-button text-text-primary"
                >
                  Schließen
                </button>
              </div>
            </motion.div>
          )}

          {phase === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center px-5 pb-8 pt-10"
            >
              <p className="text-[18px] font-bold text-text-primary">Hoppla.</p>
              <p className="mt-2 text-center text-[14px] text-text-secondary">
                {errorMsg ?? "Etwas ist schiefgelaufen."}
              </p>
              <div className="mt-6 flex w-full flex-col gap-2">
                <button
                  onClick={() => setPhase("form")}
                  className="flex h-12 w-full items-center justify-center rounded-input bg-brand-gradient text-button text-white"
                >
                  Erneut versuchen
                </button>
                <button
                  onClick={close}
                  className="flex h-12 w-full items-center justify-center rounded-input border border-white/10 bg-surface text-button text-text-primary"
                >
                  Schließen
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <GenerationOverlay active={phase === "loading"} />
    </div>
  );
};

const Section = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="mt-5">
    <p className="section-label mb-2">{label}</p>
    {children}
  </div>
);

async function getUsage(id: string): Promise<number> {
  const { data } = await supabase
    .from("templates")
    .select("usage_count")
    .eq("id", id)
    .maybeSingle();
  return (data?.usage_count as number) ?? 0;
}

export default Generate;
