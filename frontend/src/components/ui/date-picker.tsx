"use client";

import * as React from "react";
import type { Locale, Matcher } from "@daypicker/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";

type DatePickerProps = {
  label: string;
  value?: Date;
  onValueChange: (value: Date | undefined) => void;
  id?: string;
  name?: string;
  className?: string;
  placeholder?: string;
  clearLabel?: string;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
  locale?: Partial<Locale>;
  disabledDates?: Matcher | Matcher[];
  startMonth?: Date;
  endMonth?: Date;
};

// Date-only form values must not cross a UTC boundary through toISOString().
function dateOnly(value: Date) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
}

function DatePicker({ label, value, onValueChange, id, name, className, placeholder = "Select date", clearLabel = "Clear date", disabled = false, invalid, describedBy, locale, disabledDates, startMonth, endMonth }: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const trigger = React.useRef<HTMLButtonElement>(null);
  const display = value?.toLocaleDateString(locale?.code ?? "en-US", { year: "numeric", month: "short", day: "numeric" });
  return <div data-slot="date-picker" className={cn("flex min-w-0 items-center gap-2", className)}>
    {name && <input type="hidden" name={name} value={value ? dateOnly(value) : ""} disabled={disabled} />}
    <Popover open={open && !disabled} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button ref={trigger} id={id} disabled={disabled} aria-invalid={invalid || undefined} aria-describedby={describedBy} aria-label={`${label}: ${display ?? placeholder}`} className="min-w-0 flex-1 justify-between px-3 whitespace-nowrap text-start font-normal shadow-[var(--neu-shadow-inset)] [background-image:var(--neu-fill-inset)] hover:shadow-[var(--neu-shadow-inset)] aria-invalid:border-[var(--destructive)]" />}>
        <span className="min-w-0 flex-1 truncate">{display ?? placeholder}</span>
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M7 3v4m10-4v4M3 11h18" /></svg>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto gap-0 p-1">
        <PopoverTitle className="sr-only">{label}</PopoverTitle>
        <Calendar mode="single" required autoFocus selected={value} defaultMonth={value ?? startMonth} onSelect={date => { onValueChange(date); setOpen(false); }} locale={locale} disabled={disabledDates} startMonth={startMonth} endMonth={endMonth} className="border-0 [box-shadow:none]" />
      </PopoverContent>
    </Popover>
    {value && <Button variant="ghost" size="icon" disabled={disabled} aria-label={clearLabel} onClick={() => { onValueChange(undefined); trigger.current?.focus(); }}><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="m6 6 12 12M18 6 6 18" /></svg></Button>}
  </div>;
}

export { DatePicker };
export type { DatePickerProps };
