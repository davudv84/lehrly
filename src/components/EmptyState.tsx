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
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
    className={cn("flex flex-col items-center px-6 py-14 text-center", className)}
  >
    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2 ring-hairline">
      {icon ?? <Sparkles size={22} className="text-brand-hover" />}
    </div>
    <p className="font-display text-[17px] font-semibold tracking-[-0.015em] text-text-primary">
      {title}
    </p>
    {description && (
      <p className="mt-1.5 max-w-[280px] text-[13.5px] leading-relaxed text-text-secondary">
        {description}
      </p>
    )}
    {action && <div className="mt-5">{action}</div>}
  </motion.div>
);

export default EmptyState;
