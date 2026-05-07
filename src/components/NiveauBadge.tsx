import { cn } from "@/lib/utils";

const COLORS: Record<string, { dark: string; light: string }> = {
  A1: { dark: "text-emerald-300 bg-emerald-500/10 border-emerald-500/25", light: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  A2: { dark: "text-teal-300 bg-teal-500/10 border-teal-500/25", light: "text-teal-700 bg-teal-50 border-teal-200" },
  B1: { dark: "text-sky-300 bg-sky-500/10 border-sky-500/25", light: "text-sky-700 bg-sky-50 border-sky-200" },
  B2: { dark: "text-amber-300 bg-amber-500/10 border-amber-500/25", light: "text-amber-700 bg-amber-50 border-amber-200" },
  C1: { dark: "text-fuchsia-300 bg-fuchsia-500/10 border-fuchsia-500/25", light: "text-fuchsia-700 bg-fuchsia-50 border-fuchsia-200" },
  C2: { dark: "text-rose-300 bg-rose-500/10 border-rose-500/25", light: "text-rose-700 bg-rose-50 border-rose-200" },
};

type Props = {
  niveau: string;
  size?: "sm" | "md";
  tone?: "dark" | "light";
  className?: string;
};

const NiveauBadge = ({ niveau, size = "sm", tone = "dark", className }: Props) => {
  const c = COLORS[niveau] ?? COLORS.B1;
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-pill border font-semibold tracking-wide tabular-nums",
        size === "sm" ? "h-5 px-2 text-[10.5px]" : "h-7 px-3 text-[12.5px]",
        tone === "dark" ? c.dark : c.light,
        className,
      )}
    >
      {niveau}
    </span>
  );
};

export default NiveauBadge;
