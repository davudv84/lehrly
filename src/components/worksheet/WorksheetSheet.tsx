import { cn } from "@/lib/utils";
import NiveauBadge from "@/components/NiveauBadge";

export type Exercise = {
  type: string;
  instruction: string;
  context?: string;
  content: string;
  solution: string;
  options?: string[];
};

export type WorksheetData = {
  title: string;
  niveau: string;
  topic?: string | null;
  task_count: number;
  competencies?: string[];
  duration_min?: number | null;
  learning_goal?: string | null;
  teacher_notes?: string[];
  exercises: Exercise[];
};

type Meta = {
  schoolLabel: string;
  authorInitials: string;
  worksheetId: string;
  createdAt: string;
};

type Props = {
  ws: WorksheetData;
  meta: Meta;
  showSolutions?: boolean;
  studentView?: boolean; // hides solutions section regardless
  className?: string;
};

const COMPETENCE_STRIPE: Record<string, string> = {
  Lesen: "stripe-lesen",
  Schreiben: "stripe-schreiben",
  Hören: "stripe-hoeren",
  Sprechen: "stripe-sprechen",
  Wortschatz: "stripe-wortschatz",
  Grammatik: "stripe-grammatik",
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

/** Render the inline content of a Lückentext: replace runs of underscores
 *  (≥3) with a styled blank. Preserves linebreaks. */
const renderBlankedText = (txt: string) => {
  const parts = txt.split(/(_{3,})/g);
  return parts.map((p, i) =>
    /^_{3,}$/.test(p) ? (
      <span key={i} className="blank" />
    ) : (
      <span key={i}>{p}</span>
    ),
  );
};

const ExerciseBlock = ({
  ex,
  index,
  showSolutions,
}: {
  ex: Exercise;
  index: number;
  showSolutions: boolean;
}) => {
  const t = ex.type.toLowerCase();
  const isMC = t.includes("multiple") || t.includes("auswahl");
  const isLueck = t.includes("lück") || t.includes("luec");
  const isSchreib = t.includes("schreib");
  const isWortschatz = t.includes("wort");
  const isZuord = t.includes("zuord");

  const lines = ex.content.split(/\n+/).filter((l) => l.trim().length > 0);

  // Detect inline MC options like "a) ..., b) ..., c) ..."
  const mcOptions =
    ex.options ??
    (isMC ? lines.filter((l) => /^[a-dA-D][\).]\s+/.test(l.trim())) : []);
  const mcStem = isMC
    ? lines.filter((l) => !/^[a-dA-D][\).]\s+/.test(l.trim())).join(" ")
    : "";

  return (
    <li className="ws-exercise mt-5">
      <div className="flex items-baseline gap-2">
        <span className="ui text-[11px] font-bold uppercase tracking-[0.08em] text-zinc-500">
          Aufgabe {index + 1}
        </span>
        <span className="h-px flex-1 bg-zinc-200" />
        <span className="ui text-[10.5px] font-medium uppercase tracking-wide text-zinc-400">
          {ex.type}
        </span>
      </div>
      <p className="ui mt-2 text-[13px] font-semibold text-zinc-800">
        {ex.instruction}
      </p>
      {ex.context && (
        <p className="ui mt-1 text-[12px] italic text-zinc-500">{ex.context}</p>
      )}

      {isMC && (
        <div className="mt-2.5">
          {mcStem && <p className="text-[13.5px] text-zinc-800">{mcStem}</p>}
          <ol className="mt-2 space-y-1.5">
            {mcOptions.map((opt, i) => {
              const clean = opt.replace(/^[a-dA-D][\).]\s+/, "");
              const letter = String.fromCharCode(97 + i);
              return (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="ui mt-[2px] inline-flex h-5 w-5 items-center justify-center rounded border border-zinc-300 text-[10.5px] font-semibold text-zinc-600">
                    {letter}
                  </span>
                  <span className="text-[13.5px] text-zinc-800">{clean}</span>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {isLueck && !isMC && (
        <p className="mt-2.5 text-[14px] leading-[1.9] text-zinc-900">
          {renderBlankedText(ex.content)}
        </p>
      )}

      {isSchreib && (
        <>
          {ex.content && (
            <p className="mt-2.5 text-[13.5px] italic text-zinc-700">
              {ex.content}
            </p>
          )}
          <div className="mt-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="writing-line" />
            ))}
          </div>
        </>
      )}

      {isZuord && !isMC && (
        <div className="mt-2.5 grid grid-cols-2 gap-x-6 gap-y-1.5">
          {lines.map((l, i) => (
            <div
              key={i}
              className="flex items-center gap-2 border-b border-dashed border-zinc-300 py-1 text-[13.5px] text-zinc-800"
            >
              <span className="ui text-[10.5px] font-semibold text-zinc-400">
                {i + 1}.
              </span>
              <span>{l}</span>
            </div>
          ))}
        </div>
      )}

      {isWortschatz && !isMC && !isZuord && (
        <ul className="mt-2.5 grid grid-cols-2 gap-x-6 gap-y-1 text-[13.5px] text-zinc-800">
          {lines.map((l, i) => (
            <li key={i} className="flex gap-2">
              <span className="ui text-zinc-400">·</span>
              <span>{l}</span>
            </li>
          ))}
        </ul>
      )}

      {!isMC && !isLueck && !isSchreib && !isZuord && !isWortschatz && (
        <p className="mt-2.5 whitespace-pre-line text-[13.5px] text-zinc-800">
          {ex.content}
        </p>
      )}

      {showSolutions && (
        <p className="ui mt-2 inline-block rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11.5px] font-medium text-emerald-700">
          Lösung: <span className="font-semibold">{ex.solution}</span>
        </p>
      )}
    </li>
  );
};

const WorksheetSheet = ({
  ws,
  meta,
  showSolutions = false,
  studentView = false,
  className,
}: Props) => {
  const competencies = ws.competencies ?? [];
  const showSolutionsBlock = !studentView && showSolutions;

  return (
    <article
      className={cn(
        "paper relative mx-auto w-full overflow-hidden rounded-card border border-zinc-200 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.35)]",
        className,
      )}
      style={{ aspectRatio: "1 / 1.414" }}
    >
      {/* Competence stripes — top */}
      {competencies.length > 0 && (
        <div className="flex h-[5px] w-full">
          {competencies.map((c) => (
            <div
              key={c}
              className={cn("flex-1", COMPETENCE_STRIPE[c] ?? "bg-zinc-300")}
              title={c}
            />
          ))}
        </div>
      )}

      <div className="px-7 pt-6">
        {/* Header */}
        <header className="flex items-start justify-between gap-4 border-b border-zinc-200 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-900 text-[12px] font-bold text-white">
              {meta.authorInitials}
            </div>
            <div className="leading-tight">
              <p className="ui text-[12px] font-semibold text-zinc-900">
                {meta.schoolLabel}
              </p>
              <p className="ui text-[10.5px] text-zinc-500">
                Arbeitsblatt · {formatDate(meta.createdAt)}
              </p>
            </div>
          </div>
          <NiveauBadge niveau={ws.niveau} size="md" tone="light" />
        </header>

        {/* Title */}
        <h1 className="mt-5 text-[22px] font-bold leading-tight tracking-tight text-zinc-900">
          {ws.title}
        </h1>
        <div className="ui mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-zinc-500">
          {ws.topic && <span>Thema: <span className="text-zinc-700 font-medium">{ws.topic}</span></span>}
          <span>·</span>
          <span>{ws.task_count} Aufgaben</span>
          {ws.duration_min ? (
            <>
              <span>·</span>
              <span>≈ {ws.duration_min} Min.</span>
            </>
          ) : null}
          {competencies.length > 0 && (
            <>
              <span>·</span>
              <span>{competencies.join(" · ")}</span>
            </>
          )}
        </div>

        {/* Name / Datum / Klasse line — for student to fill */}
        {studentView !== false && (
          <div className="ui mt-4 grid grid-cols-3 gap-4 text-[11px] text-zinc-500">
            <div>
              <span>Name</span>
              <div className="mt-1 h-[1px] bg-zinc-300" />
            </div>
            <div>
              <span>Klasse</span>
              <div className="mt-1 h-[1px] bg-zinc-300" />
            </div>
            <div>
              <span>Datum</span>
              <div className="mt-1 h-[1px] bg-zinc-300" />
            </div>
          </div>
        )}

        {/* Exercises */}
        <ol className="pb-8">
          {ws.exercises.map((ex, i) => (
            <ExerciseBlock
              key={i}
              ex={ex}
              index={i}
              showSolutions={showSolutionsBlock}
            />
          ))}
        </ol>
      </div>

      {/* Footer — worksheet ID */}
      <footer className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t border-zinc-100 px-7 py-2.5">
        <span className="ui text-[10px] uppercase tracking-[0.12em] text-zinc-400">
          Lehrly · {meta.schoolLabel}
        </span>
        <span className="mono text-[10px] text-zinc-400">
          ID {meta.worksheetId.slice(0, 8).toUpperCase()}
        </span>
      </footer>
    </article>
  );
};

export default WorksheetSheet;
