"use client";

import * as React from "react";
import { DayPicker } from "@daypicker/react";
import { cn } from "@/lib/utils";

type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return <div data-slot="calendar" className="max-w-full"><DayPicker
    showOutsideDays={showOutsideDays}
    className={cn("w-fit min-w-0 max-w-full rounded-[var(--neu-radius-surface)] border border-transparent bg-[var(--neu-surface)] p-4 font-sans text-[var(--foreground)] [box-shadow:var(--neu-shadow-raised-sm)] [--cell-size:clamp(1.75rem,7.5vw,2.25rem)]", props.showWeekNumber ? "[--calendar-columns:8]" : "[--calendar-columns:7]", className)}
    classNames={{
      months: "relative flex max-w-full flex-wrap justify-center gap-6",
      month: "flex min-w-0 max-w-full grow flex-col gap-3 w-[calc(var(--cell-size)*var(--calendar-columns))]",
      month_caption: "flex h-10 items-center justify-center px-10",
      caption_label: "min-w-0 text-center text-sm font-semibold leading-5 text-balance",
      nav: "pointer-events-none absolute inset-x-0 top-0 flex h-10 items-center justify-between",
      button_previous: "pointer-events-auto grid size-9 place-items-center rounded-[var(--neu-radius-control)] border border-transparent bg-[var(--neu-surface)] [box-shadow:var(--neu-shadow-raised-sm)] outline-none hover:[box-shadow:var(--neu-shadow-hover)] active:[box-shadow:var(--neu-shadow-inset)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:opacity-35 aria-disabled:opacity-35 [&>svg]:size-4",
      button_next: "pointer-events-auto grid size-9 place-items-center rounded-[var(--neu-radius-control)] border border-transparent bg-[var(--neu-surface)] [box-shadow:var(--neu-shadow-raised-sm)] outline-none hover:[box-shadow:var(--neu-shadow-hover)] active:[box-shadow:var(--neu-shadow-inset)] focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:opacity-35 aria-disabled:opacity-35 [&>svg]:size-4",
      chevron: "fill-current",
      dropdowns: "flex items-center justify-center gap-2 text-sm font-semibold",
      dropdown_root: "relative rounded-[var(--neu-radius-small)] focus-within:ring-2 focus-within:ring-[var(--ring)]",
      dropdown: "absolute inset-0 cursor-pointer opacity-0",
      month_grid: "w-full table-fixed border-collapse",
      weekdays: "border-b border-[var(--border)]",
      weekday: "h-8 text-center text-xs font-medium text-[var(--muted-foreground)]",
      week: "h-[calc(var(--cell-size)+0.25rem)]",
      week_number_header: "h-8 text-center",
      week_number: "text-center text-xs text-[var(--muted-foreground)]",
      day: "h-[var(--cell-size)] p-0 text-center text-sm",
      day_button: "mx-auto grid h-[var(--cell-size)] w-full max-w-[var(--cell-size)] min-w-0 place-items-center rounded-[var(--neu-radius-control)] border border-transparent font-medium outline-none transition-[background-color,box-shadow] duration-[var(--neu-duration)] motion-reduce:transition-none hover:bg-[var(--neu-surface-soft)] hover:[box-shadow:var(--neu-shadow-raised-sm)] active:[box-shadow:var(--neu-shadow-inset)] focus-visible:relative focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-35",
      selected: "[&:not(.neu-range-middle)>button]:bg-[var(--neu-surface)] [&:not(.neu-range-middle)>button]:font-semibold [&:not(.neu-range-middle)>button]:text-[var(--neu-accent-ink)] [&:not(.neu-range-middle)>button]:[box-shadow:var(--neu-shadow-raised-sm)]",
      range_start: "rounded-s-[var(--neu-radius-small)] bg-[var(--neu-selected)]",
      range_middle: "neu-range-middle bg-[var(--neu-selected)] [&>button]:rounded-none [&>button]:bg-transparent [&>button]:text-[var(--foreground)] [&>button]:shadow-none",
      range_end: "rounded-e-[var(--neu-radius-small)] bg-[var(--neu-selected)]",
      today: "[&>button]:border-[var(--ring)]",
      outside: "text-[var(--muted-foreground)]",
      disabled: "cursor-not-allowed",
      hidden: "invisible",
      footer: "max-w-64 pt-3 text-sm text-[var(--muted-foreground)]",
      ...classNames,
    }}
    {...props}
  /></div>;
}

export { Calendar };
export type { CalendarProps };
