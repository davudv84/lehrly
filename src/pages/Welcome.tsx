import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, FileText, Printer, Zap } from "lucide-react";
import LehrlyMark from "@/components/LehrlyMark";
import TapButton from "@/components/TapButton";

const Welcome = () => {
  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col overflow-hidden bg-bg-base">
      {/* Subtle radial mesh background */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 h-[420px] w-[420px] rounded-full opacity-60 blur-3xl"
        style={{ background: "radial-gradient(circle, hsl(var(--brand) / 0.15), transparent 70%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-24 h-[360px] w-[360px] rounded-full opacity-50 blur-3xl"
        style={{ background: "radial-gradient(circle, hsl(var(--brand) / 0.08), transparent 70%)" }}
      />

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
      <main className="relative z-10 flex flex-1 flex-col px-6 pt-10">
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

          <p className="mt-4 max-w-[320px] text-[15px] leading-relaxed text-text-secondary">
            Lehrly erstellt druckfertige DaF/DaZ-Arbeitsblätter für deinen
            Sprachkurs — mit künstlicher Intelligenz.
          </p>

          {/* CTA */}
          <div className="mt-8 w-full max-w-[280px]">
            <TapButton asChild>
              <Link
                to="/auth/register"
                className="flex h-[52px] w-full items-center justify-center gap-2 rounded-pill bg-brand-gradient text-white shadow-brand-glow"
                style={{ fontSize: 15, fontWeight: 600 }}
              >
                Kostenlos starten
                <ArrowRight size={18} />
              </Link>
            </TapButton>
          </div>
          <p className="mt-3 text-[12px] text-text-tertiary">
            Kein Konto nötig · 3 Blätter kostenlos
          </p>
        </motion.div>

        {/* Trust strip */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.32, 0.72, 0, 1] }}
          className="mt-auto pb-8 pt-12"
        >
          <p className="section-label text-center">
            Für Lehrkräfte in Integrationskursen
          </p>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            <FeaturePill icon={<FileText size={14} />} label="A1 bis C1" />
            <FeaturePill icon={<Zap size={14} />} label="In unter 30 Sekunden" />
            <FeaturePill icon={<Printer size={14} />} label="Druckfertig als PDF" />
          </div>
        </motion.div>

        {/* Footer */}
        <footer
          className="flex items-center justify-center gap-2 pb-6 text-[12px] text-text-tertiary"
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

const FeaturePill = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <div className="inline-flex shrink-0 items-center gap-2 rounded-pill border border-white/10 bg-surface px-3.5 py-2">
    <span className="text-brand">{icon}</span>
    <span className="text-[13px] font-medium text-text-secondary">{label}</span>
  </div>
);

export default Welcome;
