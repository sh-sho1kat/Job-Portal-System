"use client";

import * as React from "react";
import { flexRender, type Column, type Column_RowSorting, type ReactTable, type RowData, type Row_ColumnVisibility, type Row_RowSelection, type StockFeatures, type Table_ColumnVisibility, type Table_RowPagination, type TableState_RowPagination } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Select, SelectItem } from "@/components/ui/select";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type DataTableFeatures = Pick<StockFeatures, "columnVisibilityFeature" | "rowSelectionFeature" | "rowSortingFeature">;
type DataTableProps<TFeatures extends DataTableFeatures, TData extends RowData> = { table: ReactTable<TFeatures, TData>; caption: string; emptyMessage?: string; children?: React.ReactNode; className?: string };

// The application owns TanStack state and data access; this component owns rendering.
function DataTable<TFeatures extends DataTableFeatures, TData extends RowData>({ table, caption, emptyMessage = "No results.", children, className }: DataTableProps<TFeatures, TData>) {
  // TanStack's conditional feature types cannot resolve a generic constraint; these
  // native interfaces make the required feature contract explicit inside the view.
  const visibleTable = table as typeof table & Table_ColumnVisibility<TFeatures, TData>;
  return <section data-slot="data-table" className={cn("grid min-w-0 w-full gap-4", className)}>
    {children}
    <Table containerProps={{ role: "region", "aria-label": caption, tabIndex: 0, className: "outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]" }}>
      <TableCaption>{caption}</TableCaption>
      <TableHeader>{table.getHeaderGroups().map(group => <TableRow key={group.id}>{group.headers.map(header => {
        const column = header.column as typeof header.column & Column_RowSorting<TFeatures, TData>;
        const sorted = column.getIsSorted();
        return <TableHead key={header.id} colSpan={header.colSpan} scope={header.colSpan > 1 ? "colgroup" : "col"} aria-sort={column.getCanSort() ? sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : "none" : undefined}>{header.isPlaceholder ? null : flexRender(column.columnDef.header, header.getContext())}</TableHead>;
      })}</TableRow>)}</TableHeader>
      <TableBody>{table.getRowModel().rows.length ? table.getRowModel().rows.map(row => {
        const visibleRow = row as typeof row & Row_ColumnVisibility<TFeatures, TData> & Row_RowSelection;
        return <TableRow key={row.id} data-state={visibleRow.getIsSelected() ? "selected" : undefined}>{visibleRow.getVisibleCells().map(cell => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}</TableRow>;
      }) : <TableRow><TableCell colSpan={Math.max(1, visibleTable.getVisibleLeafColumns().length)} className="h-32 text-center"><span role="status">{emptyMessage}</span></TableCell></TableRow>}</TableBody>
    </Table>
  </section>;
}

function DataTableColumnHeader<TFeatures extends Pick<StockFeatures, "rowSortingFeature">, TData extends RowData, TValue>({ column, title }: { column: Column<TFeatures, TData, TValue>; title: string }) {
  const sortingColumn = column as typeof column & Column_RowSorting<TFeatures, TData>;
  if (!sortingColumn.getCanSort()) return <span>{title}</span>;
  return <Button variant="ghost" size="sm" className="-ms-3 gap-2 text-inherit" onClick={sortingColumn.getToggleSortingHandler()}>{title}<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={sortingColumn.getIsSorted() === "asc" ? "M12 19V5m-5 5 5-5 5 5" : sortingColumn.getIsSorted() === "desc" ? "M12 5v14m-5-5 5 5 5-5" : "M8 19V5m-4 4 4-4 4 4M16 5v14m-4-4 4 4 4-4"} /></svg></Button>;
}

type PaginationLabels = { previous: string; next: string; rowsPerPage: string; page: (current: number, total: number) => string };
const defaultLabels: PaginationLabels = { previous: "Previous", next: "Next", rowsPerPage: "Rows per page", page: (current, total) => `Page ${current} of ${total}` };

function DataTablePagination<TFeatures extends Pick<StockFeatures, "rowPaginationFeature">, TData extends RowData>({ table, labels = defaultLabels, pageSizes = [5, 10, 20, 50] }: { table: ReactTable<TFeatures, TData>; labels?: PaginationLabels; pageSizes?: readonly number[] }) {
  const id = React.useId();
  const paginatedTable = table as typeof table & Table_RowPagination<TFeatures, TData> & { state: TableState_RowPagination };
  const count = paginatedTable.getPageCount();
  const size = paginatedTable.state.pagination.pageSize;
  const sizes = Array.from(new Set([size, ...pageSizes])).sort((a, b) => a - b);
  return <div data-slot="data-table-pagination" className="flex flex-wrap items-center justify-between gap-3 text-sm">
    <div className="flex items-center gap-2"><label htmlFor={id} className="whitespace-nowrap text-[var(--muted-foreground)]">{labels.rowsPerPage}</label><div className="w-20 shrink-0"><Select id={id} value={size} className="h-9" onChange={event => paginatedTable.setPageSize(Number(event.target.value))}>{sizes.map(value => <SelectItem key={value} value={value}>{value}</SelectItem>)}</Select></div></div>
    <div className="flex flex-wrap items-center gap-3"><span aria-live="polite" className="tabular-nums text-[var(--muted-foreground)]">{labels.page(count ? paginatedTable.state.pagination.pageIndex + 1 : 0, count)}</span><Button size="sm" disabled={!paginatedTable.getCanPreviousPage()} onClick={() => paginatedTable.previousPage()}>{labels.previous}</Button><Button size="sm" disabled={!paginatedTable.getCanNextPage()} onClick={() => paginatedTable.nextPage()}>{labels.next}</Button></div>
  </div>;
}

export { DataTable, DataTableColumnHeader, DataTablePagination };
export type { DataTableProps, PaginationLabels };
