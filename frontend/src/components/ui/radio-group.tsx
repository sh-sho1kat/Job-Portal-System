"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type RadioGroupContextValue = {
  disabled?: boolean;
  name: string;
  onValueChange: (value: string) => void;
  required?: boolean;
  value?: string;
};

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null);

interface RadioGroupProps
  extends Omit<React.ComponentProps<"div">, "defaultValue" | "onChange"> {
  defaultValue?: string;
  disabled?: boolean;
  name?: string;
  onValueChange?: (value: string) => void;
  orientation?: "horizontal" | "vertical";
  required?: boolean;
  value?: string;
}

function RadioGroup({
  children,
  className,
  defaultValue,
  disabled,
  name,
  onValueChange,
  ref,
  orientation = "vertical",
  required,
  value,
  ...props
}: RadioGroupProps) {
  const generatedName = React.useId();
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
  const currentValue = value ?? uncontrolledValue;
  const groupRef = React.useRef<HTMLDivElement>(null);
  const setRef = React.useCallback((node: HTMLDivElement | null) => {
    groupRef.current = node;
    const cleanup = typeof ref === "function" ? ref(node) : undefined;
    if (ref && typeof ref !== "function") ref.current = node;

    return () => {
      groupRef.current = null;
      if (typeof cleanup === "function") cleanup();
      else if (typeof ref === "function") ref(null);
      else if (ref) ref.current = null;
    };
  }, [ref]);

  React.useEffect(() => {
    if (value !== undefined) return;
    const form = groupRef.current?.querySelector<HTMLInputElement>('input[type="radio"]')?.form;
    if (!form) return;
    const restore = (event: Event) => {
      // React onReset may cancel later in event propagation.
      // Defer until the native reset decision is final.
      setTimeout(() => {
        if (!event.defaultPrevented) setUncontrolledValue(defaultValue);
      }, 0);
    };
    form.addEventListener("reset", restore);
    return () => form.removeEventListener("reset", restore);
  }, [defaultValue, value]);

  const updateValue = React.useCallback(
    (nextValue: string) => {
      if (value === undefined) {
        setUncontrolledValue(nextValue);
      }

      onValueChange?.(nextValue);
    },
    [onValueChange, value],
  );

  const context = React.useMemo(
    () => ({
      disabled,
      name: name ?? generatedName,
      onValueChange: updateValue,
      required,
      value: currentValue,
    }),
    [currentValue, disabled, generatedName, name, required, updateValue],
  );

  return (
    <RadioGroupContext.Provider value={context}>
      <div
        ref={setRef}
        role="radiogroup"
        aria-orientation={orientation}
        data-slot="radio-group"
        data-orientation={orientation}
        className={cn(
          "flex gap-3",
          orientation === "horizontal" ? "flex-row items-center" : "flex-col items-start",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}

interface RadioGroupItemProps
  extends Omit<
    React.ComponentProps<"input">,
    "checked" | "defaultChecked" | "name" | "onChange" | "size" | "type"
  > {
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  value: string;
}

function RadioGroupItem({
  className,
  disabled,
  onChange,
  value,
  ...props
}: RadioGroupItemProps) {
  const context = React.useContext(RadioGroupContext);

  if (!context) {
    throw new Error("RadioGroupItem must be used inside RadioGroup.");
  }

  const isDisabled = disabled || context.disabled;
  const isChecked = context.value === value;

  return (
    <span
      data-slot="radio-group-item-root"
      className={cn("relative inline-flex size-5 shrink-0 align-middle", className)}
    >
      <input
        type="radio"
        data-slot="radio-group-item"
        className="peer absolute inset-0 z-10 m-0 size-full cursor-pointer appearance-none rounded-full opacity-0 disabled:cursor-not-allowed"
        name={context.name}
        value={value}
        checked={isChecked}
        disabled={isDisabled}
        required={context.required}
        onChange={(event) => {
          onChange?.(event);

          if (event.currentTarget.checked) {
            context.onValueChange(value);
          }
        }}
        {...props}
      />
      <span
        aria-hidden="true"
        className="flex size-5 items-center justify-center rounded-full border border-[color:var(--neu-edge)] bg-[var(--neu-surface)] [box-shadow:var(--neu-shadow-inset)] transition-[box-shadow] duration-[var(--neu-duration)] motion-reduce:transition-none peer-disabled:opacity-50 peer-disabled:shadow-none peer-disabled:border-[color:var(--muted-foreground)]/40 peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--ring)] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[var(--background)] peer-checked:[&>span]:opacity-100"
      >
        <span className="size-2 rounded-full bg-[var(--neu-accent-ink)] opacity-0 transition-opacity duration-[var(--neu-duration)] motion-reduce:transition-none" />
      </span>
    </span>
  );
}

export { RadioGroup, RadioGroupItem };
