import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

/**
 * TapButton — global press feedback (scale 0.97 + spring back).
 * Use everywhere a button or pressable element is needed.
 */
export type TapButtonProps = HTMLMotionProps<"button"> & {
  asChild?: boolean;
};

const TapButton = forwardRef<HTMLButtonElement, TapButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={cn(
          "inline-flex items-center justify-center select-none outline-none focus-visible:ring-2 focus-visible:ring-brand/60 focus-visible:ring-offset-0",
          className,
        )}
        {...props}
      >
        {children}
      </motion.button>
    );
  },
);
TapButton.displayName = "TapButton";

export default TapButton;
