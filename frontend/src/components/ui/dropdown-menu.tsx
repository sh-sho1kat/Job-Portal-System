"use client";

import * as React from "react";
import { Menu as DropdownMenuPrimitive } from "@base-ui/react/menu";

import { cn, mergeClassName } from "@/lib/utils";

type DropdownMenuPositionerProps = Pick<
  DropdownMenuPrimitive.Positioner.Props,
  "align" | "alignOffset" | "side" | "sideOffset"
>;

type DropdownMenuContentProps = DropdownMenuPrimitive.Popup.Props &
  DropdownMenuPositionerProps;

function DropdownMenu(props: DropdownMenuPrimitive.Root.Props) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuPortal(props: DropdownMenuPrimitive.Portal.Props) {
  return <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />;
}

function DropdownMenuTrigger(props: DropdownMenuPrimitive.Trigger.Props) {
  return <DropdownMenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />;
}

function DropdownMenuContent({
  className,
  align = "start",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 8,
  ...props
}: DropdownMenuContentProps) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        collisionPadding={8}
        className="isolate z-50 outline-none"
        side={side}
        sideOffset={sideOffset}
      >
        <DropdownMenuPrimitive.Popup
          data-slot="dropdown-menu-content"
          className={mergeClassName<DropdownMenuPrimitive.Popup.State>(
            "max-h-[var(--available-height)] max-w-[min(24rem,var(--available-width))] min-w-36 origin-[var(--transform-origin)] overflow-x-hidden overflow-y-auto rounded-[var(--neu-radius-overlay)] border border-[color:var(--neu-edge)] bg-[var(--popover)] p-1.5 text-[var(--popover-foreground)] [box-shadow:var(--neu-shadow-floating)] outline-none transition-[transform,opacity] duration-[var(--neu-duration)] motion-reduce:transition-none data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
            className,
          )}
          {...props}
        />
      </DropdownMenuPrimitive.Positioner>
    </DropdownMenuPrimitive.Portal>
  );
}

