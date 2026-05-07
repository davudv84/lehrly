import type { WorksheetData, Exercise } from "./WorksheetSheet";

type Meta = {
  schoolLabel: string;
  authorInitials: string;
  worksheetId: string;
  createdAt: string;
};

type Props = {
  ws: WorksheetData;
  meta: Meta;
  includeSolutions?: boolean;
};

const COMPETENCE_STRIPE: Record<string, string> = {
  Lesen: "#2563eb",
  Schreiben: "#16a34a",
  Hören: "#f59e0b",
  Sprechen: "#db2777",
  Wortschatz: "#7c3aed",
  Grammatik: "#0891b2",
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const renderBlankedText = (txt: string) => {
  const parts = txt.split(/(_{3,})/g);
  return parts.map((p, i) =>
    /^_{3,}$/.test(p) ? (
      <span
        key={i}
        style={{
          display: "inline-block",
          minWidth: "22mm",
          borderBottom: "1.2px solid #111",
          margin: "0 3px",
          verticalAlign: "baseline",
        }}
      />
    ) : (
      <span key={i}>{p}</span>
    ),
  );
};

const PrintExercise = ({ ex, index }: { ex: Exercise; index: number }) => {
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

  return (
    <li className="ws-exercise avoid-break" style={{ marginTop: "6mm", listStyle: "none" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
        <span
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: "10pt",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "#444",
          }}
        >
          Aufgabe {index + 1}
        </span>
        <span style={{ flex: 1, height: "1px", background: "#cfcfcf" }} />
        <span
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: "9pt",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "#777",
          }}
        >
          {ex.type}
        </span>
      </div>

      <p
        style={{
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: "11pt",
          fontWeight: 600,
          color: "#111",
          marginTop: "2.5mm",
        }}
      >
        {ex.instruction}
      </p>

      {ex.context && (
        <p
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: "10pt",
            fontStyle: "italic",
            color: "#555",
            marginTop: "1mm",
          }}
        >
          {ex.context}
        </p>
      )}

      {isMC && (
        <div style={{ marginTop: "3mm" }}>
          {mcStem && <p style={{ fontSize: "11pt", color: "#111" }}>{mcStem}</p>}
          <ol style={{ marginTop: "2mm", padding: 0, listStyle: "none" }}>
            {mcOptions.map((opt, i) => {
              const clean = opt.replace(/^[a-dA-D][\).]\s+/, "");
              const letter = String.fromCharCode(97 + i);
              return (
                <li
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "3mm",
                    marginTop: "1.5mm",
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "5mm",
                      height: "5mm",
                      border: "1px solid #555",
                      fontFamily: "Inter, system-ui, sans-serif",
                      fontSize: "9pt",
                      fontWeight: 600,
                      color: "#333",
                    }}
                  >
                    {letter}
                  </span>
                  <span style={{ fontSize: "11pt", color: "#111" }}>{clean}</span>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {isLueck && !isMC && (
        <p
          style={{
            marginTop: "3mm",
            fontSize: "12pt",
            lineHeight: 1.95,
            color: "#000",
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
                marginTop: "3mm",
                fontSize: "11pt",
                fontStyle: "italic",
                color: "#333",
              }}
            >
              {ex.content}
            </p>
          )}
          <div style={{ marginTop: "3mm" }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                style={{
                  borderBottom: "1px solid #b8b8b8",
                  height: "8mm",
                }}
              />
            ))}
          </div>
        </>
      )}

      {isZuord && !isMC && (
        <div
          style={{
            marginTop: "3mm",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            columnGap: "8mm",
            rowGap: "2mm",
          }}
        >
          {lines.map((l, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "2mm",
                borderBottom: "1px dashed #999",
                padding: "1.5mm 0",
                fontSize: "11pt",
                color: "#111",
              }}
            >
              <span
                style={{
                  fontFamily: "Inter, system-ui, sans-serif",
                  fontSize: "9pt",
                  fontWeight: 600,
                  color: "#777",
                }}
              >
                {i + 1}.
              </span>
              <span>{l}</span>
            </div>
          ))}
        </div>
      )}

      {isWortschatz && !isMC && !isZuord && (
        <ul
          style={{
            marginTop: "3mm",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            columnGap: "8mm",
            rowGap: "1.5mm",
            padding: 0,
            listStyle: "none",
            fontSize: "11pt",
            color: "#111",
          }}
        >
          {lines.map((l, i) => (
            <li key={i} style={{ display: "flex", gap: "2mm" }}>
              <span style={{ color: "#888" }}>·</span>
              <span>{l}</span>
            </li>
          ))}
        </ul>
      )}

      {!isMC && !isLueck && !isSchreib && !isZuord && !isWortschatz && (
        <p
          style={{
            marginTop: "3mm",
            fontSize: "11pt",
            color: "#111",
            whiteSpace: "pre-line",
          }}
        >
          {ex.content}
        </p>
      )}
    </li>
  );
};

