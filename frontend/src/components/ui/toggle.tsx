"use client";

import { Toggle as Primitive } from "@base-ui/react/toggle";
import { cn, mergeClassName } from "@/lib/utils";

const sizes = {
  sm: "min-h-8 min-w-8 px-2.5 py-1 text-xs [--toggle-icon-size:0.875rem]",
  default: "min-h-10 min-w-10 px-3 py-2 text-sm [--toggle-icon-size:1rem]",
  lg: "min-h-12 min-w-12 px-4 py-3 text-base [--toggle-icon-size:1.25rem]",
} as const;
type ToggleProps<Value extends string = string> = Primitive.Props<Value> & { size?: keyof typeof sizes };

function Toggle<Value extends string = string>({ className, size = "default", ...props }: ToggleProps<Value>) {
  return <Primitive data-slot="toggle" data-size={size} className={mergeClassName<Primitive.State>(cn(
    "inline-flex h-auto max-w-full shrink-0 items-center justify-center gap-2 rounded-[var(--neu-radius-control)] border border-transparent bg-[var(--neu-surface)] font-semibold leading-5 tracking-normal text-center [overflow-wrap:anywhere] text-[var(--foreground)] [box-shadow:var(--neu-shadow-raised-sm)] outline-hidden transition-[color,box-shadow,background-color,border-color] duration-[var(--neu-duration)] motion-reduce:transition-none hover:not-data-pressed:not-data-disabled:[box-shadow:var(--neu-shadow-hover)] focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-[-3px] focus-visible:outline-[color:var(--ring)] data-pressed:border-transparent data-pressed:bg-[var(--neu-selected)] data-pressed:text-[var(--neu-accent-ink)] data-pressed:[box-shadow:var(--neu-shadow-inset-sm)] data-disabled:pointer-events-none data-disabled:opacity-50 data-disabled:shadow-none data-disabled:border-[color:var(--muted-foreground)]/30 [&_svg]:block [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-[var(--toggle-icon-size)]", sizes[size], "leading-5",
  ), className)} {...props} />;
}
export { Toggle };
export type { ToggleProps };
