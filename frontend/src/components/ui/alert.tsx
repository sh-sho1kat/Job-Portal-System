import * as React from "react";

import { cn } from "@/lib/utils";

const alertVariants = {
  default:
    "border-[color:var(--neu-edge)] bg-[var(--neu-surface)] text-[var(--foreground)] shadow-none",
  destructive:
    "border-transparent bg-[var(--neu-surface)] [&>svg]:text-[var(--neu-error-text)] text-[var(--foreground)] shadow-none",
  success:
    "border-transparent bg-[var(--neu-surface)] [&>svg]:text-[var(--success)] text-[var(--foreground)] shadow-none",
} as const;

type AlertVariant = keyof typeof alertVariants;

interface AlertProps extends React.ComponentProps<"div"> {
  variant?: AlertVariant;
}

function Alert({ className, variant = "default", ...props }: AlertProps) {
  return (
    <div
      data-slot="alert"
      data-variant={variant}
      role="alert"
      className={cn(
        "relative grid w-full min-w-0 grid-cols-[0_1fr] items-start gap-y-1 rounded-[var(--neu-radius-surface)] border px-4 py-3 [box-shadow:var(--neu-shadow-inset-sm)] text-sm has-[>svg]:grid-cols-[1.125rem_1fr] has-[>svg]:gap-x-3 [&>svg]:col-start-1 [&>svg]:row-start-1 [&>svg]:row-span-2 [&>svg]:mt-0.5 [&>svg]:size-4 [&>svg]:text-current",
        alertVariants[variant],
        className,
      )}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn("col-start-2 min-w-0 font-semibold leading-5 tracking-tight", className)}
      {...props}
    />
  );
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "col-start-2 grid min-w-0 justify-items-start gap-1 text-sm leading-relaxed text-current [&_p]:leading-relaxed",
        className,
      )}
      {...props}
    />
  );
}

export { Alert, AlertDescription, AlertTitle, alertVariants };
