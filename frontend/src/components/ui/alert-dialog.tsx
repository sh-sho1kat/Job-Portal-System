"use client";

import * as React from "react";
import { AlertDialog as Primitive } from "@base-ui/react/alert-dialog";
import { Button } from "./button";
import { cn, mergeClassName } from "@/lib/utils";

const AlertDialog = Primitive.Root;
const AlertDialogTrigger = Primitive.Trigger;

function AlertDialogContent({ className, ...props }: Primitive.Popup.Props) {
  return <Primitive.Portal>
    <Primitive.Backdrop data-slot="alert-dialog-overlay" className="fixed inset-0 z-50 bg-[var(--neu-overlay)] backdrop-blur-sm transition-opacity duration-[var(--neu-duration)] motion-reduce:transition-none data-[starting-style]:opacity-0 data-[ending-style]:opacity-0" />
    <Primitive.Popup data-slot="alert-dialog-content" className={mergeClassName<Primitive.Popup.State>(
      "fixed top-1/2 left-1/2 z-50 grid w-[calc(100%-2rem)] max-w-md max-h-[calc(100dvh-2rem)] -translate-x-1/2 -translate-y-1/2 gap-4 overflow-y-auto rounded-[var(--neu-radius-overlay)] border border-[color:var(--neu-edge)] bg-[var(--popover)] [background-image:var(--neu-fill-raised)] p-5 text-[var(--popover-foreground)] [box-shadow:var(--neu-shadow-floating)] outline-none transition-[opacity,transform,scale] duration-[var(--neu-duration)] motion-reduce:transition-none motion-safe:data-[starting-style]:scale-95 data-[starting-style]:opacity-0 motion-safe:data-[ending-style]:scale-95 data-[ending-style]:opacity-0", className,
    )} {...props} />
  </Primitive.Portal>;
}
function AlertDialogTitle({ className, ...props }: Primitive.Title.Props) {
  return <Primitive.Title data-slot="alert-dialog-title" className={mergeClassName<Primitive.Title.State>("min-w-0 text-base font-semibold leading-6 tracking-tight [overflow-wrap:anywhere]", className)} {...props} />;
}
function AlertDialogDescription({ className, ...props }: Primitive.Description.Props) {
  return <Primitive.Description data-slot="alert-dialog-description" className={mergeClassName<Primitive.Description.State>("min-w-0 text-sm leading-relaxed text-[var(--muted-foreground)] [overflow-wrap:anywhere]", className)} {...props} />;
}
function AlertDialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-dialog-footer" className={cn("flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end [&>button]:min-h-10 [&>button[data-size=sm]]:min-h-8 [&>button[data-size=sm]]:py-1 [&>button[data-size=lg]]:min-h-12 [&>button[data-size=icon]]:py-0 [&>button]:h-auto [&>button]:max-w-full [&>button]:whitespace-normal [&>button]:[overflow-wrap:anywhere] [&>button]:py-2", className)} {...props} />;
}
function AlertDialogCancel({ render = <Button />, ...props }: Primitive.Close.Props) {
  return <Primitive.Close data-slot="alert-dialog-cancel" render={render} {...props} />;
}
function AlertDialogAction({ render = <Button variant="destructive" />, ...props }: Primitive.Close.Props) {
  return <Primitive.Close data-slot="alert-dialog-action" render={render} {...props} />;
}

export { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction };
