"use client";

import { Field as Primitive } from "@base-ui/react/field";
import { mergeClassName } from "@/lib/utils";

function Field({ className, ...props }: Primitive.Root.Props) {
  return <Primitive.Root data-slot="field" className={mergeClassName<Primitive.Root.State>("grid min-w-0 gap-2", className)} {...props} />;
}
function FieldLabel({ className, ...props }: Primitive.Label.Props) {
  return <Primitive.Label data-slot="field-label" className={mergeClassName<Primitive.Label.State>("w-fit text-sm font-semibold text-[var(--foreground)] data-disabled:opacity-60", className)} {...props} />;
}
function FieldControl({ className, ...props }: Primitive.Control.Props) {
  return <Primitive.Control data-slot="field-control" className={mergeClassName<Primitive.Control.State>(
    "h-10 w-full min-w-0 rounded-[var(--neu-radius-control)] border border-transparent bg-[var(--neu-surface)] [background-image:var(--neu-fill-inset)] px-3 text-sm font-normal tracking-normal text-[var(--foreground)] [box-shadow:var(--neu-shadow-inset)] outline-none transition-[box-shadow,border-color] duration-[var(--neu-duration)] motion-reduce:transition-none placeholder:text-[var(--muted-foreground)] focus-visible:border-[var(--ring)] focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)] data-invalid:border-[var(--destructive)] aria-invalid:border-[var(--destructive)] aria-invalid:focus-visible:outline-[color:var(--neu-error-text)] read-only:[box-shadow:none] read-only:[background-image:none] read-only:border-[color:var(--input)] read-only:bg-[var(--neu-surface-soft)] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none disabled:[background-image:none] disabled:border-[color:var(--input)]", className,
  )} {...props} />;
}
function FieldDescription({ className, ...props }: Primitive.Description.Props) {
  return <Primitive.Description data-slot="field-description" className={mergeClassName<Primitive.Description.State>("text-sm leading-relaxed text-[var(--muted-foreground)]", className)} {...props} />;
}
function FieldError({ className, ...props }: Primitive.Error.Props) {
  return <Primitive.Error data-slot="field-error" className={mergeClassName<Primitive.Error.State>("text-sm leading-relaxed font-medium text-[var(--neu-error-text)]", className)} {...props} />;
}
const FieldValidity = Primitive.Validity;
const FieldItem = Primitive.Item;
export { Field, FieldLabel, FieldControl, FieldDescription, FieldError, FieldValidity, FieldItem };
