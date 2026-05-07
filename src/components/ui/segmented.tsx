import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Option<T extends string> = {
  value: T;
  label: string;
  icon?: ReactNode;
};

type Props<T extends string> = {
  value: T;
  onChange: (v: T) => void;
  options: Option<T>[];
  className?: string;
};

/** iOS-style segmented control with sliding indicator. */
function Segmented<T extends string>({ value, onChange, options, className }: Props<T>) {
  return (
    <div
      role="tablist"
      className={cn(
        "relative flex w-full items-center rounded-pill bg-surface-2 p-1 ring-hairline",
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative z-10 flex h-9 flex-1 items-center justify-center gap-1.5 rounded-pill text-[12.5px] font-medium transition-colors duration-200",
              active ? "text-text-primary" : "text-text-tertiary hover:text-text-secondary",
            )}
          >
            {active && (
              <motion.span
                layoutId="segmented-indicator"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
                className="absolute inset-0 -z-10 rounded-pill bg-surface-3 shadow-xs"
              />
            )}
            {opt.icon}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default Segmented;
