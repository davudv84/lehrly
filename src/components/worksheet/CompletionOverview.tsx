import { motion } from "framer-motion";
import { Pencil, Printer, X } from "lucide-react";
import type { WorksheetData } from "./WorksheetSheet";

type Meta = {
  worksheetId: string;
  createdAt: string;
};

type Props = {
  ws: WorksheetData;
  meta: Meta;
  taskTypes?: string[];
  onPrint: () => void;
  onEdit: () => void;
  onClose: () => void;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

const deriveLernziele = (ws: WorksheetData): string[] => {
  if (ws.learning_goal) {
    const parts = ws.learning_goal
      .split(/[•\n;]+|(?:\.\s+(?=[A-ZÄÖÜ]))/)
      .map((s) => s.trim())
      .filter((s) => s.length > 8);
    if (parts.length >= 2) return parts.slice(0, 3);
    if (parts.length === 1) return parts;
  }
  const goals: string[] = [];
  if (ws.topic) goals.push(`Wortschatz und Redemittel zum Thema „${ws.topic}" verstehen und anwenden.`);
  if ((ws.competencies ?? []).includes("Schreiben"))
    goals.push("Eigene Sätze und kurze Texte strukturiert formulieren.");
  if ((ws.competencies ?? []).includes("Grammatik"))
    goals.push("Grammatische Strukturen sicher in Kontext einsetzen.");
  if (goals.length === 0)
    goals.push("Sprachliche Mittel auf Niveau " + ws.niveau + " festigen und anwenden.");
  return goals.slice(0, 3);
};

const exerciseDescriptor = (type: string) => {
  const t = type.toLowerCase();
  if (t.includes("lück")) return "Lücken im Text ergänzen";
  if (t.includes("multiple") || t.includes("auswahl")) return "Richtige Antwort auswählen";
  if (t.includes("zuord")) return "Begriffe einander zuordnen";
  if (t.includes("schreib")) return "Eigenen Text verfassen";
  if (t.includes("wort")) return "Wortschatz aktivieren";
  if (t.includes("grammat")) return "Strukturen üben";
  if (t.includes("satz")) return "Sätze bilden";
  if (t.includes("dialog")) return "Dialog erarbeiten";
  if (t.includes("lese")) return "Text verstehen";
  return "Aufgabe bearbeiten";
};

const CompletionOverview = ({ ws, meta, taskTypes, onPrint, onEdit, onClose }: Props) => {
  const lernziele = deriveLernziele(ws);
  const types = taskTypes ?? Array.from(new Set(ws.exercises.map((e) => e.type)));
  const schwerpunkte = Array.from(
    new Set([
      ...(ws.competencies ?? []),
      ...(ws.topic ? [ws.topic] : []),
    ]),
  );

  return (
    <div
      className="fixed inset-0 z-[70] overflow-y-auto"
      style={{ backgroundColor: "#F5F5F5", colorScheme: "light" }}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: [0.22, 0.61, 0.36, 1] }}
        className="mx-auto w-full max-w-[720px] px-5 py-8"
        style={{
          fontFamily:
            'Inter, "Source Serif 4", -apple-system, BlinkMacSystemFont, sans-serif',
          color: "#1A1A1A",
        }}
      >
        {/* Top bar with close */}
        <div className="mb-4 flex items-center justify-between" style={{ color: "#666" }}>
          <span
            style={{
              fontSize: "11px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            Übersicht
          </span>
          <button
            onClick={onClose}
            aria-label="Schließen"
            className="flex h-9 w-9 items-center justify-center rounded-full"
            style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E5E5", color: "#444" }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Card */}
        <article
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E5E5E5",
            boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
            padding: "36px 40px",
          }}
        >
          {/* Header */}
          <header>
            <h1
              style={{
                fontSize: "26px",
                fontWeight: 700,
                lineHeight: 1.2,
                letterSpacing: "-0.01em",
                color: "#1A1A1A",
                margin: 0,
              }}
            >
              {ws.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Pill>{ws.niveau}</Pill>
              {ws.topic && <Pill>{ws.topic}</Pill>}
              {types.slice(0, 4).map((t) => (
                <Pill key={t} subtle>
                  {t}
                </Pill>
              ))}
            </div>

            <p
              className="mt-4"
              style={{ fontSize: "13px", color: "#666", lineHeight: 1.6 }}
            >
              {ws.exercises.length} Aufgaben
              {ws.duration_min ? ` · ca. ${ws.duration_min} Minuten` : ""}
            </p>
          </header>

          <Divider />

          {/* Lernziele */}
          <Section title="Lernziele">
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {lernziele.map((g, i) => (
                <li
                  key={i}
                  style={{
                    display: "flex",
                    gap: "10px",
                    padding: "6px 0",
                    fontSize: "14.5px",
                    lineHeight: 1.6,
                    color: "#1A1A1A",
                  }}
                >
                  <span style={{ color: "#888", flexShrink: 0 }}>—</span>
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Divider />

          {/* Aufgaben-Übersicht */}
          <Section title="Aufgaben-Übersicht">
            <ol style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {ws.exercises.map((ex, i) => (
                <li
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "28px 1fr",
                    columnGap: "14px",
                    padding: "10px 0",
                    borderTop: i === 0 ? "none" : "1px solid #F0F0F0",
                  }}
                >
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#999",
                      fontVariantNumeric: "tabular-nums",
                      paddingTop: "1px",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: "#1A1A1A",
                        margin: 0,
                        lineHeight: 1.5,
                      }}
                    >
                      {ex.type}
                    </p>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "#666",
                        margin: "2px 0 0 0",
                        lineHeight: 1.55,
                      }}
                    >
                      {ex.instruction || exerciseDescriptor(ex.type)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Section>

          {schwerpunkte.length > 0 && (
            <>
              <Divider />
              <Section title="Sprachliche Schwerpunkte">
                <div className="flex flex-wrap gap-1.5">
                  {schwerpunkte.map((s) => (
                    <span
                      key={s}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        height: "24px",
                        padding: "0 10px",
                        fontSize: "12px",
                        color: "#444",
                        backgroundColor: "#F5F5F5",
                        border: "1px solid #E5E5E5",
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </Section>
            </>
          )}

          <Divider />

          {/* Footer actions */}
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <button
              onClick={onPrint}
              style={{
                flex: 1,
                height: "44px",
                backgroundColor: "#1A1A1A",
                color: "#FFFFFF",
                fontSize: "14px",
                fontWeight: 500,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                border: "1px solid #1A1A1A",
              }}
            >
              <Printer size={15} /> Drucken / Exportieren
            </button>
            <button
              onClick={onEdit}
              style={{
                flex: 1,
                height: "44px",
                backgroundColor: "#FFFFFF",
                color: "#1A1A1A",
                fontSize: "14px",
                fontWeight: 500,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                border: "1px solid #1A1A1A",
              }}
            >
              <Pencil size={14} /> Bearbeiten
            </button>
          </div>

          <p
            className="mt-5 text-center"
            style={{ fontSize: "11.5px", color: "#999", letterSpacing: "0.02em" }}
          >
            Erstellt mit Lehrly · {formatDate(meta.createdAt)}
          </p>
        </article>
      </motion.div>
    </div>
  );
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section style={{ paddingTop: "20px", paddingBottom: "20px" }}>
    <h2
      style={{
        fontSize: "11px",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.14em",
        color: "#666",
        margin: "0 0 12px 0",
      }}
    >
      {title}
    </h2>
    {children}
  </section>
);

const Divider = () => (
  <div style={{ height: "1px", backgroundColor: "#E5E5E5", margin: "0" }} />
);

const Pill = ({ children, subtle }: { children: React.ReactNode; subtle?: boolean }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      height: "26px",
      padding: "0 11px",
      fontSize: "12px",
      fontWeight: 500,
      color: subtle ? "#444" : "#1A1A1A",
      backgroundColor: subtle ? "#F5F5F5" : "#FFFFFF",
      border: `1px solid ${subtle ? "#E5E5E5" : "#1A1A1A"}`,
      letterSpacing: "0.01em",
    }}
  >
    {children}
  </span>
);

export default CompletionOverview;
