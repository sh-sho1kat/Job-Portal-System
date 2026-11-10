import { HugeiconsIcon } from '@hugeicons/react'
import { Briefcase01Icon, Cancel01Icon, TrendingUpIcon } from '@hugeicons/core-free-icons'

import { Select, SelectItem } from '@/components/ui/select'
import { SORT_OPTIONS } from '../data/filters'
import type { SortId } from '../data/types'

interface ResultsToolbarProps {
  resultCount: number
  query: string
  /** Selected checkbox options + salary deviation; 0 hides the chip. */
  filterCount: number
  onClearFilters: () => void
  sort: SortId
  onSortChange: (value: SortId) => void
}

/** Count and active-filter summary on the left, sort control on the right. */
export function ResultsToolbar({
  resultCount,
  query,
  filterCount,
  onClearFilters,
  sort,
  onSortChange,
}: ResultsToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
      <div className="flex min-w-0 items-center gap-3">
        <span
          aria-hidden="true"
          className="flex size-10 shrink-0 items-center justify-center rounded-[var(--neu-radius-control)] bg-[var(--neu-surface)] [background-image:var(--neu-fill-inset)] shadow-[var(--neu-shadow-inset)]"
        >
          <HugeiconsIcon icon={Briefcase01Icon} strokeWidth={1.8} aria-hidden="true" className="size-5 text-[var(--neu-accent-ink)]" />
        </span>
        <div className="min-w-0">
          <p className="text-base font-bold tracking-tight text-[var(--foreground)]" aria-live="polite">
            {resultCount} Jobs Found
          </p>
          {query.trim() && (
            <p className="truncate text-xs text-[var(--muted-foreground)]">{query.trim()}</p>
          )}
        </div>
        {filterCount > 0 && (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[color:color-mix(in_srgb,var(--neu-accent-ink)_30%,transparent)] bg-[color-mix(in_srgb,var(--neu-accent-ink)_10%,transparent)] px-3 py-1.5 text-xs font-semibold text-[var(--neu-accent-ink)] transition-colors hover:bg-[color-mix(in_srgb,var(--neu-accent-ink)_16%,transparent)] focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)]"
          >
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} aria-hidden="true" className="size-3.5" />
            {filterCount} filter{filterCount === 1 ? '' : 's'}
          </button>
        )}
      </div>
      <div className="relative w-44 shrink-0">
        <HugeiconsIcon
          icon={TrendingUpIcon}
          strokeWidth={1.8}
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--muted-foreground)]"
        />
        <Select
          value={sort}
          onChange={(event) => onSortChange(event.target.value as SortId)}
          aria-label="Sort jobs"
          className="pl-9"
        >
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </Select>
      </div>
    </div>
  )
}
