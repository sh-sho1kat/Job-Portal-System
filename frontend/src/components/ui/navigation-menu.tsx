"use client";

import { NavigationMenu as Primitive } from "@base-ui/react/navigation-menu";
import { mergeClassName } from "@/lib/utils";

function NavigationMenu({ className, ...props }: Primitive.Root.Props) {
  return <Primitive.Root data-slot="navigation-menu" className={mergeClassName<Primitive.Root.State>("relative isolate w-fit max-w-full font-sans", className)} {...props} />;
}
function NavigationMenuList({ className, ...props }: Primitive.List.Props) {
  return <Primitive.List data-slot="navigation-menu-list" className={mergeClassName<Primitive.List.State>("m-0 flex list-none flex-wrap items-center gap-1 rounded-[var(--neu-radius-surface)] border border-[color:var(--neu-edge)] bg-[var(--neu-surface)] p-1 [box-shadow:var(--neu-shadow-inset-sm)]", className)} {...props} />;
}
const NavigationMenuItem = Primitive.Item;
function NavigationMenuTrigger({ className, children, ...props }: Primitive.Trigger.Props) {
  return <Primitive.Trigger data-slot="navigation-menu-trigger" className={mergeClassName<Primitive.Trigger.State>("group inline-flex min-h-10 items-center justify-center gap-2 rounded-[var(--neu-radius-control)] px-3.5 py-2 text-sm font-semibold text-[var(--foreground)] outline-none transition-[background-color,box-shadow] duration-[var(--neu-duration)] motion-reduce:transition-none hover:bg-[var(--neu-surface-soft)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] data-[popup-open]:bg-[var(--neu-surface)] data-[popup-open]:text-[var(--neu-accent-ink)] data-[popup-open]:[box-shadow:var(--neu-shadow-inset)] data-disabled:pointer-events-none data-disabled:opacity-50", className)} {...props}>{children}<Primitive.Icon className="transition-transform duration-[var(--neu-duration)] motion-reduce:transition-none group-data-[popup-open]:rotate-180"><svg aria-hidden="true" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m4 6 4 4 4-4" /></svg></Primitive.Icon></Primitive.Trigger>;
}
function NavigationMenuContent({ className, ...props }: Primitive.Content.Props) {
  return <Primitive.Content data-slot="navigation-menu-content" className={mergeClassName<Primitive.Content.State>("grid w-80 max-w-[calc(100vw-2rem)] gap-1 p-2", className)} {...props} />;
}
function NavigationMenuLink({ className, ...props }: Primitive.Link.Props) {
  return <Primitive.Link data-slot="navigation-menu-link" className={mergeClassName<Primitive.Link.State>("block rounded-[var(--neu-radius-control)] px-3 py-2.5 text-sm leading-relaxed text-[var(--foreground)] no-underline outline-none transition-[background-color,box-shadow] duration-[var(--neu-duration)] motion-reduce:transition-none hover:bg-[var(--neu-surface-soft)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] data-active:bg-[var(--neu-selected)] data-active:font-semibold data-active:[box-shadow:var(--neu-shadow-inset)]", className)} {...props} />;
}
type NavigationMenuViewportProps = Primitive.Popup.Props & Pick<Primitive.Positioner.Props, "side" | "align" | "sideOffset" | "alignOffset">;
function NavigationMenuViewport({ className, side = "bottom", align = "start", sideOffset = 8, alignOffset = 0, ...props }: NavigationMenuViewportProps) {
  return <Primitive.Portal><Primitive.Positioner side={side} align={align} sideOffset={sideOffset} alignOffset={alignOffset} collisionPadding={16} className="z-50 h-[var(--positioner-height)] w-[var(--positioner-width)] max-w-[calc(100vw-2rem)] outline-none"><Primitive.Popup data-slot="navigation-menu-popup" className={mergeClassName<Primitive.Popup.State>("h-[var(--popup-height)] w-[var(--popup-width)] max-h-[var(--available-height)] max-w-[calc(100vw-2rem)] origin-[var(--transform-origin)] overflow-y-auto rounded-[var(--neu-radius-overlay)] border border-[color:var(--neu-edge)] bg-[var(--popover)] text-[var(--popover-foreground)] [box-shadow:var(--neu-shadow-floating)] outline-none transition-opacity duration-[var(--neu-duration)] motion-reduce:transition-none data-[starting-style]:opacity-0 data-[ending-style]:opacity-0", className)} {...props}><Primitive.Viewport /></Primitive.Popup></Primitive.Positioner></Primitive.Portal>;
}

export { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink, NavigationMenuViewport };
export type { NavigationMenuViewportProps };
