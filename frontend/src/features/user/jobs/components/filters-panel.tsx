import * as React from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { PreferenceHorizontalIcon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { SALARY_BOUNDS } from '../data/filters'
import type { ActiveFilters, FilterGroup, FilterGroupId, SalaryRangeValue } from '../data/types'
import { SalaryRange } from './salary-range'

interface FiltersPanelProps {
  groups: FilterGroup[]
  selected: ActiveFilters
  onToggle: (groupId: FilterGroupId, value: string) => void
  salary: SalaryRangeValue
  onSalaryChange: (value: SalaryRangeValue) => void
  hasActive: boolean
  onClearAll: () => void
}

/** Sidebar card: checkbox groups + salary range, rendered from config. */
export function FiltersPanel({
  groups,
  selected,
  onToggle,
  salary,
  onSalaryChange,
  hasActive,
  onClearAll,
}: FiltersPanelProps) {
  return (
    <Card variant="raised" className="p-0">
      <div className="flex flex-col gap-4 p-5 md:p-6">
        <div className="flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-base font-semibold tracking-tight text-[var(--foreground)]">
            <HugeiconsIcon
              icon={PreferenceHorizontalIcon}
              strokeWidth={1.8}
              aria-hidden="true"
              className="size-4.5 text-[var(--muted-foreground)]"
            />
            Filters
          </h2>
          {hasActive && (
            <Button variant="ghost" size="sm" onClick={onClearAll}>
              Clear all
            </Button>
          )}
        </div>
        {groups.map((group, groupIndex) => (
          <React.Fragment key={group.id}>
            {groupIndex > 0 && <Separator />}
            <fieldset className="m-0 border-0 p-0">
              <legend className="pb-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                {group.label}
              </legend>
              <div className="flex flex-col gap-2.5">
                {group.options.map((option, optionIndex) => {
                  const optionId = `filter-${group.id}-${optionIndex}`
                  return (
                    <label
                      key={option.value}
                      htmlFor={optionId}
                      className="flex cursor-pointer items-center gap-2.5 text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
                    >
                      <Checkbox
                        id={optionId}
                        checked={selected[group.id]?.includes(option.value) ?? false}
                        onCheckedChange={() => onToggle(group.id, option.value)}
                      />
                      {option.label}
                    </label>
                  )
                })}
              </div>
            </fieldset>
          </React.Fragment>
        ))}
        <Separator />
        <SalaryRange value={salary} bounds={SALARY_BOUNDS} onChange={onSalaryChange} />
      </div>
    </Card>
  )
}
