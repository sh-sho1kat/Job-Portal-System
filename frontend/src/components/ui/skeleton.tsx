import * as React from "react";

import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn(
        "animate-pulse motion-reduce:animate-none rounded-[calc(var(--neu-radius-surface)*0.65)] bg-[var(--neu-surface-low)] [box-shadow:none]",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