function DropdownMenuGroup(props: DropdownMenuPrimitive.Group.Props) {
  return <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />;
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: DropdownMenuPrimitive.Item.Props & {
  inset?: boolean;
  variant?: "default" | "destructive";
}) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={mergeClassName<DropdownMenuPrimitive.Item.State>(
        "relative flex min-h-10 min-w-0 [overflow-wrap:anywhere] cursor-default items-center gap-2 rounded-[var(--neu-radius-small)] px-2.5 py-2 text-sm outline-none select-none transition-[color,background-color] duration-[var(--neu-duration)] motion-reduce:transition-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-[var(--neu-surface)] data-[highlighted]:[box-shadow:var(--neu-shadow-inset-sm)] data-[highlighted]:text-[var(--foreground)] data-[inset=true]:ps-8 data-[variant=destructive]:text-[var(--neu-error-text)] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: DropdownMenuPrimitive.CheckboxItem.Props) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      checked={checked}
      className={mergeClassName<DropdownMenuPrimitive.CheckboxItem.State>(
        "relative flex min-h-10 min-w-0 [overflow-wrap:anywhere] cursor-default items-center gap-2 rounded-[var(--neu-radius-small)] py-2 pe-2.5 ps-8 text-sm outline-none select-none transition-colors duration-[var(--neu-duration)] motion-reduce:transition-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-[var(--neu-surface)] data-[highlighted]:[box-shadow:var(--neu-shadow-inset-sm)]",
        className,
      )}
      {...props}
    >
      <span className="pointer-events-none absolute start-2.5 grid size-4 place-items-center text-[var(--neu-accent-ink)]">
        <DropdownMenuPrimitive.CheckboxItemIndicator>
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 4 4L19 6" /></svg>
        </DropdownMenuPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
}

function DropdownMenuRadioGroup(props: DropdownMenuPrimitive.RadioGroup.Props) {
  return <DropdownMenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />;
}

function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: DropdownMenuPrimitive.RadioItem.Props) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={mergeClassName<DropdownMenuPrimitive.RadioItem.State>(
        "relative flex min-h-10 min-w-0 [overflow-wrap:anywhere] cursor-default items-center gap-2 rounded-[var(--neu-radius-small)] py-2 pe-2.5 ps-8 text-sm outline-none select-none transition-colors duration-[var(--neu-duration)] motion-reduce:transition-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-[var(--neu-surface)] data-[highlighted]:[box-shadow:var(--neu-shadow-inset-sm)]",
        className,
      )}
      {...props}
    >
      <span className="pointer-events-none absolute start-2.5 grid size-4 place-items-center text-[var(--neu-accent-ink)]">
        <DropdownMenuPrimitive.RadioItemIndicator>
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="4" /></svg>
        </DropdownMenuPrimitive.RadioItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: DropdownMenuPrimitive.GroupLabel.Props & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.GroupLabel
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={mergeClassName<DropdownMenuPrimitive.GroupLabel.State>(
        "px-2.5 py-1.5 text-xs font-semibold text-[var(--muted-foreground)] data-[inset=true]:ps-8",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuSeparator({
  className,
  ...props
}: DropdownMenuPrimitive.Separator.Props) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={mergeClassName<DropdownMenuPrimitive.Separator.State>(
        "-mx-1 my-1 h-px bg-[var(--border)]",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "ms-auto shrink-0 whitespace-nowrap text-xs tracking-widest text-[var(--muted-foreground)]",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuSub(props: DropdownMenuPrimitive.SubmenuRoot.Props) {
  return <DropdownMenuPrimitive.SubmenuRoot data-slot="dropdown-menu-sub" {...props} />;
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: DropdownMenuPrimitive.SubmenuTrigger.Props & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.SubmenuTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={mergeClassName<DropdownMenuPrimitive.SubmenuTrigger.State>(
        "flex min-h-10 min-w-0 [overflow-wrap:anywhere] cursor-default items-center gap-2 rounded-[var(--neu-radius-small)] px-2.5 py-2 text-sm outline-none select-none data-[highlighted]:bg-[var(--neu-surface)] data-[highlighted]:[box-shadow:var(--neu-shadow-inset-sm)] data-[inset=true]:ps-8 data-[popup-open]:bg-[var(--neu-surface-low)]",
        className,
      )}
      {...props}
    >
      {children}
      <svg aria-hidden="true" className="ms-auto size-4 shrink-0 text-[var(--muted-foreground)] rtl:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m9 5 7 7-7 7" /></svg>
    </DropdownMenuPrimitive.SubmenuTrigger>
  );
}

function DropdownMenuSubContent({
  className,
  align = "start",
  alignOffset = -4,
  side = "right",
  sideOffset = 8,
  ...props
}: DropdownMenuContentProps) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        collisionPadding={8}
        className="isolate z-50 outline-none"
        side={side}
        sideOffset={sideOffset}
      >
        <DropdownMenuPrimitive.Popup
          data-slot="dropdown-menu-sub-content"
          className={mergeClassName<DropdownMenuPrimitive.Popup.State>(
            "max-h-[var(--available-height)] max-w-[min(24rem,var(--available-width))] min-w-36 origin-[var(--transform-origin)] overflow-x-hidden overflow-y-auto overscroll-contain rounded-[var(--neu-radius-overlay)] border border-[color:var(--neu-edge)] bg-[var(--popover)] p-1.5 text-[var(--popover-foreground)] [box-shadow:var(--neu-shadow-floating)] outline-none transition-[transform,opacity] duration-[var(--neu-duration)] motion-reduce:transition-none data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
            className,
          )}
          {...props}
        />
      </DropdownMenuPrimitive.Positioner>
    </DropdownMenuPrimitive.Portal>
  );
}

export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
};
