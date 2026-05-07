import { cn } from "@/lib/utils";

const COLORS: Record<string, { dark: string; light: string }> = {
  A1: { dark: "text-emerald-200/90 bg-emerald-400/[0.07] ring-emerald-400/20", light: "text-emerald-700 bg-emerald-50 ring-emerald-200" },
  A2: { dark: "text-teal-200/90 bg-teal-400/[0.07] ring-teal-400/20", light: "text-teal-700 bg-teal-50 ring-teal-200" },
  B1: { dark: "text-sky-200/90 bg-sky-400/[0.07] ring-sky-400/20", light: "text-sky-700 bg-sky-50 ring-sky-200" },
  B2: { dark: "text-amber-200/90 bg-amber-400/[0.07] ring-amber-400/20", light: "text-amber-700 bg-amber-50 ring-amber-200" },
  C1: { dark: "text-fuchsia-200/90 bg-fuchsia-400/[0.07] ring-fuchsia-400/20", light: "text-fuchsia-700 bg-fuchsia-50 ring-fuchsia-200" },
  C2: { dark: "text-rose-200/90 bg-rose-400/[0.07] ring-rose-400/20", light: "text-rose-700 bg-rose-50 ring-rose-200" },
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
        "inline-flex items-center justify-center rounded-pill ring-1 font-medium tracking-[0.04em] tabular-nums",
        size === "sm" ? "h-5 px-2 text-[10.5px]" : "h-6 px-2.5 text-[11.5px]",
        tone === "dark" ? c.dark : c.light,
        className,
      )}
    >
      {niveau}
    </span>
  );
};

export default NiveauBadge;
