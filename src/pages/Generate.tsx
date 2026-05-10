import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Sparkles, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import TapButton from "@/components/TapButton";
import Chip from "@/components/Chip";
import GenerationOverlay from "@/components/GenerationOverlay";
import CompletionOverview from "@/components/worksheet/CompletionOverview";
import type { WorksheetData } from "@/components/worksheet/WorksheetSheet";
import { toast } from "sonner";

const NIVEAUS = ["A1", "A2", "B1", "B2", "C1"] as const;
const TOPICS = [
  "Arzt",
  "Wohnung",
  "Arbeit",
  "Kita",
  "Schule",
  "Einkauf",
  "Bahn",
  "Termin",
  "Behörde",
  "Bewerbung",
  "Telefon",
  "Nachbarn",
  "Supermarkt",
  "Ausbildung",
];
const TASK_TYPES = [
  "Lückentext",
  "Multiple Choice",
  "Zuordnung",
  "Grammatik",
  "Schreibaufgabe",
  "Wortschatz",
  "Satzbau",
  "Dialog",
  "Leseverstehen",
];

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
  const [topics, setTopics] = useState<string[]>(prefill?.topics ?? ["Einkauf"]);
  const [taskTypes, setTaskTypes] = useState<string[]>(
    prefill?.taskTypes ?? ["Lückentext"],
  );
  const [count, setCount] = useState<number>(prefill?.count ?? 6);
  const [generateKlassenbuch, setGenerateKlassenbuch] = useState(true);

  const [phase, setPhase] = useState<Phase>("form");
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [createdSheet, setCreatedSheet] = useState<WorksheetData | null>(null);
  const [createdAt, setCreatedAt] = useState<string>(new Date().toISOString());
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
      if (prefill?.templateId) {
        await supabase
          .from("templates")
          .update({
            last_used_at: new Date().toISOString(),
            usage_count: (await getUsage(prefill.templateId)) + 1,
          })
          .eq("id", prefill.templateId);
      }
      const newId = (data as any).id;
      setCreatedId(newId);
      // Fetch the freshly generated worksheet to show the overview
      const { data: full } = await supabase
        .from("worksheets")
        .select("*")
        .eq("id", newId)
        .maybeSingle();
      if (full) {
        const c = (full as any).content ?? {};
        setCreatedSheet({
          title: c.title || (full as any).title,
          niveau: (full as any).niveau,
          topic: (full as any).topic,
          task_count: (full as any).task_count,
          competencies: c.competencies ?? [],
          duration_min: c.duration_min ?? null,
          learning_goal: c.learning_goal ?? null,
          teacher_notes: c.teacher_notes ?? [],
          exercises: c.exercises ?? [],
        });
        setCreatedAt((full as any).created_at);
      }
      setPhase("success");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Unbekannter Fehler");
      setPhase("error");
    }
  };

  // Completion overview takes over the screen on success
  if (phase === "success" && createdSheet && createdId) {
    return (
      <CompletionOverview
        ws={createdSheet}
        meta={{ worksheetId: createdId, createdAt }}
        taskTypes={taskTypes}
        onPrint={() => navigate(`/worksheets/${createdId}`)}
        onEdit={() => navigate(`/worksheets/${createdId}`)}
        onClose={close}
      />
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-bg-base/65 backdrop-blur-md"
      onClick={phase === "form" ? close : undefined}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="mx-auto w-full max-w-md rounded-t-large bg-bg-elevated ring-hairline shadow-elevated"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="mx-auto mt-2.5 h-1 w-9 rounded-full bg-hairline/15" />

        <AnimatePresence mode="wait">
          {phase === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-5 pb-6 pt-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-display text-[20px] font-semibold tracking-[-0.018em] text-text-primary">
                    Neues Arbeitsblatt
                  </h2>
                  <p className="mt-1 text-[12.5px] text-text-tertiary">
                    Vorschau: {previewBadge}
                  </p>
                </div>
                <TapButton
                  aria-label="Schließen"
                  onClick={close}
                  className="h-9 w-9 rounded-pill bg-surface-2 text-text-secondary hover:bg-surface-3 transition-colors"
                >
                  <X size={17} />
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
                  <span className="font-display text-[18px] font-semibold tabular-nums text-text-primary">
                    {count}
                  </span>
                </div>
                <input
                  type="range"
                  min={3}
                  max={15}
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="mt-2 h-1 w-full appearance-none rounded-full bg-hairline/10 accent-brand"
                  style={{
                    background: `linear-gradient(to right, hsl(var(--brand)) ${
                      ((count - 3) / 12) * 100
                    }%, hsl(0 0% 100% / 0.08) ${((count - 3) / 12) * 100}%)`,
                  }}
                />
              </Section>

              <button
                onClick={submit}
                className="mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-pill bg-brand text-[14px] font-medium text-primary-foreground transition-all hover:bg-brand-hover active:scale-[0.99]"
              >
                <Sparkles size={15} /> Arbeitsblatt erstellen
              </button>
            </motion.div>
          )}

          {phase === "loading" && null}

          {phase === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center px-5 pb-8 pt-12"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 280, damping: 18 }}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-brand"
              >
                <Check size={26} className="text-primary-foreground" strokeWidth={3} />
              </motion.div>
              <p className="mt-5 font-display text-[20px] font-semibold tracking-[-0.018em] text-text-primary">
                Fertig
              </p>
              <p className="mt-1 text-center text-[13.5px] text-text-secondary">
                Dein Arbeitsblatt ist druckbereit.
              </p>

              <div className="mt-7 flex w-full flex-col gap-2">
                <button
                  onClick={() => {
                    if (createdId) navigate(`/worksheets/${createdId}`);
                    else close();
                  }}
                  className="flex h-12 w-full items-center justify-center rounded-pill bg-brand text-[14px] font-medium text-primary-foreground hover:bg-brand-hover transition-colors"
                >
                  Anzeigen
                </button>
                <button
                  onClick={close}
                  className="flex h-12 w-full items-center justify-center rounded-pill bg-surface-2 text-[14px] font-medium text-text-primary ring-hairline hover:bg-surface-3 transition-colors"
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
              className="flex flex-col items-center px-5 pb-8 pt-12"
            >
              <p className="font-display text-[18px] font-semibold tracking-[-0.015em] text-text-primary">
                Hoppla.
              </p>
              <p className="mt-2 text-center text-[13.5px] text-text-secondary">
                {errorMsg ?? "Etwas ist schiefgelaufen."}
              </p>
              <div className="mt-6 flex w-full flex-col gap-2">
                <button
                  onClick={() => setPhase("form")}
                  className="flex h-12 w-full items-center justify-center rounded-pill bg-brand text-[14px] font-medium text-primary-foreground hover:bg-brand-hover transition-colors"
                >
                  Erneut versuchen
                </button>
                <button
                  onClick={close}
                  className="flex h-12 w-full items-center justify-center rounded-pill bg-surface-2 text-[14px] font-medium text-text-primary ring-hairline hover:bg-surface-3 transition-colors"
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
  <div className="mt-6">
    <p className="section-label mb-2.5">{label}</p>
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
