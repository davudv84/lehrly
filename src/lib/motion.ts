import type { Variants, Transition } from "framer-motion";

export const easeOutSoft: [number, number, number, number] = [0.22, 0.61, 0.36, 1];

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: easeOutSoft } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.28, ease: easeOutSoft } },
};

export const stagger = (delay = 0.04): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: delay, delayChildren: 0.04 } },
});

export const cardFloat = {
  whileHover: { y: -3, transition: { duration: 0.22, ease: easeOutSoft } },
  whileTap: { scale: 0.985 },
};

export const softPress = {
  whileTap: { scale: 0.97 },
  transition: { type: "spring", stiffness: 400, damping: 28 } as Transition,
};

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 320, damping: 22 },
  },
};
