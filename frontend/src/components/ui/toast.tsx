"use client";

import { Toast as Primitive } from "@base-ui/react/toast";
import { cn } from "@/lib/utils";

const ToastProvider = Primitive.Provider;
const useToast = Primitive.useToastManager;
const createToastManager = Primitive.createToastManager;
type ToasterProps = { className?: string; label?: string; closeLabel?: string };

function Toaster({ className, label = "Notifications", closeLabel = "Dismiss notification" }: ToasterProps) {
  const { toasts } = useToast();
  return <Primitive.Portal>
    <Primitive.Viewport aria-label={label} className={cn("fixed end-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-[100] flex w-96 max-w-[calc(100vw-2rem)] flex-col gap-3 outline-none", className)}>
      {toasts.map(toast => <Primitive.Root key={toast.id} toast={toast} data-slot="toast" data-kind={toast.type} swipeDirection="right" className="relative rounded-[var(--neu-radius-overlay)] border border-[color:var(--neu-edge)] bg-[var(--popover)] [background-image:var(--neu-fill-raised)] p-4 font-sans text-[var(--popover-foreground)] [box-shadow:var(--neu-shadow-floating)] outline-none transition-[opacity,transform] duration-[var(--neu-duration)] motion-reduce:transition-none data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 data-[limited]:hidden data-[kind=error]:border-[var(--destructive)] data-[kind=success]:border-[var(--success)] [transform:translateX(var(--toast-swipe-movement-x,0px))]">
        <Primitive.Content className="grid grid-cols-[1fr_auto] items-start gap-3">
          <div className="grid min-w-0 gap-1"><Primitive.Title className="text-sm font-semibold leading-relaxed [overflow-wrap:anywhere]" /><Primitive.Description className="text-sm leading-relaxed text-[var(--muted-foreground)] [overflow-wrap:anywhere]" />{toast.actionProps && <Primitive.Action className="mt-2 w-fit rounded-[var(--neu-radius-control)] border border-transparent bg-[var(--neu-surface)] px-3 py-2 text-sm font-semibold [box-shadow:var(--neu-shadow-raised-sm)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] active:[box-shadow:var(--neu-shadow-inset)]" />}</div>
          <Primitive.Close aria-label={closeLabel} className="grid size-8 place-items-center rounded-[var(--neu-radius-control)] text-lg text-[var(--foreground)] outline-none hover:bg-[var(--neu-surface-soft)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]"><svg aria-hidden="true" className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m6 6 12 12M18 6 6 18" /></svg></Primitive.Close>
        </Primitive.Content>
      </Primitive.Root>)}
    </Primitive.Viewport>
  </Primitive.Portal>;
}

export { ToastProvider, Toaster, useToast, createToastManager };
export type { ToasterProps };
