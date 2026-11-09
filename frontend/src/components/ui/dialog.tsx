"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";

import { cn, mergeClassName } from "@/lib/utils";

function Dialog(props: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger(props: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal(props: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose(props: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={mergeClassName<DialogPrimitive.Backdrop.State>(
        "fixed inset-0 isolate z-50 bg-[var(--neu-overlay)] backdrop-blur-sm transition-opacity duration-[var(--neu-duration)] motion-reduce:transition-none data-closed:opacity-0 data-open:opacity-100",
        className,
      )}
      {...props}
    />
  );
}

interface DialogContentProps extends DialogPrimitive.Popup.Props {
  overlayClassName?: DialogPrimitive.Backdrop.Props["className"];
  showCloseButton?: boolean;
  closeLabel?: string;
}

function DialogContent({
  className,
  children,
  overlayClassName,
  showCloseButton = true,
  closeLabel = "Close",
  ...props
}: DialogContentProps) {
  return (
    <DialogPortal>
      <DialogOverlay className={overlayClassName} />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        data-close-button={showCloseButton || undefined}
        className={mergeClassName<DialogPrimitive.Popup.State>(
          "fixed top-1/2 left-1/2 z-50 grid w-[calc(100%-2rem)] max-w-lg max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain -translate-x-1/2 -translate-y-1/2 gap-5 rounded-[var(--neu-radius-overlay)] border border-[color:var(--neu-edge)] bg-[var(--popover)] [background-image:var(--neu-fill-raised)] p-6 [&[data-close-button]>[data-slot=dialog-header]]:pr-12 text-[var(--popover-foreground)] shadow-[var(--neu-shadow-floating)] outline-hidden transition-[opacity,transform] duration-[var(--neu-duration)] motion-reduce:transition-none data-closed:scale-95 data-closed:opacity-0 data-open:scale-100 data-open:opacity-100",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="absolute top-3 right-3 grid size-10 place-items-center rounded-[var(--neu-radius-control)] border border-transparent bg-[var(--neu-surface)] text-lg leading-none text-[var(--muted-foreground)] shadow-[var(--neu-shadow-raised-sm)] outline-hidden transition-[color,box-shadow,transform] duration-[var(--neu-duration)] motion-reduce:transition-none hover:text-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] active:translate-y-px active:shadow-[var(--neu-shadow-inset)] disabled:pointer-events-none"
          >
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="m6 6 12 12M6 18 18 6" /></svg>
            <span className="sr-only">{closeLabel}</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex min-w-0 flex-col gap-2 text-left", className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex min-w-0 flex-col-reverse gap-2 sm:flex-row sm:flex-wrap sm:justify-end [&>button]:min-h-10 [&>button[data-size=sm]]:min-h-8 [&>button[data-size=sm]]:py-1 [&>button[data-size=lg]]:min-h-12 [&>button[data-size=icon]]:py-0 [&>button]:h-auto [&>button]:max-w-full [&>button]:whitespace-normal [&>button]:[overflow-wrap:anywhere] [&>button]:py-2",
        className,
      )}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={mergeClassName<DialogPrimitive.Title.State>(
        "min-w-0 text-lg leading-snug font-semibold tracking-tight [overflow-wrap:anywhere]",
        className,
      )}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={mergeClassName<DialogPrimitive.Description.State>(
        "min-w-0 text-sm leading-relaxed text-[var(--muted-foreground)] [overflow-wrap:anywhere]",
        className,
      )}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
