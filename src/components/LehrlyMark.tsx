import { cn } from "@/lib/utils";

type LehrlyMarkProps = {
  className?: string;
  /** Visual size of the wordmark in px (controls font-size). */
  size?: number;
  showDot?: boolean;
};

const LehrlyMark = ({ className, size = 24, showDot = true }: LehrlyMarkProps) => {
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      {showDot && (
        <span
          aria-hidden
          className="brand-dot inline-block rounded-full"
          style={{ width: Math.max(8, size / 3), height: Math.max(8, size / 3) }}
        />
      )}
      <span
        className="font-sans text-text-primary"
        style={{
          fontSize: size,
          fontWeight: 700,
          letterSpacing: "-0.03em",
          lineHeight: 1,
        }}
      >
        Lehrly
      </span>
    </div>
  );
};

export default LehrlyMark;
