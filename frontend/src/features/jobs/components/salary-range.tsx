import type { SalaryRangeValue } from '../data/types'

interface SalaryRangeProps {
  value: SalaryRangeValue
  bounds: { min: number; max: number }
  onChange: (value: SalaryRangeValue) => void
}

/* One native range input per thumb, stacked over a custom track. The inputs
   are pointer-events:none so the track stays visible; only the thumbs take
   clicks (restored on the pseudo-elements). */
const rangeInputClasses = [
  'pointer-events-none absolute inset-0 h-5 w-full appearance-none bg-transparent',
  '[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none',
  '[&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-0',
  '[&::-webkit-slider-thumb]:bg-[var(--neu-accent-ink)] [&::-webkit-slider-thumb]:shadow-[0_0_0_2px_var(--neu-surface)]',
  '[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none',
  '[&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0',
  '[&::-moz-range-thumb]:bg-[var(--neu-accent-ink)] [&::-moz-range-thumb]:shadow-[0_0_0_2px_var(--neu-surface)]',
  '[&::-webkit-slider-runnable-track]:bg-transparent [&::-moz-range-track]:bg-transparent',
].join(' ')

/** Dual-thumb salary slider — values and bounds in $k. */
export function SalaryRange({ value, bounds, onChange }: SalaryRangeProps) {
  const [minK, maxK] = value
  const span = bounds.max - bounds.min
  const leftPct = ((minK - bounds.min) / span) * 100
  const rightPct = ((maxK - bounds.min) / span) * 100

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
          Salary range
        </span>
        <span className="text-sm font-semibold tabular-nums text-[var(--foreground)]">
          ${minK}k - ${maxK}k
        </span>
      </div>
      <div className="relative h-5">
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[var(--neu-surface)] [background-image:var(--neu-fill-inset)] shadow-[var(--neu-shadow-inset-sm)]"
        />
        <span
          aria-hidden="true"
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[var(--neu-accent-ink)]"
          style={{ left: `${leftPct}%`, width: `${Math.max(rightPct - leftPct, 0)}%` }}
        />
        <input
          type="range"
          min={bounds.min}
          max={bounds.max}
          step={5}
          value={minK}
          onChange={(event) => onChange([Math.min(Number(event.target.value), maxK), maxK])}
          aria-label="Minimum salary"
          className={rangeInputClasses}
        />
        <input
          type="range"
          min={bounds.min}
          max={bounds.max}
          step={5}
          value={maxK}
          onChange={(event) => onChange([minK, Math.max(Number(event.target.value), minK)])}
          aria-label="Maximum salary"
          className={rangeInputClasses}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
        <span>${bounds.min}</span>
        <span>${bounds.max}k+</span>
      </div>
    </div>
  )
}
