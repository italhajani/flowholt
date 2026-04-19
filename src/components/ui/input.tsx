import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Optional leading icon or element */
  prefix?: React.ReactNode;
}

import React from "react";

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, prefix, ...props }, ref) => {
    if (prefix) {
      return (
        <div className="relative flex items-center">
          <span className="pointer-events-none absolute left-2.5 flex items-center text-zinc-400">
            {prefix}
          </span>
          <input
            ref={ref}
            className={cn(
              "h-8 w-full rounded-md border border-zinc-200 bg-white pl-8 pr-3 text-[13px] text-zinc-800",
              "placeholder:text-zinc-400",
              "focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10",
              "disabled:cursor-not-allowed disabled:opacity-40",
              "transition-all duration-150",
              className
            )}
            {...props}
          />
        </div>
      );
    }

    return (
      <input
        ref={ref}
        className={cn(
          "h-8 w-full rounded-md border border-zinc-200 bg-white px-3 text-[13px] text-zinc-800",
          "placeholder:text-zinc-400",
          "focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10",
          "disabled:cursor-not-allowed disabled:opacity-40",
          "transition-all duration-150",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
