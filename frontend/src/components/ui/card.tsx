import * as React from "react";

import { cn } from "@/lib/utils";

const cardVariants = {
  raised: "border-transparent bg-[var(--neu-surface)] [background-image:var(--neu-fill-raised)] shadow-[var(--neu-shadow-plate)]",
  accent: "border-transparent bg-[var(--primary)] [background-image:var(--neu-fill-primary)] shadow-[var(--neu-shadow-plate)] [--card-foreground:var(--primary-foreground)] [&_[data-slot=card-description]]:text-[var(--primary-foreground)]",
  soft: "bg-[var(--neu-surface-soft)] shadow-none",
  inset: "bg-[var(--neu-surface)] [background-image:var(--neu-fill-inset)] shadow-[var(--neu-shadow-inset)]",
  flat: "border border-[color:var(--border)] bg-[var(--neu-surface)]",
} as const;

type CardVariant = keyof typeof cardVariants;

interface CardProps extends React.ComponentProps<"div"> {
  variant?: CardVariant;
}

function Card({ className, variant = "raised", ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      data-variant={variant}
      className={cn(
        "flex min-w-0 flex-col gap-4 rounded-[var(--neu-radius-surface)] border border-transparent py-5 text-[var(--card-foreground)] transition-shadow duration-[var(--neu-duration)] motion-reduce:transition-none",
        cardVariants[variant],
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "grid min-w-0 auto-rows-min gap-x-4 gap-y-1 px-5 has-[>[data-slot=card-action]]:grid-cols-[minmax(0,1fr)_auto]",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="card-title"
      className={cn("min-w-0 text-base font-semibold leading-6 tracking-tight [overflow-wrap:anywhere]", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={cn("min-w-0 text-sm leading-relaxed text-[var(--muted-foreground)] [overflow-wrap:anywhere]", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn("min-w-0 px-5", className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex min-w-0 flex-wrap items-center gap-3 px-5", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  cardVariants,
};
