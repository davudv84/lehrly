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
  A1: "bg-emerald-400",
  A2: "bg-teal-400",
  B1: "bg-sky-400",
  B2: "bg-amber-400",
  C1: "bg-fuchsia-400",
  C2: "bg-rose-400",
};

/** Mini paper preview — calm, editorial. */
const PaperPreview = ({ ws }: { ws: WorksheetCardData }) => {
  const stripe = NIVEAU_STRIPE[ws.niveau] ?? "bg-emerald-400";
  const hasMC = ws.task_types.some((t) => /multiple|choice/i.test(t));
  const hasMatch = ws.task_types.some((t) => /zuordn/i.test(t));
  return (
    <div className="relative aspect-[1/1.414] w-full overflow-hidden rounded-md bg-[#FAFAF7] shadow-[0_2px_8px_-4px_rgba(0,0,0,0.4),inset_0_0_0_1px_rgba(0,0,0,0.04)]">
      <div className={cn("absolute inset-y-3 left-2 w-[2px] rounded-full opacity-80", stripe)} />
      <div className="px-3.5 pt-3.5 pl-5">
        <p
          className="line-clamp-2 text-[8.5px] leading-tight text-zinc-800"
          style={{ fontFamily: '"Source Serif 4", serif', fontWeight: 600 }}
        >
          {ws.title}
        </p>
        <div className="mt-1 flex items-center gap-1">
          <span className="text-[6px] font-medium uppercase tracking-[0.1em] text-zinc-400">
            {ws.niveau} · Aufgabe 1
          </span>
        </div>
        <div className="mt-2 space-y-[3px]">
          <div className="h-[2px] w-3/4 rounded-full bg-zinc-200" />
          <div className="h-[2px] w-2/3 rounded-full bg-zinc-200" />
          <div className="h-[2px] w-4/5 rounded-full bg-zinc-200" />
        </div>

        {hasMC ? (
          <div className="mt-2.5 space-y-[3px]">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-1">
                <div className="h-1.5 w-1.5 rounded-full ring-1 ring-zinc-300" />
                <div className="h-[2px] flex-1 rounded-full bg-zinc-200" />
              </div>
            ))}
          </div>
        ) : hasMatch ? (
          <div className="mt-2.5 grid grid-cols-2 gap-x-2 gap-y-[3px]">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-[2px] rounded-full bg-zinc-200" />
            ))}
          </div>
        ) : (
          <div className="mt-2.5 space-y-[3px]">
            <div className="flex items-center gap-1">
              <div className="h-[2px] w-1/4 rounded-full bg-zinc-200" />
              <div className="h-[6px] w-5 border-b border-dotted border-zinc-400" />
              <div className="h-[2px] flex-1 rounded-full bg-zinc-200" />
            </div>
            <div className="h-[2px] w-3/5 rounded-full bg-zinc-200" />
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
          <div className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-300/95 text-zinc-900">
            <Star size={9} fill="currentColor" />
          </div>
        )}
      </div>
      <div className="mt-2.5">
        <div className="flex items-center justify-between">
          <NiveauBadge niveau={ws.niveau} />
          <span className="text-[10.5px] text-text-tertiary">
            {formatRelative(ws.created_at)}
          </span>
        </div>
        <p
          className="mt-1.5 line-clamp-2 text-[13px] font-medium text-text-primary tracking-[-0.005em]"
          style={{ lineHeight: 1.7 }}
        >
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
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.22, ease: [0.22, 0.61, 0.36, 1] }}
      className={cn(
        "float-card group block overflow-hidden rounded-card bg-surface-1 ring-hairline p-3",
        variant === "row" ? "w-40 shrink-0" : "",
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
