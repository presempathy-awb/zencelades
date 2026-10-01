// shadcn Button pattern adapted from Much Ado's owned component; no generator runtime.

import { cva, type VariantProps } from "class-variance-authority";
import { type ClassValue, clsx } from "clsx";
import { Slot, Tooltip } from "radix-ui";
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
  hint,
  ...props
}: ComponentProps<"button"> &
  VariantProps<typeof styles> & {
    asChild?: boolean;
    hint?: string;
  }): JSX.Element {
  const Component = asChild ? Slot.Root : "button";
  const button = <Component className={cn(styles({ variant }), className)} {...props} />;
  if (!hint) return button;
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>{button}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          sideOffset={6}
          collisionPadding={12}
          className="z-50 max-w-72 rounded-md border border-border bg-foreground px-3 py-2 text-sm text-primary-foreground shadow-md"
        >
          {hint}
          <Tooltip.Arrow className="fill-foreground" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}
