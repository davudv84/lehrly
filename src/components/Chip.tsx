import { cn } from "@/lib/utils";
import TapButton from "./TapButton";

type ChipProps = {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md";
};

/** Pill-shaped filter/select chip — calm, editorial. */
const Chip = ({ active, onClick, children, className, size = "md" }: ChipProps) => {
  const base = active
    ? "bg-brand-soft text-brand-hover ring-1 ring-brand/30"
    : "bg-surface-2 text-text-secondary ring-1 ring-hairline/40 hover:text-text-primary hover:bg-surface-3";
  return (
    <TapButton
      onClick={onClick}
      className={cn(
        "rounded-pill transition-all duration-200 whitespace-nowrap font-medium",
        size === "md" ? "h-9 px-4 text-[13px]" : "h-8 px-3.5 text-[12.5px]",
        base,
        className,
      )}
    >
      {children}
    </TapButton>
  );
};

export default Chip;
