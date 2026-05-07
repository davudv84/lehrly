import { cn } from "@/lib/utils";

export const Shimmer = ({ className }: { className?: string }) => (
  <div
    className={cn(
      "relative overflow-hidden rounded-md bg-surface-2",
      "before:absolute before:inset-0 before:-translate-x-full",
      "before:animate-[shimmer_1.6s_infinite]",
      "before:bg-gradient-to-r before:from-transparent before:via-white/[0.04] before:to-transparent",
      className,
    )}
  />
);

export const WorksheetCardSkeleton = ({ row = false }: { row?: boolean }) => (
  <div
    className={cn(
      "shrink-0 overflow-hidden rounded-card bg-surface-1 ring-hairline p-3",
      row ? "w-40" : "",
    )}
  >
    <Shimmer className="aspect-[1/1.414] w-full" />
    <div className="mt-2.5 flex items-center justify-between">
      <Shimmer className="h-4 w-8" />
      <Shimmer className="h-3 w-12" />
    </div>
    <Shimmer className="mt-2 h-3 w-3/4" />
    <Shimmer className="mt-1.5 h-3 w-1/2" />
  </div>
);

export const StatCardSkeleton = () => (
  <div className="flex-1 rounded-card bg-surface-1 ring-hairline px-4 py-3.5">
    <Shimmer className="h-3 w-16" />
    <Shimmer className="mt-3 h-6 w-10" />
  </div>
);

export default WorksheetCardSkeleton;
