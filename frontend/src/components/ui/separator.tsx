import * as React from "react";

import { cn } from "@/lib/utils";

interface SeparatorProps extends React.ComponentProps<"div"> {
  decorative?: boolean;
  orientation?: "horizontal" | "vertical";
}

function Separator({
  className,
  decorative = true,
  orientation = "horizontal",
  ...props
}: SeparatorProps) {
  return (
    <div
      role={decorative ? "none" : "separator"}
      aria-hidden={decorative || undefined}
      aria-orientation={decorative ? undefined : orientation}
      data-slot="separator"
      data-orientation={orientation}
      className={cn(
        "shrink-0 bg-[var(--neu-shadow-dark)] opacity-70 [box-shadow:1px_1px_0_var(--neu-shadow-light)]",
        orientation === "horizontal" ? "h-px w-full" : "h-full min-h-4 w-px",
        className,
      )}
      {...props}
    />
  );
}

export { Separator };
