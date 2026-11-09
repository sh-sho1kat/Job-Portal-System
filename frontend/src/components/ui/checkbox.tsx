"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type CheckedState = boolean | "indeterminate";

interface CheckboxProps
  extends Omit<
    React.ComponentProps<"input">,
    "checked" | "defaultChecked" | "onChange" | "size" | "type"
  > {
  checked?: CheckedState;
  defaultChecked?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onCheckedChange?: (checked: CheckedState) => void;
}

function Checkbox({
  checked,
  className,
  defaultChecked,
  disabled,
  onChange,
  onCheckedChange,
  ref,
  ...props
}: CheckboxProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const isIndeterminate = checked === "indeterminate";

  React.useLayoutEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  const setRef = React.useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node;

      const cleanup = typeof ref === "function" ? ref(node) : undefined;
      if (ref && typeof ref !== "function") ref.current = node;

      return () => {
        inputRef.current = null;
        if (typeof cleanup === "function") cleanup();
        else if (typeof ref === "function") ref(null);
        else if (ref) ref.current = null;
      };
    },
    [ref],
  );

  return (
    <span
      data-slot="checkbox-root"
      className={cn("relative inline-flex size-5 shrink-0 align-middle", className)}
    >
      <input
        ref={setRef}
        type="checkbox"
        data-slot="checkbox"
        className="peer absolute inset-0 z-10 m-0 size-full cursor-pointer appearance-none rounded-[var(--neu-radius-small)] opacity-0 disabled:cursor-not-allowed"
        checked={checked === "indeterminate" ? false : checked}
        defaultChecked={checked === undefined ? defaultChecked : undefined}
        disabled={disabled}
        aria-checked={isIndeterminate ? "mixed" : undefined}
        onChange={(event) => {
          onChange?.(event);
          onCheckedChange?.(event.currentTarget.checked);

          if (isIndeterminate) {
            event.currentTarget.indeterminate = true;
          }
        }}
        {...props}
      />
      <span
        aria-hidden="true"
        className="relative flex size-5 items-center justify-center rounded-[var(--neu-radius-small)] border border-[color:var(--neu-edge)] bg-[var(--neu-surface)] text-[var(--neu-accent-ink)] [box-shadow:var(--neu-shadow-inset)] transition-[background-color,box-shadow] duration-[var(--neu-duration)] motion-reduce:transition-none peer-checked:bg-[var(--neu-surface)] peer-disabled:opacity-50 peer-disabled:shadow-none peer-disabled:border-[color:var(--muted-foreground)]/40 peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--ring)] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[var(--background)] peer-indeterminate:bg-[var(--neu-surface)] peer-checked:[&_[data-check]]:opacity-100 peer-indeterminate:[&_[data-indeterminate]]:opacity-100"
      >
        <svg data-check="" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="absolute size-3.5 opacity-0 transition-opacity"><path d="m5 12 4 4L19 6" /></svg>
        <svg data-indeterminate="" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="absolute size-3.5 opacity-0 transition-opacity"><path d="M5 12h14" /></svg>
      </span>
    </span>
  );
}

export { Checkbox, type CheckedState };
