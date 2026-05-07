import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

const EmptyState = ({ icon, title, description, action, className }: Props) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
    className={cn("flex flex-col items-center px-6 py-12 text-center", className)}
  >
    <div className="relative mb-6 flex h-20 w-20 items-center justify-center">
      <div className="absolute inset-0 rounded-full bg-brand/15 blur-2xl animate-pulse-glow" />
      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.08] bg-surface-elevated shadow-[inset_0_1px_0_0_hsl(0_0%_100%/0.04)]">
        {icon ?? <Sparkles size={26} className="text-brand" />}
      </div>
    </div>
    <p className="text-[18px] font-semibold tracking-[-0.01em] text-text-primary">
      {title}
    </p>
    {description && (
      <p className="mt-2 max-w-[280px] text-[13.5px] leading-relaxed text-text-secondary">
        {description}
      </p>
    )}
    {action && <div className="mt-6">{action}</div>}
  </motion.div>
);

export default EmptyState;
