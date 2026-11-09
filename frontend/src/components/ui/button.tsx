import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = {
  default:
    "border-transparent bg-[var(--neu-surface)] [background-image:var(--neu-fill-raised)] active:[background-image:none] text-[var(--foreground)] shadow-[var(--neu-shadow-raised-sm)] hover:shadow-[var(--neu-shadow-hover)] active:shadow-[var(--neu-shadow-inset)]",
  primary:
    "border-transparent bg-[var(--neu-surface)] [background-image:var(--neu-fill-raised)] active:[background-image:var(--neu-fill-inset)] text-[var(--neu-accent-ink)] shadow-[var(--neu-shadow-raised-sm)] hover:shadow-[var(--neu-shadow-hover)] active:shadow-[var(--neu-shadow-inset)]",
  soft:
    "border-transparent bg-[var(--neu-surface-soft)] text-[var(--foreground)] shadow-[var(--neu-shadow-raised-sm)] hover:bg-[var(--neu-surface)] hover:shadow-[var(--neu-shadow-hover)] active:bg-[var(--neu-surface)] active:[background-image:var(--neu-fill-inset)] active:shadow-[var(--neu-shadow-inset)]",
  ghost:
    "border-transparent bg-transparent text-[var(--foreground)] shadow-none hover:bg-[var(--neu-surface-soft)] active:bg-[var(--neu-surface-low)] active:shadow-[var(--neu-shadow-inset)]",
  destructive:
    "border-transparent bg-[color:var(--destructive)]/8 text-[var(--neu-error-text)] shadow-none hover:shadow-[var(--neu-shadow-raised-sm)] active:shadow-[var(--neu-shadow-inset)]",
} as const;

const buttonSizes = {
  sm: "h-8 px-3 text-xs [--button-icon-size:0.875rem]",
  default: "h-10 px-4 text-sm [--button-icon-size:1rem]",
  lg: "h-12 px-6 text-base [--button-icon-size:1.25rem]",
  icon: "size-10 p-0 [--button-icon-size:1.25rem]",
} as const;

type ButtonVariant = keyof typeof buttonVariants;
type ButtonSize = keyof typeof buttonSizes;

export interface ButtonProps extends React.ComponentProps<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

function Button({
  className,
  variant = "default",
  size = "default",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[var(--neu-radius-control)] border font-semibold leading-5 tracking-normal outline-hidden transition-[box-shadow,background-color,color] duration-[var(--neu-duration)] motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-3 focus-visible:outline-[color:var(--ring)] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none disabled:[background-image:none] disabled:border-[color:var(--muted-foreground)]/30 [&_svg]:pointer-events-none [&_svg]:block [&_svg:not([class*=size-])]:size-[var(--button-icon-size)] [&_svg]:shrink-0",
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      {...props}
    />
  );
}

export { Button, buttonSizes, buttonVariants };
