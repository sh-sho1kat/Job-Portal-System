import * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = {
  default:
    "border-[color:var(--neu-edge)] bg-[var(--neu-surface)] text-[var(--foreground)] shadow-none",
  primary:
    "border-transparent bg-[var(--neu-selected)] text-[var(--neu-accent-ink)] shadow-none",
  soft: "border-transparent bg-[var(--neu-surface-low)] text-[var(--muted-foreground)]",
  outline: "border-[color:var(--border)] bg-transparent text-[var(--foreground)]",
  destructive:
    "border-transparent bg-[color:var(--destructive)]/12 text-[var(--neu-error-text)]",
} as const;

type BadgeVariant = keyof typeof badgeVariants;

interface BadgeProps extends React.ComponentProps<"span"> {
  variant?: BadgeVariant;
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      data-variant={variant}
      className={cn(
        "inline-flex w-fit max-w-full min-w-0 items-center justify-center gap-1 whitespace-normal [overflow-wrap:anywhere] break-keep text-balance align-middle text-center rounded-[var(--neu-radius-small)] border px-2 py-0.5 text-xs font-semibold leading-4 [&_svg]:pointer-events-none [&_svg]:size-3 [&_svg]:shrink-0",
        badgeVariants[variant],
        className,
      )}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
