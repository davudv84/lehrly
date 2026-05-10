import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import LehrlyMark from "@/components/LehrlyMark";
import TapButton from "@/components/TapButton";

const TRUST_CHIPS = ["A1–C1", "PDF", "Lösungsblatt", "Klassenbuch", "Korrektur"];

const Welcome = () => {
  const scrollToPreview = () => {
    document.getElementById("beispiel")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col bg-bg-base">
      {/* Header */}
      <header
        className="relative z-10 flex items-center justify-between px-6"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 20px)" }}
      >
        <LehrlyMark size={20} />
        <Link
          to="/auth/login"
          className="text-[14px] font-semibold text-brand hover:text-brand-hover"
        >
          Anmelden
        </Link>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex flex-1 flex-col px-6 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
          className="flex flex-col items-center text-center"
        >
          {/* Badge pill */}
          <div className="inline-flex items-center gap-2 rounded-pill border border-brand/30 bg-brand/10 px-3 py-1.5">
            <span className="brand-dot inline-block h-1.5 w-1.5 rounded-full" />
            <span className="text-[12px] font-medium text-brand">
              Für DaF/DaZ-Lehrkräfte
            </span>
          </div>

          <h1
            className="mt-6 text-text-primary"
            style={{
              fontSize: 36,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
            }}
          >
            Arbeitsblätter,
            <br />
            in Sekunden.
          </h1>

          <p className="mt-4 max-w-[340px] text-[14.5px] leading-relaxed text-text-secondary">
            Wähle Niveau, Thema und Aufgabentyp. Lehrly erstellt dir ein
            druckfertiges Arbeitsblatt mit Lösungsblatt und Klassenbucheintrag.
          </p>

          {/* CTAs */}
          <div className="mt-7 flex w-full max-w-[320px] flex-col gap-2.5">
            <TapButton asChild>
              <Link
                to="/generate"
                className="flex h-[50px] w-full items-center justify-center gap-2 rounded-pill bg-brand text-white hover:bg-brand-hover"
                style={{ fontSize: 15, fontWeight: 600 }}
              >
                Kostenlos testen
                <ArrowRight size={18} />
              </Link>
            </TapButton>
            <button
              onClick={scrollToPreview}
              className="flex h-[46px] w-full items-center justify-center rounded-pill border border-white/10 bg-surface text-[14px] font-medium text-text-primary hover:bg-surface-2 transition-colors"
            >
              Beispiel ansehen
            </button>
          </div>

          <p className="mt-3 text-[12px] leading-relaxed text-text-tertiary">
            3 Arbeitsblätter kostenlos · Keine Kreditkarte · Gastmodus möglich
          </p>

          {/* Trust chips */}
          <div className="mt-6 flex flex-wrap justify-center gap-1.5">
            {TRUST_CHIPS.map((c) => (
              <span
                key={c}
                className="rounded-pill border border-white/10 bg-surface px-2.5 py-1 text-[11.5px] font-medium text-text-secondary"
              >
                {c}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Worksheet preview card */}
        <motion.div
          id="beispiel"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.32, 0.72, 0, 1] }}
          className="mt-10 scroll-mt-6"
        >
          <p className="section-label mb-3 text-center">So sieht es aus</p>
          <WorksheetPreviewCard />
        </motion.div>

        {/* Footer */}
        <footer
          className="mt-auto flex items-center justify-center gap-2 pt-10 text-[12px] text-text-tertiary"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 24px)" }}
        >
          <a href="/impressum" className="hover:text-brand">Impressum</a>
          <span>·</span>
          <a href="/privacy" className="hover:text-brand">Datenschutz</a>
          <span>·</span>
          <a href="/kontakt" className="hover:text-brand">Kontakt</a>
        </footer>
      </main>
    </div>
  );
};

