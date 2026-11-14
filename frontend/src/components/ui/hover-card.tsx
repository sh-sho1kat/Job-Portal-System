"use client";

import { PreviewCard as Primitive } from "@base-ui/react/preview-card";
import { mergeClassName } from "@/lib/utils";

const HoverCard = Primitive.Root;
const HoverCardTrigger = Primitive.Trigger;

type HoverCardContentProps = Primitive.Popup.Props & {
  side?: Primitive.Positioner.Props["side"];
  align?: Primitive.Positioner.Props["align"];
  sideOffset?: number;
};

function HoverCardContent({ className, side = "bottom", align = "center", sideOffset = 10, ...props }: HoverCardContentProps) {
  return (
    <Primitive.Portal>
      <Primitive.Positioner side={side} align={align} sideOffset={sideOffset} className="z-50 outline-none">
        <Primitive.Popup data-slot="hover-card-content" className={mergeClassName<Primitive.Popup.State>(
          "grid w-80 max-w-[calc(100vw-2rem)] max-h-[var(--available-height)] gap-3 overflow-y-auto rounded-[var(--neu-radius-overlay)] border border-[color:var(--neu-edge)] bg-[var(--popover)] [background-image:var(--neu-fill-raised)] p-5 text-sm leading-relaxed text-[var(--popover-foreground)] [box-shadow:var(--neu-shadow-floating)] outline-none transition-opacity duration-[var(--neu-duration)] motion-reduce:transition-none data-[starting-style]:opacity-0 data-[ending-style]:opacity-0", className,
        )} {...props} />
      </Primitive.Positioner>
    </Primitive.Portal>
  );
}

export { HoverCard, HoverCardTrigger, HoverCardContent };
export type { HoverCardContentProps };
