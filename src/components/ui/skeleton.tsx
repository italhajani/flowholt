import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-zinc-100",
        className
      )}
    />
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-5 py-3">
      <Skeleton className="h-4 w-4 rounded" />
      <Skeleton className="h-3 w-40" />
      <Skeleton className="ml-auto h-3 w-16" />
      <Skeleton className="h-3 w-20 hidden md:block" />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-lg border border-zinc-100 bg-white p-4">
      <Skeleton className="h-3 w-24 mb-3" />
      <Skeleton className="h-6 w-12" />
    </div>
  );
}
