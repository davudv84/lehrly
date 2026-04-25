import { Loader2 } from "lucide-react";
import { type ButtonHTMLAttributes, forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  variant?: "primary" | "outline";
};

const PrimaryButton = forwardRef<HTMLButtonElement, Props>(
  ({ loading, variant = "primary", className, children, disabled, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        disabled={disabled || loading}
        className={cn(
          "relative inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-input text-button transition-opacity",
          variant === "primary" &&
            "bg-brand-gradient text-white shadow-brand-glow disabled:opacity-60",
          variant === "outline" &&
            "border border-white/10 bg-surface text-text-primary hover:border-white/20 disabled:opacity-60",
          className,
        )}
        {...(props as Record<string, unknown>)}
      >
        {loading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          children
        )}
      </motion.button>
    );
  },
);
PrimaryButton.displayName = "PrimaryButton";

export default PrimaryButton;
