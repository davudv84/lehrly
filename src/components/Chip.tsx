import { cn } from "@/lib/utils";
import TapButton from "./TapButton";

type ChipProps = {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md";
};

/** Pill-shaped filter/select chip. */
const Chip = ({ active, onClick, children, className, size = "md" }: ChipProps) => {
  const base = active
    ? "border-brand bg-brand-muted text-brand"
    : "border-white/10 bg-bg-elevated text-text-secondary";
  return (
    <TapButton
      onClick={onClick}
      className={cn(
        "rounded-pill border transition-colors whitespace-nowrap font-medium",
        size === "md" ? "h-9 px-4 text-[13px]" : "h-7 px-3 text-[12px]",
        base,
        className,
      )}
    >
      {children}
    </TapButton>
  );
};

export default Chip;
