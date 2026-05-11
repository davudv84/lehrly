import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import TapButton from "@/components/TapButton";
import Chip from "@/components/Chip";
import GenerationOverlay from "@/components/GenerationOverlay";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const NIVEAUS = ["A1", "A2", "B1", "B2", "C1"] as const;
const TOPICS_TOP = ["Arzt", "Wohnung", "Arbeit", "Einkauf", "Bahn", "Termin"];
const TOPICS_MORE = ["Kita", "Schule", "Behörde", "Bewerbung", "Telefon", "Nachbarn", "Supermarkt", "Ausbildung"];
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
const MAX_TASK_TYPES = 3;

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

  const [step, setStep] = useState(1);
  const [showMoreTopics, setShowMoreTopics] = useState(false);
  const [niveau, setNiveau] = useState<Niveau>(
    (prefill?.niveau as Niveau) ?? (profile?.default_niveau as Niveau) ?? "B1",
  );
  const [topics, setTopics] = useState<string[]>(prefill?.topics ?? ["Einkauf"]);
  const [taskTypes, setTaskTypes] = useState<string[]>(
    prefill?.taskTypes ?? ["Lückentext"],
  );
  const [count, setCount] = useState<number>(prefill?.count ?? 6);
  const [generateKlassenbuch, setGenerateKlassenbuch] = useState(true);
  const [printSolutions, setPrintSolutions] = useState(true);

  const [phase, setPhase] = useState<Phase>("form");
  const [, setCreatedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);


  const previewBadge = useMemo(
    () => `${niveau} · ${count} Aufgaben`,
    [niveau, count],
  );

  const close = () => navigate(-1);

  const toggleTopic = (t: string) =>
    setTopics(topics.includes(t) ? topics.filter((x) => x !== t) : [...topics, t]);
  const toggleTaskType = (t: string) => {
    if (taskTypes.includes(t)) {
      setTaskTypes(taskTypes.filter((x) => x !== t));
    } else if (taskTypes.length < MAX_TASK_TYPES) {
      setTaskTypes([...taskTypes, t]);
    } else {
      toast.info(`Maximal ${MAX_TASK_TYPES} Aufgabentypen.`);
    }
  };

  const submit = async () => {
    if (!user) {
      toast.error("Bitte melde dich an, um ein Arbeitsblatt zu erstellen.");
      navigate("/auth/login");
      return;
    }
    if (!niveau) return toast.error("Bitte wähle ein Sprachniveau.");
    if (topics.length === 0) return toast.error("Bitte wähle mindestens ein Thema.");
    if (taskTypes.length === 0) return toast.error("Wähle mindestens einen Aufgabentyp.");
    if (!count || count < 3) return toast.error("Anzahl Aufgaben muss mindestens 3 sein.");
    setErrorMsg(null);
    setPhase("loading");
    try {
      const payload = { niveau, topics, taskTypes, count };
      const { data, error } = await supabase.functions.invoke("generate-worksheet", {
        body: payload,
      });

      // Extract real server error from FunctionsHttpError (non-2xx)
      let serverError: string | null = null;
      if (error && (error as any).context instanceof Response) {
        try {
          const body = await (error as any).context.clone().json();
          serverError = body?.error ?? null;
        } catch {
          try {
            serverError = await (error as any).context.clone().text();
          } catch {
            /* ignore */
          }
        }
      }

      if (error || !data || (data as any).error) {
        const raw =
          serverError ||
          (data as any)?.error ||
          error?.message ||
          "Unbekannter Fehler";
        const friendly = friendlyError(raw);
        setErrorMsg(friendly);
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
      if (generateKlassenbuch && newId) {
        supabase.functions.invoke("generate-klassenbuch", { body: { worksheetId: newId } }).catch(() => {});
      }
      toast.success("Arbeitsblatt erstellt");
      navigate(`/worksheets/${newId}`);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Unbekannter Fehler");
      setPhase("error");
    }
  };

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

        {phase === "form" && (
          <div className="px-5 pb-6 pt-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-display text-[20px] font-semibold tracking-[-0.018em] text-text-primary">
                  Neues Arbeitsblatt
                </h2>
                <p className="mt-1 text-[12.5px] text-text-tertiary">
                  Schritt {step} von 3 · {previewBadge}
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

            {/* Progress dots */}
            <div className="mt-4 flex items-center gap-1.5">
              {[1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1 rounded-full transition-all",
                    i === step ? "w-6 bg-white" : i < step ? "w-3 bg-white/60" : "w-3 bg-white/15",
                  )}
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2, ease: [0.22, 0.61, 0.36, 1] }}
              >
                {step === 1 && (
                  <>
                    <Section label="Sprachniveau">
                      <div className="flex flex-wrap gap-2">
                        {NIVEAUS.map((n) => (
                          <Chip key={n} active={niveau === n} onClick={() => setNiveau(n)} size="sm">
                            {n}
                          </Chip>
                        ))}
                      </div>
                    </Section>
                    <Section label="Thema">
                      <div className="flex flex-wrap gap-2">
                        {TOPICS_TOP.map((t) => (
                          <Chip
                            key={t}
                            active={topics.includes(t)}
                            onClick={() => toggleTopic(t)}
                            size="sm"
                          >
                            {t}
                          </Chip>
                        ))}
                        {showMoreTopics &&
                          TOPICS_MORE.map((t) => (
                            <Chip
                              key={t}
                              active={topics.includes(t)}
                              onClick={() => toggleTopic(t)}
                              size="sm"
                            >
                              {t}
                            </Chip>
                          ))}
                        {!showMoreTopics && (
                          <button
                            onClick={() => setShowMoreTopics(true)}
                            className="h-8 rounded-pill px-3.5 text-[12.5px] font-medium text-text-tertiary hover:text-text-primary transition-colors"
                          >
                            Mehr anzeigen
                          </button>
                        )}
                      </div>
                    </Section>
                  </>
                )}

                {step === 2 && (
                  <>
                    <Section
                      label={`Aufgabentypen · ${taskTypes.length}/${MAX_TASK_TYPES} ausgewählt`}
                    >
                      <div className="flex flex-wrap gap-2">
                        {TASK_TYPES.map((t) => (
                          <Chip
                            key={t}
                            active={taskTypes.includes(t)}
                            onClick={() => toggleTaskType(t)}
                            size="sm"
                          >
                            {t}
                          </Chip>
                        ))}
                      </div>
                    </Section>
                    <Section label="Umfang">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] text-text-tertiary">3–15 Aufgaben</span>
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
                  </>
                )}

                {step === 3 && (
                  <>
                    <Section label="Klassenbucheintrag">
                      <ToggleRow
                        label="Klassenbucheintrag automatisch generieren"
                        value={generateKlassenbuch}
                        onChange={setGenerateKlassenbuch}
                      />
                    </Section>
                    <Section label="Lösungsblatt">
                      <ToggleRow
                        label="Lösungsblatt mitdrucken"
                        value={printSolutions}
                        onChange={setPrintSolutions}
                      />
                    </Section>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Footer */}
            <div className="mt-7 flex gap-2">
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="flex h-12 flex-1 items-center justify-center gap-1.5 rounded-pill bg-surface-2 ring-hairline text-[14px] font-medium text-text-secondary hover:bg-surface-3 transition-colors"
                >
                  <ArrowLeft size={14} /> Zurück
                </button>
              )}
              {step < 3 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  className="flex h-12 flex-1 items-center justify-center gap-1.5 rounded-pill bg-surface-3 text-[14px] font-medium text-text-primary hover:bg-surface-2 transition-colors"
                >
                  Weiter <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  onClick={submit}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-pill bg-brand text-[14px] font-medium text-primary-foreground hover:bg-brand-hover transition-all active:scale-[0.99]"
                >
                  <Sparkles size={15} /> Arbeitsblatt erstellen
                </button>
              )}
            </div>
          </div>
        )}

        {phase === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
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
      </motion.div>
      <GenerationOverlay active={phase === "loading"} onCancel={() => setPhase("form")} />
    </div>
  );
};

const Section = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="mt-6">
    <p className="section-label mb-2.5">{label}</p>
    {children}
  </div>
);

const ToggleRow = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) => (
  <button
    type="button"
    onClick={() => onChange(!value)}
    className="flex w-full items-center justify-between rounded-input bg-surface-2 ring-hairline px-4 py-3 text-left"
  >
    <span className="text-[13px] text-text-primary">{label}</span>
    <span
      role="switch"
      aria-checked={value}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-pill transition-colors",
        value ? "bg-brand" : "bg-surface-3",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all",
          value ? "right-0.5" : "left-0.5",
        )}
      />
    </span>
  </button>
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
