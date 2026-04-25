import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import TapButton from "@/components/TapButton";

const Intro = () => {
  const navigate = useNavigate();
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-bg-base">
      <AppHeader />
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
        >
          <p className="section-label mb-4">DaF · DaZ</p>
          <h1 className="text-h1 text-text-primary">Arbeitsblätter in Sekunden.</h1>
          <p className="mt-4 text-body text-text-secondary">
            Der Splash-Carousel folgt in Phase 2.
          </p>
        </motion.div>
      </main>
      <div className="px-6 pb-10" style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 24px)" }}>
        <TapButton
          onClick={() => navigate("/")}
          className="h-12 w-full rounded-pill bg-brand-gradient text-button text-white shadow-brand-glow"
        >
          Loslegen
        </TapButton>
      </div>
    </div>
  );
};

export default Intro;
