import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium leading-none",
  {
    variants: {
      variant: {
        default:  "bg-zinc-100 text-zinc-600",
        success:  "bg-green-50  text-green-700",
        danger:   "bg-red-50    text-red-700",
        warning:  "bg-amber-50  text-amber-700",
        info:     "bg-blue-50   text-blue-700",
        outline:  "border border-zinc-200 text-zinc-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

import React from "react";

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
