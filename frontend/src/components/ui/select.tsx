import * as React from "react";
import { cn } from "@/lib/utils";
function Select({ className, children, multiple, size, ...props }: React.ComponentProps<"select">) {
  const listbox = Boolean(multiple || (size !== undefined && size > 1));
  return (
      <select
        data-slot="select" multiple={multiple} size={size}
        className={cn(
          "w-full min-w-0 appearance-none rounded-[var(--neu-radius-control)] border border-transparent bg-[var(--neu-surface)] text-sm font-normal tracking-normal text-[var(--foreground)] shadow-[var(--neu-shadow-inset)] outline-hidden transition-[box-shadow,border-color] duration-[var(--neu-duration)] motion-reduce:transition-none focus-visible:border-[var(--ring)] focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none disabled:border-[color:var(--input)] aria-invalid:border-[var(--destructive)] aria-invalid:focus-visible:outline-[color:var(--neu-error-text)]",
          listbox ? "min-h-24 px-3 py-2 [background-image:var(--neu-fill-inset)] disabled:[background-image:none]" : "h-10 py-2 ps-3 pe-10 [background-image:var(--neu-select-arrow),var(--neu-fill-inset)] [background-size:1rem_1rem,auto] [background-position:right_0.75rem_center,center] rtl:[background-position:left_0.75rem_center,center] bg-no-repeat disabled:[background-image:var(--neu-select-arrow)] forced-colors:appearance-auto forced-colors:[background-image:none]",
          className,
        )}
        {...props}
      >{children}</select>

  );
}
function SelectGroup(props: React.ComponentProps<"optgroup">) { return <optgroup data-slot="select-group" {...props} />; }
function SelectItem(props: React.ComponentProps<"option">) { return <option data-slot="select-item" {...props} />; }
const SelectOption = SelectItem;
export { Select, SelectGroup, SelectItem, SelectOption };
