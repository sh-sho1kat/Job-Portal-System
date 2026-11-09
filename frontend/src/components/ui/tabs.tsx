"use client";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";

import { mergeClassName } from "@/lib/utils";

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      orientation={orientation}
      className={mergeClassName<TabsPrimitive.Root.State>(
        "flex w-full min-w-0 flex-col gap-3 data-[orientation=vertical]:flex-row",
        className,
      )}
      {...props}
    />
  );
}

function TabsList({ className, ...props }: TabsPrimitive.List.Props) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={mergeClassName<TabsPrimitive.List.State>(
        "inline-flex h-11 min-w-0 shrink-0 max-w-full w-fit items-center justify-start overflow-x-auto gap-1 rounded-[var(--neu-radius-control)] border border-[color:var(--border)] bg-[var(--neu-surface-low)] p-1 [box-shadow:inset_0_1px_2px_var(--neu-shadow-dark)] data-[orientation=vertical]:h-fit data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch data-[orientation=vertical]:max-w-[50%] [&[data-orientation=vertical]>[data-slot=tabs-trigger]]:flex-none",
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={mergeClassName<TabsPrimitive.Tab.State>(
        "inline-flex h-8 leading-5 tracking-normal shrink-0 flex-1 items-center justify-center gap-1.5 rounded-[max(var(--neu-radius-small),calc(var(--neu-radius-control)-4px))] border border-transparent px-4 text-sm font-semibold whitespace-nowrap text-[var(--muted-foreground)] outline-hidden transition-[color,background-color,box-shadow,transform] duration-[var(--neu-duration)] motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-[-2px] focus-visible:outline-[color:var(--ring)] hover:not-data-disabled:not-data-active:text-[var(--foreground)] data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[active]:bg-[var(--primary)] data-[active]:[background-image:var(--neu-fill-primary)] data-[active]:text-[var(--primary-foreground)] data-[active]:[box-shadow:0_1px_2px_var(--neu-shadow-dark),inset_0_1px_0_color-mix(in_srgb,var(--primary)_80%,white)] data-[active]:focus-visible:outline-[color:var(--primary-foreground)] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={mergeClassName<TabsPrimitive.Panel.State>(
        "min-w-0 flex-1 rounded-[var(--neu-radius-surface)] outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
        className,
      )}
      {...props}
    />
  );
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
