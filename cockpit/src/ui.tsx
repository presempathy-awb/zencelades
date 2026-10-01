// shadcn Button pattern adapted from Much Ado's owned component; no generator runtime.

import { cva, type VariantProps } from "class-variance-authority";
import { type ClassValue, clsx } from "clsx";
import { Slot } from "radix-ui";
import type { ComponentProps, JSX } from "react";
import { twMerge } from "tailwind-merge";

const styles = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "border border-border bg-white text-foreground hover:bg-accent",
        ghost: "hover:bg-accent text-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);
export function cn(...values: ClassValue[]): string {
  return twMerge(clsx(values));
}
export function Button({
  className,
  variant,
  asChild,
  ...props
}: ComponentProps<"button"> & VariantProps<typeof styles> & { asChild?: boolean }): JSX.Element {
  const Component = asChild ? Slot.Root : "button";
  return <Component className={cn(styles({ variant }), className)} {...props} />;
}
