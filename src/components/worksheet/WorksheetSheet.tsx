import { cn } from "@/lib/utils";

export type Exercise = {
  type: string;
  instruction: string;
  context?: string;
  content: string;
  solution: string;
  options?: string[];
  points?: number;
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
  studentView?: boolean;
  className?: string;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

/** Replace runs of underscores with a real dashed underline blank. */
const renderBlankedText = (txt: string) => {
  const parts = txt.split(/(_{3,})/g);
  return parts.map((p, i) =>
    /^_{3,}$/.test(p) ? (
      <span
        key={i}
        style={{
          display: "inline-block",
          minWidth: "120px",
          borderBottom: "1px solid #1A1A1A",
          margin: "0 4px",
          verticalAlign: "baseline",
        }}
      />
    ) : (
      <span key={i}>{p}</span>
    ),
  );
};

const subtitleFor = (ws: WorksheetData) => {
  const comps = ws.competencies ?? [];
  const focus =
    comps.length > 0
      ? comps.length === 1
        ? `${comps[0]}skompetenz`
        : `${comps.slice(0, -1).join(", ")} und ${comps[comps.length - 1]}`
      : "Kommunikationskompetenz";
  return `Aufgaben zur ${focus} (${ws.niveau})`;
};

const ExerciseBlock = ({
  ex,
  index,
  showSolutions,
  studentView,
}: {
  ex: Exercise;
  index: number;
  showSolutions: boolean;
  studentView: boolean;
}) => {
  const t = ex.type.toLowerCase();
  const isMC = t.includes("multiple") || t.includes("auswahl");
  const isLueck = t.includes("lück") || t.includes("luec");
  const isSchreib = t.includes("schreib");
  const isWortschatz = t.includes("wort");
  const isZuord = t.includes("zuord");

  const lines = ex.content.split(/\n+/).filter((l) => l.trim().length > 0);

  const mcOptions =
    ex.options ??
    (isMC ? lines.filter((l) => /^[a-dA-D][\).]\s+/.test(l.trim())) : []);
  const mcStem = isMC
    ? lines.filter((l) => !/^[a-dA-D][\).]\s+/.test(l.trim())).join(" ")
    : "";

  const points = ex.points ?? Math.max(2, Math.min(10, lines.length || 5));

  return (
    <li
      style={{
        listStyle: "none",
        marginTop: index === 0 ? 0 : "28px",
        paddingTop: index === 0 ? 0 : "20px",
        borderTop: index === 0 ? "none" : "1px solid #E5E5E5",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "14.5px",
            lineHeight: 1.55,
            color: "#1A1A1A",
          }}
        >
          <span style={{ fontWeight: 700 }}>Aufgabe {index + 1}:</span>{" "}
          <span style={{ fontWeight: 400 }}>{ex.instruction}</span>
        </p>
        <span
          style={{
            flexShrink: 0,
            fontSize: "12px",
            fontVariantCaps: "all-small-caps",
            letterSpacing: "0.06em",
            color: "#666",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          / {points} Punkte
        </span>
      </div>

      {ex.context && (
        <p
          style={{
            marginTop: "6px",
            fontSize: "13.5px",
            fontStyle: "italic",
            color: "#444",
            lineHeight: 1.6,
          }}
        >
          {ex.context}
        </p>
      )}

      {isMC && (
        <div style={{ marginTop: "12px" }}>
          {mcStem && (
            <p style={{ fontSize: "14px", color: "#1A1A1A", margin: "0 0 8px 0" }}>
              {mcStem}
            </p>
          )}
          <ol style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {mcOptions.map((opt, i) => {
              const clean = opt.replace(/^[a-dA-D][\).]\s+/, "");
              return (
                <li
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    padding: "4px 0",
                    fontSize: "14px",
                    color: "#1A1A1A",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: "12px",
                      height: "12px",
                      border: "1px solid #1A1A1A",
                      marginTop: "5px",
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ lineHeight: 1.6 }}>{clean}</span>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {isLueck && !isMC && (
        <p
          style={{
            marginTop: "12px",
            fontSize: "14.5px",
            lineHeight: 2,
            color: "#1A1A1A",
          }}
        >
          {renderBlankedText(ex.content)}
        </p>
      )}

      {isSchreib && (
        <>
          {ex.content && (
            <p
              style={{
                marginTop: "10px",
                fontSize: "13.5px",
                fontStyle: "italic",
                color: "#444",
                lineHeight: 1.6,
              }}
            >
              {ex.content}
            </p>
          )}
          <div style={{ marginTop: "14px" }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                style={{ borderBottom: "1px solid #CCCCCC", height: "30px" }}
              />
            ))}
          </div>
        </>
      )}

      {isZuord && !isMC && (
        <table
          style={{
            marginTop: "12px",
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid #CCCCCC",
            fontSize: "14px",
          }}
        >
          <tbody>
            {lines.map((l, i) => (
              <tr key={i}>
                <td
                  style={{
                    border: "1px solid #CCCCCC",
                    padding: "8px 10px",
                    width: "32px",
                    color: "#666",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {i + 1}.
                </td>
                <td style={{ border: "1px solid #CCCCCC", padding: "8px 12px", color: "#1A1A1A" }}>
                  {l}
                </td>
                <td
                  style={{
                    border: "1px solid #CCCCCC",
                    padding: "8px 12px",
                    width: "40%",
                  }}
                />
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {isWortschatz && !isMC && !isZuord && (
        <ol
          style={{
            marginTop: "12px",
            paddingLeft: "22px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            columnGap: "24px",
            rowGap: "6px",
            fontSize: "14px",
            color: "#1A1A1A",
          }}
        >
          {lines.map((l, i) => (
            <li key={i} style={{ lineHeight: 1.6 }}>
              {l}
            </li>
          ))}
        </ol>
      )}

      {!isMC && !isLueck && !isSchreib && !isZuord && !isWortschatz && (
        <p
          style={{
            marginTop: "12px",
            fontSize: "14px",
            color: "#1A1A1A",
            whiteSpace: "pre-line",
            lineHeight: 1.6,
          }}
        >
          {ex.content}
        </p>
      )}

      {showSolutions && !studentView && (
        <p
          style={{
            marginTop: "12px",
            paddingTop: "8px",
            borderTop: "1px dashed #CCCCCC",
            fontSize: "12.5px",
            color: "#444",
            lineHeight: 1.55,
          }}
        >
          <span style={{ fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", fontSize: "11px" }}>
            Lösung
          </span>
          <span style={{ marginLeft: "8px" }}>{ex.solution}</span>
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
  const showSolutionsBlock = !studentView && showSolutions;

  return (
    <article
      className={cn("mx-auto w-full", className)}
      style={{
        maxWidth: "760px",
        backgroundColor: "#FFFFFF",
        color: "#1A1A1A",
        padding: "48px 56px 56px 56px",
        borderRadius: "8px",
        boxShadow: "0 1px 2px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.25)",
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        colorScheme: "light",
      }}
    >
      {/* Top header bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: "12px",
          paddingBottom: "10px",
          borderBottom: "1px solid #1A1A1A",
          fontSize: "11px",
          fontVariantCaps: "all-small-caps",
          letterSpacing: "0.12em",
          color: "#666",
        }}
      >
        <span>{meta.schoolLabel}</span>
        <span>
          Niveau {ws.niveau} · {formatDate(meta.createdAt)}
        </span>
      </div>

      {/* Title */}
      <h1
        style={{
          margin: "22px 0 6px 0",
          fontSize: "26px",
          fontWeight: 700,
          lineHeight: 1.2,
          letterSpacing: "-0.01em",
          color: "#1A1A1A",
        }}
      >
        {ws.title}
      </h1>
      <p
        style={{
          margin: 0,
          fontSize: "14px",
          color: "#666",
          fontStyle: "italic",
          lineHeight: 1.55,
        }}
      >
        {subtitleFor(ws)}
      </p>

      {/* Name / Klasse / Datum — student fills in */}
      {studentView && (
        <div
          style={{
            marginTop: "26px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            columnGap: "20px",
            fontSize: "12px",
            color: "#666",
          }}
        >
          {[
            { label: "Name", w: "100%" },
            { label: "Klasse", w: "100%" },
            { label: "Datum", w: "100%" },
          ].map((f) => (
            <div key={f.label}>
              <span
                style={{
                  fontVariantCaps: "all-small-caps",
                  letterSpacing: "0.08em",
                }}
              >
                {f.label}
              </span>
              <div
                style={{
                  marginTop: "4px",
                  height: "1px",
                  backgroundColor: "#1A1A1A",
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Exercises */}
      <ol style={{ margin: "30px 0 0 0", padding: 0 }}>
        {ws.exercises.map((ex, i) => (
          <ExerciseBlock
            key={i}
            ex={ex}
            index={i}
            showSolutions={showSolutionsBlock}
            studentView={studentView}
          />
        ))}
      </ol>

      {/* Footer */}
      <div
        style={{
          marginTop: "40px",
          paddingTop: "10px",
          borderTop: "1px solid #1A1A1A",
          display: "flex",
          justifyContent: "space-between",
          fontSize: "11px",
          fontVariantCaps: "all-small-caps",
          letterSpacing: "0.12em",
          color: "#666",
        }}
      >
        <span>Lehrly · {meta.schoolLabel}</span>
        <span style={{ fontFamily: "ui-monospace, SFMono-Regular, monospace", letterSpacing: "0.04em" }}>
          ID {meta.worksheetId.slice(0, 8).toUpperCase()}
        </span>
      </div>
    </article>
  );
};

export default WorksheetSheet;
