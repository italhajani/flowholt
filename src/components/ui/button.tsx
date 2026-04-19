import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md font-medium",
    "transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-1",
    "disabled:pointer-events-none disabled:opacity-40",
  ].join(" "),
  {
    variants: {
      variant: {
        primary:
          "bg-zinc-900 text-white hover:bg-zinc-700 active:bg-zinc-800",
        secondary:
          "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 active:bg-zinc-100",
        ghost:
          "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 active:bg-zinc-200",
        danger:
          "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
        "danger-ghost":
          "text-red-600 hover:bg-red-50 hover:text-red-700 active:bg-red-100",
      },
      size: {
        sm:  "h-7  px-2.5 text-[12px]",
        md:  "h-8  px-3   text-[13px]",
        lg:  "h-9  px-4   text-[14px]",
        icon:"h-8  w-8    p-0",
        "icon-sm": "h-7 w-7 p-0",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { buttonVariants };
