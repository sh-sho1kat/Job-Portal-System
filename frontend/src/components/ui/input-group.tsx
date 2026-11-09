import * as React from "react";
import { cn } from "@/lib/utils";
function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div role="group" data-slot="input-group" className={cn(
    "flex min-h-10 w-full min-w-0 items-center gap-2 rounded-[var(--neu-radius-control)] border border-transparent bg-[var(--neu-surface)] [background-image:var(--neu-fill-inset)] p-1 shadow-[var(--neu-shadow-inset)] has-[textarea]:rounded-[var(--neu-radius-surface)] has-[textarea]:flex-wrap has-[textarea]:gap-y-2 has-[textarea]:[&>[data-slot=input-group-button]]:ms-auto transition-[border-color,box-shadow] duration-[var(--neu-duration)] motion-reduce:transition-none focus-within:border-[var(--ring)] focus-within:outline-2 focus-within:outline-solid focus-within:outline-offset-2 focus-within:outline-[color:var(--ring)] has-[[data-slot=input-group-control][aria-invalid=true]]:border-[var(--destructive)] has-[[data-slot=input-group-control][aria-invalid=true]]:outline-[color:var(--neu-error-text)] has-[[data-slot=input-group-control]:disabled]:opacity-60 has-[[data-slot=input-group-control]:disabled]:shadow-none has-[[data-slot=input-group-control]:disabled]:[background-image:none] has-[[data-slot=input-group-control]:disabled]:border-[color:var(--input)] [&>[data-slot=input-group-addon]+[data-slot=input-group-control]]:ps-0",
    className,
  )} {...props} />;
}
function InputGroupAddon({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="input-group-addon" className={cn("flex shrink-0 items-center gap-2 px-2 first:pe-0 last:ps-0 text-sm font-normal tracking-normal text-[var(--muted-foreground)] [&_svg:not([class*=size-])]:size-4 [&_svg]:shrink-0",className)} {...props} />;
}
function InputGroupText({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="input-group-text" className={cn("text-sm font-normal tracking-normal leading-5 text-[var(--muted-foreground)]",className)} {...props} />;
}
function InputGroupInput({ className, ...props }: React.ComponentProps<"input">) {
  return <input data-slot="input-group-control" className={cn("h-7.5 min-w-0 flex-1 border-0 bg-transparent px-2 py-1 text-sm font-normal tracking-normal leading-5 text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)] disabled:cursor-not-allowed",className)} {...props} />;
}
function InputGroupTextarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea data-slot="input-group-control" className={cn("min-h-24 w-full min-w-0 basis-full resize-y border-0 bg-transparent px-2 py-2 text-sm font-normal tracking-normal leading-6 text-[var(--foreground)] outline-none placeholder:text-[var(--muted-foreground)] disabled:cursor-not-allowed",className)} {...props} />;
}
function InputGroupButton({ className, type="button", ...props }: React.ComponentProps<"button">) {
  return <button type={type} data-slot="input-group-button" className={cn("inline-flex min-h-7.5 min-w-0 max-w-full items-center justify-center gap-2 rounded-[max(var(--neu-radius-small),calc(var(--neu-radius-control)-4px))] border border-transparent bg-[var(--neu-surface)] px-3 py-1.5 text-xs leading-4 font-semibold [overflow-wrap:anywhere] text-[var(--foreground)] shadow-[var(--neu-shadow-raised-sm)] outline-hidden transition-shadow duration-[var(--neu-duration)] motion-reduce:transition-none hover:shadow-[var(--neu-shadow-hover)] active:shadow-[var(--neu-shadow-inset)] focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-[-2px] focus-visible:outline-[color:var(--ring)] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none [&_svg:not([class*=size-])]:size-4 [&_svg]:shrink-0",className)} {...props} />;
}
export { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText, InputGroupTextarea };
