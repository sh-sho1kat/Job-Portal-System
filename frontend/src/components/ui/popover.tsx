"use client";

import { Popover as Primitive } from "@base-ui/react/popover";
import { mergeClassName } from "@/lib/utils";

const Popover = Primitive.Root;
const PopoverTrigger = Primitive.Trigger;
const PopoverClose = Primitive.Close;

type PopoverContentProps = Primitive.Popup.Props & {
  side?: Primitive.Positioner.Props["side"];
  align?: Primitive.Positioner.Props["align"];
  sideOffset?: number;
};

function PopoverContent({ className, side = "bottom", align = "center", sideOffset = 10, ...props }: PopoverContentProps) {
  return (
    <Primitive.Portal>
      <Primitive.Positioner side={side} align={align} sideOffset={sideOffset} className="z-50 outline-none">
        <Primitive.Popup
          data-slot="popover-content"
          className={mergeClassName<Primitive.Popup.State>(
            "grid w-80 max-w-[calc(100vw-2rem)] max-h-[var(--available-height)] gap-3 overflow-y-auto rounded-[var(--neu-radius-overlay)] border border-[color:var(--neu-edge)] bg-[var(--popover)] [background-image:var(--neu-fill-raised)] p-5 text-sm text-[var(--popover-foreground)] [box-shadow:var(--neu-shadow-floating)] outline-none origin-[var(--transform-origin)] transition-[opacity,transform] duration-[var(--neu-duration)] motion-reduce:transition-none data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
            className,
          )}
          {...props}
        />
      </Primitive.Positioner>
    </Primitive.Portal>
  );
}

function PopoverTitle({ className, ...props }: Primitive.Title.Props) {
  return <Primitive.Title data-slot="popover-title" className={mergeClassName<Primitive.Title.State>("font-semibold tracking-tight text-[var(--foreground)]", className)} {...props} />;
}
function PopoverDescription({ className, ...props }: Primitive.Description.Props) {
  return <Primitive.Description data-slot="popover-description" className={mergeClassName<Primitive.Description.State>("text-sm leading-relaxed text-[var(--muted-foreground)]", className)} {...props} />;
}

export { Popover, PopoverTrigger, PopoverClose, PopoverContent, PopoverTitle, PopoverDescription };
export type { PopoverContentProps };
