import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface SkeletonProps {
  className?: string;
  shimmer?: boolean;
  delay?: number;
}

export function Skeleton({ className, shimmer = true, delay = 0 }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-md bg-zinc-100",
        shimmer ? "skeleton-shimmer" : "animate-pulse",
        className
      )}
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
    />
  );
}

export function SkeletonRow({ stagger = 0 }: { stagger?: number }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3">
      <Skeleton className="h-4 w-4 rounded" delay={stagger} />
      <Skeleton className="h-3 w-40" delay={stagger + 50} />
      <Skeleton className="ml-auto h-3 w-16" delay={stagger + 100} />
      <Skeleton className="h-3 w-20 hidden md:block" delay={stagger + 150} />
    </div>
  );
}

export function SkeletonCard({ stagger = 0 }: { stagger?: number }) {
  return (
    <div className="rounded-lg border border-zinc-100 bg-white p-4">
      <Skeleton className="h-3 w-24 mb-3" delay={stagger} />
      <Skeleton className="h-6 w-12" delay={stagger + 80} />
    </div>
  );
}

/* Staggered list skeleton */
export function SkeletonList({ rows = 5 }: { rows?: number }) {
  return (
    <div className="divide-y divide-zinc-50">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} stagger={i * 60} />
      ))}
    </div>
  );
}

/* Full-page skeleton for dashboard or page loading */
export function SkeletonPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="ml-auto h-8 w-24 rounded-lg" delay={100} />
      </div>
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} stagger={i * 80} />
        ))}
      </div>
      <SkeletonList rows={6} />
    </div>
  );
}

/* Loading state wrapper — shows skeleton until loaded */
interface LoadingStateProps {
  loading: boolean;
  skeleton?: ReactNode;
  children: ReactNode;
  minDelay?: number;
  className?: string;
}

export function LoadingState({ loading, skeleton, children, className }: LoadingStateProps) {
  if (loading) {
    return (
      <div className={cn("animate-in fade-in duration-200", className)}>
        {skeleton ?? <SkeletonList />}
      </div>
    );
  }
  return <div className={cn("animate-in fade-in duration-300", className)}>{children}</div>;
}

