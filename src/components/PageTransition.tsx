import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import type { ReactNode } from "react";

const transition = {
  duration: 0.24,
  ease: [0.32, 0.72, 0, 1] as [number, number, number, number],
};

const PageTransition = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={transition}
      className="min-h-full"
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
