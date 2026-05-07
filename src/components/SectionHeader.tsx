import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

type Props = {
  label: string;
  action?: { label: string; to?: string; onClick?: () => void };
  className?: string;
};

const SectionHeader = ({ label, action, className }: Props) => (
  <div className={cn("flex items-center justify-between px-1", className)}>
    <p className="section-label">{label}</p>
    {action &&
      (action.to ? (
        <Link
          to={action.to}
          className="text-[12.5px] font-medium text-text-tertiary hover:text-text-primary transition-colors"
        >
          {action.label}
        </Link>
      ) : (
        <button
          onClick={action.onClick}
          className="text-[12.5px] font-medium text-text-tertiary hover:text-text-primary transition-colors"
        >
          {action.label}
        </button>
      ))}
  </div>
);

export default SectionHeader;
