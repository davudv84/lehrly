import { Link } from "react-router-dom";
import NiveauBadge from "./NiveauBadge";
import { cn } from "@/lib/utils";

export type WorksheetCardData = {
  id: string;
  title: string;
  niveau: string;
  task_types: string[];
  created_at: string;
};

const formatRelative = (iso: string) => {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `vor ${Math.max(1, mins)} Min.`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `vor ${hrs} Std.`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "gestern";
  if (days < 7) return `vor ${days} Tagen`;
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "short" });
};

type Props = {
  ws: WorksheetCardData;
  variant?: "grid" | "row";
  className?: string;
};

const WorksheetCard = ({ ws, variant = "grid", className }: Props) => {
  if (variant === "row") {
    return (
      <Link
        to={`/worksheets/${ws.id}`}
        className={cn(
          "block w-44 shrink-0 overflow-hidden rounded-card border border-white/[0.06] bg-surface",
          className,
        )}
      >
        <div className="relative h-28 bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-3">
          <div className="flex items-start justify-between">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand text-[11px] font-bold text-white">
              {ws.title.slice(0, 1)}
            </div>
            <NiveauBadge niveau={ws.niveau} />
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="h-2 w-3/4 rounded-full bg-white/10" />
            <div className="h-2 w-1/2 rounded-full bg-white/[0.06]" />
            <div className="h-2 w-2/3 rounded-full bg-white/[0.06]" />
          </div>
        </div>
        <div className="p-3">
          <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-text-primary">
            {ws.title}
          </p>
          <p className="mt-1.5 text-[11px] text-text-tertiary">
            {formatRelative(ws.created_at)}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/worksheets/${ws.id}`}
      className={cn(
        "group block overflow-hidden rounded-card border border-white/[0.06] bg-surface",
        className,
      )}
    >
      <div className="relative h-32 bg-gradient-to-br from-white/[0.05] to-white/[0.01] p-3">
        <div className="flex items-start justify-between">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-brand text-[10px] font-bold text-white">
            {ws.title.slice(0, 1)}
          </div>
          <NiveauBadge niveau={ws.niveau} />
        </div>
        <div className="mt-3 space-y-1.5">
          <div className="h-1.5 w-3/4 rounded-full bg-white/10" />
          <div className="h-1.5 w-1/2 rounded-full bg-white/[0.06]" />
          <div className="h-1.5 w-2/3 rounded-full bg-white/[0.06]" />
        </div>
      </div>
      <div className="p-3">
        <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-text-primary">
          {ws.title}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <NiveauBadge niveau={ws.niveau} />
          <span className="text-[11px] text-text-tertiary">{formatRelative(ws.created_at)}</span>
        </div>
      </div>
    </Link>
  );
};

export default WorksheetCard;
