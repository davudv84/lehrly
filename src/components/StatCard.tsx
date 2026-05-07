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
  brand: "text-brand bg-brand/10 ring-brand/20",
  amber: "text-amber-300 bg-amber-500/10 ring-amber-500/20",
  sky: "text-sky-300 bg-sky-500/10 ring-sky-500/20",
};

const StatCard = ({ label, value, icon: Icon, accent = "brand", delay = 0 }: Props) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay, ease: [0.22, 0.61, 0.36, 1] }}
    className="glass relative flex-1 overflow-hidden rounded-card border border-white/[0.06] bg-surface/80 p-3.5"
  >
    <div className="flex items-center justify-between">
      <span className="text-[10.5px] font-semibold uppercase tracking-[0.08em] text-text-tertiary">
        {label}
      </span>
      <div className={cn("flex h-6 w-6 items-center justify-center rounded-md ring-1", ACCENTS[accent])}>
        <Icon size={12} />
      </div>
    </div>
    <p className="mt-2 text-[24px] font-bold tracking-[-0.02em] text-text-primary tabular-nums">
      {value}
    </p>
  </motion.div>
);

export default StatCard;
