"use client";

import { NumberField as Primitive } from "@base-ui/react/number-field";
import { mergeClassName } from "@/lib/utils";

function NumberField({ className, ...props }: Primitive.Root.Props) {
  return <Primitive.Root data-slot="number-field" className={mergeClassName<Primitive.Root.State>("grid min-w-0 gap-2", className)} {...props} />;
}
function NumberFieldGroup({ className, ...props }: Primitive.Group.Props) {
  return <Primitive.Group data-slot="number-field-group" className={mergeClassName<Primitive.Group.State>("inline-flex h-10 w-fit max-w-full items-center gap-1 rounded-[var(--neu-radius-control)] border border-transparent bg-[var(--neu-surface)] [background-image:var(--neu-fill-inset)] p-1 [box-shadow:var(--neu-shadow-inset)] focus-within:outline-2 focus-within:outline-solid focus-within:outline-offset-2 focus-within:outline-[color:var(--ring)] data-disabled:opacity-60 data-disabled:shadow-none data-disabled:[background-image:none]", className)} {...props} />;
}
function NumberFieldInput({ className, ...props }: Primitive.Input.Props) {
  return <Primitive.Input data-slot="number-field-input" className={mergeClassName<Primitive.Input.State>("h-7.5 w-20 min-w-0 flex-1 bg-transparent text-center text-sm font-medium tracking-normal tabular-nums text-[var(--foreground)] outline-none disabled:opacity-50", className)} {...props} />;
}
const stepClass = "inline-flex size-7.5 shrink-0 items-center justify-center rounded-[max(var(--neu-radius-small),calc(var(--neu-radius-control)-4px))] border border-transparent bg-[var(--neu-surface)] text-lg font-medium text-[var(--foreground)] [box-shadow:var(--neu-shadow-raised-sm)] outline-none transition-shadow duration-[var(--neu-duration)] motion-reduce:transition-none hover:[box-shadow:var(--neu-shadow-hover)] active:[box-shadow:var(--neu-shadow-inset)] focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-[-2px] focus-visible:outline-[color:var(--ring)] data-disabled:pointer-events-none data-disabled:opacity-40 data-disabled:shadow-none";
function NumberFieldDecrement({ className, children = <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M5 12h14" /></svg>, ...props }: Primitive.Decrement.Props) {
  return <Primitive.Decrement data-slot="number-field-decrement" className={mergeClassName<Primitive.Decrement.State>(stepClass, className)} {...props}>{children}</Primitive.Decrement>;
}
function NumberFieldIncrement({ className, children = <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M5 12h14M12 5v14" /></svg>, ...props }: Primitive.Increment.Props) {
  return <Primitive.Increment data-slot="number-field-increment" className={mergeClassName<Primitive.Increment.State>(stepClass, className)} {...props}>{children}</Primitive.Increment>;
}
const NumberFieldScrubArea = Primitive.ScrubArea;
export { NumberField, NumberFieldGroup, NumberFieldInput, NumberFieldIncrement, NumberFieldDecrement, NumberFieldScrubArea };
