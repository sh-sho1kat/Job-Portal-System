"use client";

import { Menubar as Primitive } from "@base-ui/react/menubar";
import { Menu } from "@base-ui/react/menu";
import { mergeClassName } from "@/lib/utils";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuGroup, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";

function Menubar({ className, ...props }: Primitive.Props) {
  return <Primitive data-slot="menubar" className={mergeClassName<Primitive.State>("flex w-fit max-w-full flex-wrap items-center gap-1 rounded-[var(--neu-radius-surface)] border border-[color:var(--neu-edge)] bg-[var(--neu-surface)] p-1 font-sans [box-shadow:var(--neu-shadow-inset-sm)]", className)} {...props} />;
}
function MenubarTrigger({ className, ...props }: Menu.Trigger.Props) {
  return <Menu.Trigger data-slot="menubar-trigger" className={mergeClassName<Menu.Trigger.State>("inline-flex min-h-9 items-center rounded-[var(--neu-radius-control)] px-3 py-2 text-sm font-semibold text-[var(--foreground)] outline-none transition-[background-color,box-shadow] duration-[var(--neu-duration)] motion-reduce:transition-none hover:bg-[var(--neu-surface-soft)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] data-[popup-open]:bg-[var(--neu-surface)] data-[popup-open]:text-[var(--neu-accent-ink)] data-[popup-open]:[box-shadow:var(--neu-shadow-inset)] data-disabled:pointer-events-none data-disabled:opacity-50", className)} {...props} />;
}

// Menubar supplies roving focus; the existing menu parts supply popup behavior.
export {
  Menubar, MenubarTrigger, DropdownMenu as MenubarMenu, DropdownMenuContent as MenubarContent,
  DropdownMenuItem as MenubarItem, DropdownMenuCheckboxItem as MenubarCheckboxItem,
  DropdownMenuRadioGroup as MenubarRadioGroup, DropdownMenuRadioItem as MenubarRadioItem,
  DropdownMenuGroup as MenubarGroup, DropdownMenuLabel as MenubarLabel,
  DropdownMenuSeparator as MenubarSeparator, DropdownMenuShortcut as MenubarShortcut,
  DropdownMenuSub as MenubarSub, DropdownMenuSubTrigger as MenubarSubTrigger,
  DropdownMenuSubContent as MenubarSubContent,
};
