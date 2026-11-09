import * as React from "react";

import { cn } from "@/lib/utils";

function Pagination({
  className,
  ...props
}: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("@container/pagination mx-auto flex w-full min-w-0 justify-center", className)}
      {...props}
    />
  );
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("m-0 flex max-w-full flex-wrap items-center justify-center gap-1 p-0 list-none", className)}
      {...props}
    />
  );
}

function PaginationItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" className={cn("flex min-w-0", className)} {...props} />;
}

type PaginationLinkProps = React.ComponentProps<"a"> & {
  isActive?: boolean;
};

function PaginationLink({
  className,
  isActive = false,
  ...props
}: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive || undefined}
      className={cn(
        "inline-flex size-10 shrink-0 items-center justify-center rounded-[var(--neu-radius-control)] border text-sm font-semibold leading-5 tabular-nums aria-disabled:opacity-40 aria-disabled:shadow-none outline-none transition-[box-shadow,color,background-color] duration-[var(--neu-duration)] motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-3 focus-visible:outline-[var(--ring)]",
        isActive
          ? "border-transparent bg-[var(--neu-surface)] text-[var(--neu-accent-ink)] [box-shadow:var(--neu-shadow-raised-sm)]"
          : "border-transparent bg-transparent text-[var(--foreground)] hover:bg-[var(--neu-surface)] hover:[box-shadow:var(--neu-shadow-inset-sm)]",
        className,
      )}
      {...props}
    />
  );
}

function PaginationPrevious({
  className,
  children,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      className={cn("h-auto min-h-10 min-w-10 w-auto max-w-full gap-1 px-2 py-2 text-center [overflow-wrap:anywhere]", className)}
      {...props}
    >
      <svg aria-hidden="true" className="size-4 shrink-0 rtl:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m14 6-6 6 6 6" /></svg>
      <span data-slot="pagination-label" className="@max-[24rem]/pagination:sr-only">{children ?? "Previous"}</span>
    </PaginationLink>
  );
}

function PaginationNext({
  className,
  children,
  ...props
}: React.ComponentProps<typeof PaginationLink>) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      className={cn("h-auto min-h-10 min-w-10 w-auto max-w-full gap-1 px-2 py-2 text-center [overflow-wrap:anywhere]", className)}
      {...props}
    >
      <span data-slot="pagination-label" className="@max-[24rem]/pagination:sr-only">{children ?? "Next"}</span>
      <svg aria-hidden="true" className="size-4 shrink-0 rtl:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m10 6 6 6-6 6" /></svg>
    </PaginationLink>
  );
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden="true"
      data-slot="pagination-ellipsis"
      className={cn(
        "inline-flex size-10 items-center justify-center text-sm text-[var(--muted-foreground)] @max-[17rem]/pagination:hidden",
        className,
      )}
      {...props}
    >
      <svg aria-hidden="true" className="size-4" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" /></svg>
      <span className="sr-only">More pages</span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
