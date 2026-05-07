import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import NiveauBadge from "./NiveauBadge";
import { cn } from "@/lib/utils";

export type WorksheetCardData = {
  id: string;
  title: string;
  niveau: string;
  task_types: string[];
  created_at: string;
  is_favorite?: boolean;
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

const NIVEAU_STRIPE: Record<string, string> = {
  A1: "bg-emerald-500",
  A2: "bg-teal-500",
  B1: "bg-sky-500",
  B2: "bg-amber-500",
  C1: "bg-fuchsia-500",
  C2: "bg-rose-500",
};

/** Mini paper preview shown inside cards — looks like a real document. */
const PaperPreview = ({ ws }: { ws: WorksheetCardData }) => {
  const stripe = NIVEAU_STRIPE[ws.niveau] ?? "bg-emerald-500";
  const hasMC = ws.task_types.some((t) => /multiple|choice/i.test(t));
  const hasMatch = ws.task_types.some((t) => /zuordn/i.test(t));
  return (
    <div className="relative aspect-[1/1.414] w-full overflow-hidden rounded-md bg-white shadow-[0_4px_14px_-6px_rgba(0,0,0,0.55),inset_0_0_0_1px_rgba(0,0,0,0.04)]">
      <div className={cn("absolute inset-x-0 top-0 h-[3px]", stripe)} />
      <div className="px-3 pt-3.5">
        <p
          className="line-clamp-2 text-[8.5px] font-semibold leading-tight text-zinc-900"
          style={{ fontFamily: '"Source Serif 4", serif' }}
        >
          {ws.title}
        </p>
        <div className="mt-0.5 flex items-center gap-1">
          <span className="rounded-sm bg-zinc-100 px-1 py-px text-[6px] font-bold uppercase tracking-wide text-zinc-500">
            {ws.niveau}
          </span>
          <span className="text-[6.5px] text-zinc-400">·</span>
          <span className="text-[6.5px] text-zinc-400">Aufgabe 1</span>
        </div>
        <div className="mt-2 space-y-1">
          <div className="h-[2.5px] w-3/4 rounded-full bg-zinc-200" />
          <div className="h-[2.5px] w-2/3 rounded-full bg-zinc-200" />
          <div className="h-[2.5px] w-4/5 rounded-full bg-zinc-200" />
        </div>

        {hasMC ? (
          <div className="mt-2.5 space-y-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-1">
                <div className="h-1.5 w-1.5 rounded-full border border-zinc-300" />
                <div className="h-[2.5px] flex-1 rounded-full bg-zinc-200" />
              </div>
            ))}
          </div>
        ) : hasMatch ? (
          <div className="mt-2.5 grid grid-cols-2 gap-x-2 gap-y-1">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-[2.5px] rounded-full bg-zinc-200" />
            ))}
          </div>
        ) : (
          <div className="mt-2.5 space-y-1">
            <div className="h-[2.5px] w-1/2 rounded-full bg-zinc-300" />
            <div className="flex items-center gap-1">
              <div className="h-[2.5px] w-1/4 rounded-full bg-zinc-200" />
              <div className="h-[6px] w-5 rounded border-b border-dotted border-zinc-400" />
              <div className="h-[2.5px] flex-1 rounded-full bg-zinc-200" />
            </div>
            <div className="h-[2.5px] w-3/5 rounded-full bg-zinc-200" />
          </div>
        )}
      </div>
    </div>
  );
};

type Props = {
  ws: WorksheetCardData;
  variant?: "grid" | "row";
  className?: string;
};

const WorksheetCard = ({ ws, variant = "grid", className }: Props) => {
  const inner = (
    <>
      <div className="relative">
        <PaperPreview ws={ws} />
        {ws.is_favorite && (
          <div className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400/95 text-zinc-900 shadow">
            <Star size={10} fill="currentColor" />
          </div>
        )}
      </div>
      <div className={cn("mt-2.5", variant === "row" ? "" : "")}>
        <div className="flex items-center justify-between">
          <NiveauBadge niveau={ws.niveau} />
          <span className="text-[10.5px] text-text-tertiary">
            {formatRelative(ws.created_at)}
          </span>
        </div>
        <p className="mt-1.5 line-clamp-2 text-[12.5px] font-semibold leading-snug text-text-primary">
          {ws.title}
        </p>
        {variant === "grid" && ws.task_types.length > 0 && (
          <p className="mt-1 line-clamp-1 text-[10.5px] text-text-tertiary">
            {ws.task_types.slice(0, 2).join(" · ")}
          </p>
        )}
      </div>
    </>
  );

  return (
    <motion.div
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.22, ease: [0.22, 0.61, 0.36, 1] }}
      className={cn(
        "float-card group block overflow-hidden rounded-card border border-white/[0.06] bg-surface p-2.5",
        variant === "row" ? "w-40 shrink-0" : "p-3",
        className,
      )}
    >
      <Link to={`/worksheets/${ws.id}`} className="block">
        {inner}
      </Link>
    </motion.div>
  );
};

export default WorksheetCard;
