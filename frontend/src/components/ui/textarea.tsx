import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-24 w-full min-w-0 resize-y rounded-[calc(var(--neu-radius-surface)*0.7)] border border-transparent bg-[var(--neu-surface)] [background-image:var(--neu-fill-inset)] px-3 py-3 text-sm font-normal tracking-normal leading-6 text-[var(--foreground)] shadow-[var(--neu-shadow-inset)] outline-hidden transition-[box-shadow,border-color] duration-[var(--neu-duration)] motion-reduce:transition-none placeholder:text-[var(--muted-foreground)] focus-visible:border-[var(--ring)] focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none disabled:[background-image:none] disabled:border-[color:var(--input)] read-only:border-[color:var(--input)] read-only:shadow-none read-only:[background-image:none] read-only:bg-[var(--neu-surface-soft)] aria-invalid:border-[var(--destructive)] aria-invalid:focus-visible:outline-[color:var(--neu-error-text)]",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
