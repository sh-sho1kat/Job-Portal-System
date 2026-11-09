"use client";

import { Progress as ProgressPrimitive } from "@base-ui/react/progress";

import { mergeClassName } from "@/lib/utils";

function Progress({
  className,
  value,
  min = 0,
  max = 100,
  ...props
}: ProgressPrimitive.Root.Props) {
  const normalizedMin =
    typeof min === "number" && Number.isFinite(min) ? min : 0;
  const normalizedMax =
    typeof max === "number" && Number.isFinite(max) && max > normalizedMin
      ? max
      : Math.max(normalizedMin + 100, 100);
  const normalizedValue =
    typeof value === "number" && Number.isFinite(value)
      ? Math.min(Math.max(value, normalizedMin), normalizedMax)
      : null;

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={normalizedValue}
      min={normalizedMin}
      max={normalizedMax}
      className={mergeClassName<ProgressPrimitive.Root.State>(
        "group/progress relative h-3 w-full overflow-hidden rounded-[var(--neu-radius-control)] border border-[color:var(--neu-edge)] bg-[var(--neu-surface)] [box-shadow:var(--neu-shadow-inset)]",
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Track
        data-slot="progress-track"
        className="relative h-full w-full rounded-[inherit]"
      >
        <ProgressPrimitive.Indicator
          data-slot="progress-indicator"
          className="h-full rounded-[inherit] bg-[var(--primary)] [box-shadow:none] transition-[width] duration-[var(--neu-duration)] motion-reduce:transition-none ease-out group-data-[indeterminate]/progress:w-1/3 group-data-[indeterminate]/progress:animate-pulse motion-reduce:animate-none"
        />
      </ProgressPrimitive.Track>
    </ProgressPrimitive.Root>
  );
}

export { Progress };
