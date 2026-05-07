import { cn } from "@/lib/utils";
import LehrlyMark from "./LehrlyMark";

type PageHeaderProps = {
  title?: string;
  eyebrow?: string;
  subtitle?: string;
  right?: React.ReactNode;
  brand?: boolean;
  className?: string;
};

const PageHeader = ({ title, eyebrow, subtitle, right, brand, className }: PageHeaderProps) => {
  return (
    <header
      className={cn("flex items-end justify-between px-5 pb-5", className)}
      style={{ paddingTop: `calc(env(safe-area-inset-top, 0px) + 18px)` }}
    >
      <div className="min-w-0">
        {eyebrow && <p className="section-label mb-2">{eyebrow}</p>}
        {brand ? (
          <LehrlyMark size={28} />
        ) : (
          <h1 className="font-display text-[26px] font-semibold leading-tight tracking-[-0.022em] text-text-primary truncate">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="mt-1 text-[13.5px] text-text-secondary">{subtitle}</p>
        )}
      </div>
      {right ? <div className="ml-3 flex shrink-0 items-center gap-2">{right}</div> : null}
    </header>
  );
};

export default PageHeader;