/* ---------- Mini worksheet preview ---------- */
const WorksheetPreviewCard = () => (
  <div
    className="mx-auto w-full overflow-hidden rounded-[14px] border border-white/10 bg-surface p-3 shadow-xl"
    style={{ maxWidth: 360 }}
  >
    {/* Paper */}
    <div
      className="rounded-[8px] bg-white p-5 text-left"
      style={{ fontFamily: "'Source Serif 4', Georgia, serif", color: "#111418" }}
    >
      <div className="flex items-start justify-between border-b border-black/10 pb-2.5">
        <div>
          <p
            className="text-[10px] uppercase tracking-[0.12em] text-black/55"
            style={{ fontFamily: "Inter, system-ui, sans-serif", fontWeight: 600 }}
          >
            Lehrly · Arbeitsblatt
          </p>
          <p
            className="mt-0.5 text-[13.5px] font-semibold text-black/85"
            style={{ fontFamily: "Inter, system-ui, sans-serif" }}
          >
            Im Restaurant
          </p>
        </div>
        <span
          className="rounded-[3px] border border-black/80 px-1.5 py-0.5 text-[10px] font-bold text-black"
          style={{ fontFamily: "Inter, system-ui, sans-serif" }}
        >
          A2
        </span>
      </div>

      <h3
        className="mt-3 text-[15px] font-bold leading-snug text-black"
        style={{ fontFamily: "Inter, system-ui, sans-serif", letterSpacing: "-0.01em" }}
      >
        Bestellen und bezahlen
      </h3>
      <p
        className="mt-0.5 text-[10.5px] text-black/55"
        style={{ fontFamily: "Inter, system-ui, sans-serif" }}
      >
        Thema: Restaurant · 5 Aufgaben · ≈ 25 Min.
      </p>

      <div className="mt-3.5 space-y-2.5">
        <PreviewTask
          n={1}
          type="Lückentext"
          instruction="Ergänze die fehlenden Wörter."
          body={
            <p className="text-[11.5px] leading-relaxed text-black/85">
              Ich <Blank w={42} /> einen Tisch für zwei Personen,{" "}
              <Blank w={28} />.
            </p>
          }
        />
        <PreviewTask
          n={2}
          type="Multiple Choice"
          instruction="Wähle die richtige Antwort."
          body={
            <ul className="mt-1 space-y-1 text-[11.5px] text-black/85">
              <li className="flex gap-2">
                <span className="inline-flex h-3.5 w-3.5 items-center justify-center border border-black/55 text-[8.5px] font-semibold text-black/65">a</span>
                Die Speisekarte, bitte.
              </li>
              <li className="flex gap-2">
                <span className="inline-flex h-3.5 w-3.5 items-center justify-center border border-black/55 text-[8.5px] font-semibold text-black/65">b</span>
                Wo ist der Bahnhof?
              </li>
            </ul>
          }
        />
      </div>

      <div
        className="mt-4 flex items-center justify-between border-t border-black/10 pt-2 text-[9.5px] uppercase tracking-[0.1em] text-black/45"
        style={{ fontFamily: "Inter, system-ui, sans-serif" }}
      >
        <span>+ Lösungsblatt</span>
        <span>+ Klassenbucheintrag</span>
      </div>
    </div>
  </div>
);

const PreviewTask = ({
  n,
  type,
  instruction,
  body,
}: {
  n: number;
  type: string;
  instruction: string;
  body: React.ReactNode;
}) => (
  <div>
    <div
      className="flex items-baseline gap-2 text-black/60"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <span className="text-[9.5px] font-bold uppercase tracking-[0.1em]">
        Aufgabe {n}
      </span>
      <span className="h-px flex-1 bg-black/15" />
      <span className="text-[9px] uppercase tracking-[0.08em] text-black/45">{type}</span>
    </div>
    <p
      className="mt-1 text-[11.5px] font-semibold text-black/90"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      {instruction}
    </p>
    <div className="mt-1">{body}</div>
  </div>
);

const Blank = ({ w }: { w: number }) => (
  <span
    className="inline-block align-baseline"
    style={{ width: w, borderBottom: "1px solid #111", marginInline: 3 }}
  />
);

export default Welcome;
