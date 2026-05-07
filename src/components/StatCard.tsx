import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  value: number | string;
  icon: LucideIcon;
  accent?: "brand" | "amber" | "sky";
  delay?: number;
};

const ACCENTS: Record<NonNullable<Props["accent"]>, string> = {
  brand: "text-brand-hover",
  amber: "text-amber-300",
  sky: "text-sky-300",
};

const StatCard = ({ label, value, icon: Icon, accent = "brand", delay = 0 }: Props) => (
  <motion.div
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.32, delay, ease: [0.22, 0.61, 0.36, 1] }}
    className="surface-card flex-1 px-4 py-3.5"
  >
    <div className="flex items-center justify-between text-text-tertiary">
      <span className="section-label">{label}</span>
      <Icon size={13} className={cn("opacity-80", ACCENTS[accent])} />
    </div>
    <p className="mt-1.5 font-display text-[24px] font-semibold leading-none tracking-[-0.025em] text-text-primary tabular-nums">
      {value}
    </p>
  </motion.div>
);

export default StatCard;
