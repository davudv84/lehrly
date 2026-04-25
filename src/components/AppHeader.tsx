import LehrlyMark from "./LehrlyMark";
import { cn } from "@/lib/utils";

type AppHeaderProps = {
  className?: string;
  right?: React.ReactNode;
  /** Override the default Lehrly wordmark with a custom title. */
  title?: React.ReactNode;
};

/**
 * Header used on auth + intro screens. The in-app pages use PageHeader.
 */
const AppHeader = ({ className, right, title }: AppHeaderProps) => {
  return (
    <header
      className={cn(
        "flex w-full items-center justify-between px-5 pt-3 pb-2",
        className,
      )}
      style={{ paddingTop: `calc(env(safe-area-inset-top, 0px) + 12px)` }}
    >
      <div className="flex items-center">{title ?? <LehrlyMark size={24} />}</div>
      {right ? <div className="flex items-center gap-2">{right}</div> : null}
    </header>
  );
};

export default AppHeader;
