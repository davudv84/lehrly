import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, Printer, Save } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import TapButton from "@/components/TapButton";
import { toast } from "sonner";

type Wrong = { student: string; correct: string; note?: string };
type ExBreak = { number: number; title?: string; score: number; max: number; wrong_answers?: Wrong[] };

type Correction = {
  id: string;
  student_name: string | null;
  score: number;
  max_score: number;
  grade: number | null;
  exercise_breakdown: { exercises: ExBreak[]; summary?: string | null; title?: string };
  worksheet_id: string | null;
  created_at: string;
};

const CorrectionResult = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [c, setC] = useState<Correction | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !user) return;
    (async () => {
      const { data } = await supabase.from("corrections").select("*").eq("id", id).maybeSingle();
      const row = data as unknown as Correction | null;
      setC(row);
      setName(row?.student_name ?? "");
      setLoading(false);
    })();
  }, [id, user]);

  const saveName = async () => {
    if (!c) return;
    const { error } = await supabase.from("corrections").update({ student_name: name }).eq("id", c.id);
    if (error) toast.error("Speichern fehlgeschlagen");
    else toast.success("Korrektur gespeichert");
  };

  if (loading) return <div className="p-10 text-center text-text-tertiary">Lädt…</div>;
  if (!c)
    return (
      <div className="p-10 text-center">
        <p className="text-text-primary">Korrektur nicht gefunden.</p>
        <button onClick={() => navigate("/library")} className="mt-3 text-brand-hover">
          Zur Bibliothek
        </button>
      </div>
    );

  const pct = c.max_score > 0 ? Math.round((Number(c.score) / Number(c.max_score)) * 100) : 0;
  const exs = c.exercise_breakdown.exercises ?? [];
  const title = c.exercise_breakdown.title ?? "Korrekturergebnis";

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto" style={{ backgroundColor: "#F5F5F5", colorScheme: "light" }}>
      <div className="mx-auto w-full max-w-[720px] px-5 py-8" style={{ color: "#1A1A1A", fontFamily: 'Inter, -apple-system, sans-serif' }}>
        <div className="mb-4 flex items-center justify-between no-print">
          <TapButton
            onClick={() => navigate(-1)}
            aria-label="Zurück"
            className="flex h-9 w-9 items-center justify-center rounded-full"
            style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E5E5", color: "#444" }}
          >
            <ArrowLeft size={16} />
          </TapButton>
          <span style={{ fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 600, color: "#666" }}>
            Korrekturergebnis
          </span>
          <div style={{ width: 36 }} />
        </div>

        <article style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E5E5", padding: "32px 36px", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
          <header>
            <h1 style={{ fontSize: "24px", fontWeight: 700, lineHeight: 1.2, margin: 0 }}>{title}</h1>
            <div className="mt-3">
              <label style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.12em", color: "#666", fontWeight: 600 }}>
                Schüler:in
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={saveName}
                placeholder="Name eintragen"
                style={{
                  display: "block",
                  marginTop: 6,
                  width: "100%",
                  height: 38,
                  padding: "0 12px",
                  fontSize: 14,
                  border: "1px solid #E5E5E5",
                  backgroundColor: "#FAFAFA",
                  color: "#1A1A1A",
                }}
              />
            </div>
          </header>

          {/* Score card */}
          <div
            style={{
              marginTop: 24,
              padding: "20px 22px",
              border: "1px solid #1A1A1A",
              backgroundColor: "#FAFAFA",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <div>
              <p style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#666", margin: 0, fontWeight: 600 }}>
                Gesamt
              </p>
              <p style={{ fontSize: 30, fontWeight: 700, margin: "4px 0 0 0", lineHeight: 1.1 }}>
                {c.score} / {c.max_score} <span style={{ fontSize: 14, color: "#666", fontWeight: 500 }}>Punkte</span>
              </p>
              <p style={{ fontSize: 13, color: "#666", margin: "4px 0 0 0" }}>{pct}% richtig</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 11, color: "#666", margin: 0, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600 }}>Note</p>
              <p style={{ fontSize: 38, fontWeight: 700, margin: "2px 0 0 0", lineHeight: 1 }}>{c.grade ?? "—"}</p>
            </div>
          </div>

          {c.exercise_breakdown.summary && (
            <p style={{ marginTop: 18, fontSize: 13.5, color: "#444", lineHeight: 1.6 }}>
              {c.exercise_breakdown.summary}
            </p>
          )}

          {/* Per-exercise */}
          <section style={{ marginTop: 24 }}>
            <h2 style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "#666", margin: "0 0 12px 0" }}>
              Aufgaben
            </h2>
            <ol style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {exs.map((ex) => {
                const full = ex.score === ex.max && (ex.wrong_answers?.length ?? 0) === 0;
                return (
                  <li key={ex.number} style={{ borderTop: "1px solid #F0F0F0", padding: "14px 0" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>
                        Aufgabe {ex.number}
                        {ex.title ? <span style={{ color: "#666", fontWeight: 400 }}> · {ex.title}</span> : null}
                      </p>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13.5, fontWeight: 600, color: full ? "#15803D" : "#1A1A1A" }}>
                        {ex.score} / {ex.max}
                        {full && <Check size={15} color="#15803D" strokeWidth={3} />}
                      </span>
                    </div>
                    {(ex.wrong_answers ?? []).map((w, i) => (
                      <div key={i} style={{ marginTop: 8, fontSize: 13.5, lineHeight: 1.6 }}>
                        <span style={{ textDecoration: "line-through", color: "#B91C1C", marginRight: 8 }}>{w.student}</span>
                        <span style={{ color: "#15803D", fontWeight: 600 }}>{w.correct}</span>
                        {w.note && <span style={{ color: "#666", marginLeft: 8 }}>— {w.note}</span>}
                      </div>
                    ))}
                  </li>
                );
              })}
            </ol>
          </section>

          <div className="no-print" style={{ marginTop: 28, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              onClick={() => window.print()}
              style={{ flex: 1, height: 44, backgroundColor: "#1A1A1A", color: "#FFFFFF", fontSize: 14, fontWeight: 500, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, border: "1px solid #1A1A1A" }}
            >
              <Printer size={15} /> Als PDF exportieren
            </button>
            <button
              onClick={saveName}
              style={{ flex: 1, height: 44, backgroundColor: "#FFFFFF", color: "#1A1A1A", fontSize: 14, fontWeight: 500, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, border: "1px solid #1A1A1A" }}
            >
              <Save size={14} /> Korrektur speichern
            </button>
          </div>
        </article>
      </div>
    </div>
  );
};

export default CorrectionResult;
