"use client";

import { Meter as Primitive } from "@base-ui/react/meter";
import { mergeClassName } from "@/lib/utils";

function Meter({ className, ...props }: Primitive.Root.Props) {
  return <Primitive.Root data-slot="meter" className={mergeClassName<Primitive.Root.State>("grid w-full min-w-0 gap-2", className)} {...props} />;
}
function MeterLabel({ className, ...props }: Primitive.Label.Props) {
  return <Primitive.Label data-slot="meter-label" className={mergeClassName<Primitive.Label.State>("text-sm font-medium text-[var(--foreground)]", className)} {...props} />;
}
function MeterValue({ className, ...props }: Primitive.Value.Props) {
  return <Primitive.Value data-slot="meter-value" className={mergeClassName<Primitive.Value.State>("text-sm font-semibold tabular-nums text-[var(--foreground)]", className)} {...props} />;
}
function MeterTrack({ className, ...props }: Primitive.Track.Props) {
  return <Primitive.Track data-slot="meter-track" className={mergeClassName<Primitive.Track.State>("h-3 overflow-hidden rounded-full bg-[var(--neu-surface)] [box-shadow:var(--neu-shadow-inset-sm)]", className)} {...props} />;
}
function MeterIndicator({ className, ...props }: Primitive.Indicator.Props) {
  return <Primitive.Indicator data-slot="meter-indicator" className={mergeClassName<Primitive.Indicator.State>("h-full rounded-full bg-[var(--primary)] [background-image:var(--neu-fill-primary)] [box-shadow:none] transition-[width] duration-[var(--neu-duration)] motion-reduce:transition-none", className)} {...props} />;
}
export { Meter, MeterLabel, MeterValue, MeterTrack, MeterIndicator };
