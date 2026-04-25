import { cn } from "@/lib/utils";

const COLORS: Record<string, string> = {
  A1: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  A2: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  B1: "text-sky-400 bg-sky-500/10 border-sky-500/20",
  B2: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  C1: "text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20",
  C2: "text-rose-400 bg-rose-500/10 border-rose-500/20",
};

type Props = {
  niveau: string;
  size?: "sm" | "md";
  className?: string;
};

const NiveauBadge = ({ niveau, size = "sm", className }: Props) => (
  <span
    className={cn(
      "inline-flex items-center justify-center rounded-pill border font-semibold",
      size === "sm" ? "h-5 px-2 text-[11px]" : "h-7 px-3 text-[13px]",
      COLORS[niveau] ?? "text-text-secondary bg-white/5 border-white/10",
      className,
    )}
  >
    {niveau}
  </span>
);

export default NiveauBadge;
