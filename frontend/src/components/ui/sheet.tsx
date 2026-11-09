"use client";

import { Dialog as Primitive } from "@base-ui/react/dialog";
import { Button } from "./button";
import { DialogOverlay, DialogPortal, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from "./dialog";
import { mergeClassName } from "@/lib/utils";

const Sheet = Primitive.Root;
const SheetTrigger = Primitive.Trigger;
const SheetClose = Primitive.Close;
const SheetTitle = DialogTitle;
const SheetDescription = DialogDescription;
const SheetHeader = DialogHeader;
const SheetFooter = DialogFooter;
const sides = {
  right: "inset-y-0 right-0 h-dvh w-[min(28rem,calc(100vw-1rem))] rounded-l-[var(--neu-radius-overlay)] data-[starting-style]:translate-x-full data-[ending-style]:translate-x-full",
  left: "inset-y-0 left-0 h-dvh w-[min(28rem,calc(100vw-1rem))] rounded-r-[var(--neu-radius-overlay)] data-[starting-style]:-translate-x-full data-[ending-style]:-translate-x-full",
  bottom: "inset-x-0 bottom-0 max-h-[calc(100dvh-1rem)] rounded-t-[var(--neu-radius-overlay)] data-[starting-style]:translate-y-full data-[ending-style]:translate-y-full",
  top: "inset-x-0 top-0 max-h-[calc(100dvh-1rem)] rounded-b-[var(--neu-radius-overlay)] data-[starting-style]:-translate-y-full data-[ending-style]:-translate-y-full",
} as const;
type SheetContentProps = Primitive.Popup.Props & { side?: keyof typeof sides; closeLabel?: string };
function SheetContent({ className, side = "right", closeLabel = "Close", children, ...props }: SheetContentProps) {
  return <DialogPortal><DialogOverlay />
    <Primitive.Popup data-slot="sheet-content" data-side={side} className={mergeClassName<Primitive.Popup.State>(
      `fixed z-50 flex flex-col gap-6 overflow-y-auto overscroll-contain border border-[color:var(--neu-edge)] bg-[var(--popover)] [background-image:var(--neu-fill-raised)] p-6 pt-16 text-[var(--popover-foreground)] [box-shadow:var(--neu-shadow-floating)] outline-none transition-[opacity,transform] duration-[var(--neu-duration)] motion-reduce:transition-none ${sides[side]}`, className,
    )} {...props}>
      {children}
      <Primitive.Close render={<Button size="icon" variant="soft" />} className="absolute top-4 right-4" aria-label={closeLabel}><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m6 6 12 12M6 18 18 6" /></svg></Primitive.Close>
    </Primitive.Popup>
  </DialogPortal>;
}
export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetTitle, SheetDescription, SheetHeader, SheetFooter };
export type { SheetContentProps };
