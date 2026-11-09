import * as React from "react";

import { cn } from "@/lib/utils";

function Breadcrumb(props: React.ComponentProps<"nav">) {
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />;
}

function BreadcrumbList({
  className,
  ...props
}: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        "m-0 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 p-0 list-none text-sm text-[var(--muted-foreground)]",
        className,
      )}
      {...props}
    />
  );
}

function BreadcrumbItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("inline-flex min-w-0 max-w-full items-baseline gap-2 [overflow-wrap:anywhere]", className)}
      {...props}
    />
  );
}

function BreadcrumbLink({
  className,
  ...props
}: React.ComponentProps<"a">) {
  return (
    <a
      data-slot="breadcrumb-link"
      className={cn(
        "min-w-0 rounded-[var(--neu-radius-small)] outline-none transition-colors hover:text-[var(--foreground)] focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
        className,
      )}
      {...props}
    />
  );
}

function BreadcrumbPage({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-current="page"
      data-slot="breadcrumb-page"
      className={cn("min-w-0 font-semibold text-[var(--foreground)]", className)}
      {...props}
    />
  );
}

// Keep this inside the following BreadcrumbItem so the separator cannot orphan.
function BreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden="true"
      data-slot="breadcrumb-separator"
      className={cn("shrink-0 select-none text-[var(--muted-foreground)]/70", className)}
      {...props}
    >
      {children ?? "/"}
    </span>
  );
}

function BreadcrumbEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden="true"
      data-slot="breadcrumb-ellipsis"
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-full bg-[var(--neu-surface)] [box-shadow:var(--neu-shadow-inset)]",
        className,
      )}
      {...props}
    >
      <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" /></svg>
      <span className="sr-only">More</span>
    </span>
  );
}

export {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
};
