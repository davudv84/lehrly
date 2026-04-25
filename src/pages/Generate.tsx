import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TapButton from "@/components/TapButton";

const Generate = () => {
  const navigate = useNavigate();
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-bg-base/70 backdrop-blur-md">
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ duration: 0.24, ease: [0.32, 0.72, 0, 1] }}
        className="mx-auto w-full max-w-md rounded-t-large border-t border-white/[0.06] bg-bg-elevated"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div>
            <p className="section-label mb-1">Neu</p>
            <h2 className="text-h2 text-text-primary">Arbeitsblatt erstellen</h2>
          </div>
          <TapButton
            aria-label="Schließen"
            onClick={() => navigate(-1)}
            className="h-10 w-10 rounded-pill bg-surface text-text-secondary"
          >
            <X size={18} />
          </TapButton>
        </div>
        <div className="px-5 pb-8 pt-2">
          <div className="rounded-card border border-white/[0.06] bg-surface px-5 py-6 text-center">
            <p className="section-label mb-2">Bald verfügbar</p>
            <p className="text-body text-text-secondary">
              Der KI-Generator mit Themen, Niveau und Aufgabentypen folgt in einer der nächsten Phasen.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Generate;
