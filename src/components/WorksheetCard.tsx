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

/** Mini paper preview shown inside cards. */
const PaperPreview = ({ ws }: { ws: WorksheetCardData }) => (
  <div className="relative aspect-[1/1.414] w-full overflow-hidden rounded-md bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.5)]">
    <div className="absolute inset-x-0 top-0 flex h-[3px]">
      <div className="flex-1 bg-emerald-500" />
      <div className="flex-1 bg-sky-500" />
      <div className="flex-1 bg-amber-500" />
    </div>
    <div className="px-3 pt-3">
      <p
        className="line-clamp-2 text-[8.5px] font-semibold leading-tight text-zinc-900"
        style={{ fontFamily: '"Source Serif 4", serif' }}
      >
        {ws.title}
      </p>
      <div className="mt-2 space-y-1">
        <div className="h-[3px] w-3/4 rounded-full bg-zinc-200" />
        <div className="h-[3px] w-2/3 rounded-full bg-zinc-200" />
        <div className="h-[3px] w-4/5 rounded-full bg-zinc-200" />
        <div className="mt-1.5 h-[3px] w-1/2 rounded-full bg-zinc-300" />
        <div className="h-[3px] w-3/5 rounded-full bg-zinc-200" />
      </div>
    </div>
  </div>
);

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
          "group block w-40 shrink-0 overflow-hidden rounded-card border border-white/[0.06] bg-surface p-2.5 transition-colors hover:border-white/15",
          className,
        )}
      >
        <PaperPreview ws={ws} />
        <div className="mt-2.5">
          <div className="flex items-center justify-between">
            <NiveauBadge niveau={ws.niveau} />
            <span className="text-[10.5px] text-text-tertiary">
              {formatRelative(ws.created_at)}
            </span>
          </div>
          <p className="mt-1.5 line-clamp-2 text-[12.5px] font-semibold leading-snug text-text-primary">
            {ws.title}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/worksheets/${ws.id}`}
      className={cn(
        "group block overflow-hidden rounded-card border border-white/[0.06] bg-surface p-3 transition-colors hover:border-white/15",
        className,
      )}
    >
      <PaperPreview ws={ws} />
      <div className="mt-2.5 flex items-center justify-between">
        <NiveauBadge niveau={ws.niveau} />
        <span className="text-[10.5px] text-text-tertiary">
          {formatRelative(ws.created_at)}
        </span>
      </div>
      <p className="mt-1.5 line-clamp-2 text-[12.5px] font-semibold leading-snug text-text-primary">
        {ws.title}
      </p>
      {ws.task_types.length > 0 && (
        <p className="mt-1 line-clamp-1 text-[10.5px] text-text-tertiary">
          {ws.task_types.slice(0, 2).join(" · ")}
        </p>
      )}
    </Link>
  );
};

export default WorksheetCard;
