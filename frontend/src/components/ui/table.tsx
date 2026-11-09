import * as React from "react";

import { cn } from "@/lib/utils";

// Local covers hide the stationary edge cues when no more columns exist there.
// Native scrolling controls the effect; tables stay server-renderable.
const scrollEdges: React.CSSProperties = {
  backgroundImage: "linear-gradient(to right, var(--neu-surface) 30%, transparent), linear-gradient(to left, var(--neu-surface) 30%, transparent), linear-gradient(to right, var(--border), transparent), linear-gradient(to left, var(--border), transparent)",
  backgroundPosition: "left center, right center, left center, right center",
  backgroundSize: "40px 100%, 40px 100%, 12px 100%, 12px 100%",
  backgroundRepeat: "no-repeat",
  backgroundAttachment: "local, local, scroll, scroll",
};

function Table({ className, containerProps, ...props }: React.ComponentProps<"table"> & { containerProps?: React.ComponentProps<"div"> }) {
  return (
    <div
      {...containerProps}
      data-slot="table-container"
      style={{ ...scrollEdges, ...containerProps?.style }}
      className={cn("relative w-full overflow-x-auto rounded-[var(--neu-radius-surface)] border border-[color:var(--neu-edge)] bg-[var(--neu-surface)] [box-shadow:var(--neu-shadow-raised-sm)]", containerProps?.className)}
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm leading-5 tabular-nums", className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn(
        "bg-[var(--neu-surface-soft)] text-[var(--foreground)] [&_tr]:border-b [&_tr]:border-[var(--border)]",
        className,
      )}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t border-[var(--border)] bg-[var(--neu-surface-soft)] font-medium text-[var(--foreground)] [&>tr]:last:border-b-0",
        className,
      )}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b border-[var(--border)] transition-[background-color,box-shadow] duration-[var(--neu-duration)] motion-reduce:transition-none hover:bg-[var(--neu-surface-soft)] data-[state=selected]:bg-[var(--neu-surface-soft)]",
        className,
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-11 px-4 text-left align-middle text-xs font-semibold whitespace-nowrap text-[var(--muted-foreground)] [&:has([role=checkbox])]:pr-0",
        className,
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-4 align-middle text-[var(--foreground)] [&:has([role=checkbox])]:pr-0 [&_[data-slot=badge]]:whitespace-nowrap",
        className,
      )}
      {...props}
    />
  );
}

function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn(
        "caption-bottom px-4 py-3 text-left text-sm text-[var(--muted-foreground)]",
        className,
      )}
      {...props}
    />
  );
}

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
};