const PrintWorksheetView = ({ ws, meta, includeSolutions = false }: Props) => {
  const competencies = ws.competencies ?? [];

  return (
    <div
      className="print-only"
      style={{
        fontFamily: '"Source Serif 4", Georgia, serif',
        color: "#000",
        background: "#fff",
      }}
    >
      <section className="a4-page">
        {competencies.length > 0 && (
          <div style={{ display: "flex", height: "1.5mm", width: "100%" }}>
            {competencies.map((c) => (
              <div
                key={c}
                style={{
                  flex: 1,
                  background: COMPETENCE_STRIPE[c] ?? "#999",
                }}
              />
            ))}
          </div>
        )}

        {/* Header */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "6mm",
            paddingTop: "4mm",
            paddingBottom: "3mm",
            borderBottom: "1px solid #d0d0d0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "3mm" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "9mm",
                height: "9mm",
                background: "#111",
                color: "#fff",
                fontFamily: "Inter, system-ui, sans-serif",
                fontSize: "11pt",
                fontWeight: 700,
              }}
            >
              {meta.authorInitials}
            </div>
            <div style={{ lineHeight: 1.25 }}>
              <p
                style={{
                  fontFamily: "Inter, system-ui, sans-serif",
                  fontSize: "10.5pt",
                  fontWeight: 600,
                  color: "#111",
                  margin: 0,
                }}
              >
                {meta.schoolLabel}
              </p>
              <p
                style={{
                  fontFamily: "Inter, system-ui, sans-serif",
                  fontSize: "9pt",
                  color: "#666",
                  margin: 0,
                }}
              >
                Arbeitsblatt · {formatDate(meta.createdAt)}
              </p>
            </div>
          </div>

          <div
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: "11pt",
              fontWeight: 700,
              border: "1.5px solid #111",
              padding: "1.5mm 3mm",
              color: "#111",
            }}
          >
            {ws.niveau}
          </div>
        </header>

        {/* Title */}
        <h1
          style={{
            marginTop: "5mm",
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: "20pt",
            fontWeight: 700,
            lineHeight: 1.15,
            color: "#000",
          }}
        >
          {ws.title}
        </h1>

        <div
          style={{
            marginTop: "1.5mm",
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: "9.5pt",
            color: "#666",
          }}
        >
          {ws.topic && (
            <>
              Thema: <span style={{ color: "#222", fontWeight: 500 }}>{ws.topic}</span>
              {"  ·  "}
            </>
          )}
          <span>{ws.task_count} Aufgaben</span>
          {ws.duration_min ? <span>{"  ·  "}≈ {ws.duration_min} Min.</span> : null}
          {competencies.length > 0 && <span>{"  ·  "}{competencies.join(" · ")}</span>}
        </div>

        {ws.learning_goal && (
          <div
            style={{
              marginTop: "3mm",
              border: "1px solid #c8e0cf",
              background: "#f3faf5",
              padding: "2.5mm 3mm",
            }}
          >
            <p
              style={{
                fontFamily: "Inter, system-ui, sans-serif",
                fontSize: "8.5pt",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "#1f7a3f",
                margin: 0,
              }}
            >
              Lernziel
            </p>
            <p style={{ marginTop: "1mm", fontSize: "10.5pt", color: "#1a1a1a" }}>
              {ws.learning_goal}
            </p>
          </div>
        )}

        {/* Name / Klasse / Datum */}
        <div
          style={{
            marginTop: "5mm",
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "6mm",
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: "9pt",
            color: "#666",
          }}
        >
          {["Name", "Klasse", "Datum"].map((l) => (
            <div key={l}>
              <span>{l}</span>
              <div style={{ marginTop: "1mm", height: "1px", background: "#888" }} />
            </div>
          ))}
        </div>

        {/* Exercises */}
        <ol style={{ padding: 0, marginTop: "2mm", listStyle: "none" }}>
          {ws.exercises.map((ex, i) => (
            <PrintExercise key={i} ex={ex} index={i} />
          ))}
        </ol>

        {/* Footer (in-flow, not absolute — never clipped) */}
        <footer
          style={{
            marginTop: "8mm",
            paddingTop: "2mm",
            borderTop: "1px solid #ddd",
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: "8pt",
            color: "#888",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          <span>Lehrly · {meta.schoolLabel}</span>
          <span style={{ fontFamily: "ui-monospace, monospace", letterSpacing: "0.05em" }}>
            ID {meta.worksheetId.slice(0, 8).toUpperCase()}
          </span>
        </footer>
      </section>

      {includeSolutions && (
        <section className="a4-page">
          <header
            style={{
              paddingBottom: "3mm",
              borderBottom: "1px solid #d0d0d0",
            }}
          >
            <p
              style={{
                fontFamily: "Inter, system-ui, sans-serif",
                fontSize: "9pt",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "#666",
                margin: 0,
              }}
            >
              Lösungsblatt
            </p>
            <h1
              style={{
                marginTop: "1mm",
                fontFamily: "Inter, system-ui, sans-serif",
                fontSize: "18pt",
                fontWeight: 700,
                color: "#000",
              }}
            >
              {ws.title} — Lösungen
            </h1>
          </header>

          <ol style={{ padding: 0, marginTop: "4mm", listStyle: "none" }}>
            {ws.exercises.map((ex, i) => (
              <li
                key={i}
                className="avoid-break"
                style={{ marginTop: "4mm" }}
              >
                <p
                  style={{
                    fontFamily: "Inter, system-ui, sans-serif",
                    fontSize: "9pt",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "#666",
                    margin: 0,
                  }}
                >
                  Aufgabe {i + 1} · {ex.type}
                </p>
                <p style={{ marginTop: "1mm", fontSize: "11pt", color: "#000" }}>
                  <span style={{ fontWeight: 700 }}>Lösung:</span> {ex.solution}
                </p>
              </li>
            ))}
          </ol>

          <footer
            style={{
              marginTop: "8mm",
              paddingTop: "2mm",
              borderTop: "1px solid #ddd",
              display: "flex",
              justifyContent: "space-between",
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: "8pt",
              color: "#888",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            <span>Lehrly · {meta.schoolLabel} · Lösungen</span>
            <span style={{ fontFamily: "ui-monospace, monospace" }}>
              ID {meta.worksheetId.slice(0, 8).toUpperCase()}
            </span>
          </footer>
        </section>
      )}
    </div>
  );
};

export default PrintWorksheetView;
