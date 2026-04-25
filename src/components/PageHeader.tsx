import { cn } from "@/lib/utils";
import LehrlyMark from "./LehrlyMark";

type PageHeaderProps = {
  title?: string;
  eyebrow?: string;
  right?: React.ReactNode;
  /** Show the Lehrly wordmark instead of a title (used on Home). */
  brand?: boolean;
  className?: string;
};

const PageHeader = ({ title, eyebrow, right, brand, className }: PageHeaderProps) => {
  return (
    <header
      className={cn("flex items-end justify-between px-5 pb-4", className)}
      style={{ paddingTop: `calc(env(safe-area-inset-top, 0px) + 16px)` }}
    >
      <div className="min-w-0">
        {eyebrow && <p className="section-label mb-2">{eyebrow}</p>}
        {brand ? (
          <LehrlyMark size={28} />
        ) : (
          <h1 className="text-h1 text-text-primary truncate">{title}</h1>
        )}
      </div>
      {right ? <div className="ml-3 flex shrink-0 items-center gap-2">{right}</div> : null}
    </header>
  );
};

export default PageHeader;
