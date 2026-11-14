import type { FilterGroup, SalaryRangeValue, SortId } from './types'

/**
 * Sidebar sections render from this config — adding a filter group is one
 * object here. Option values must match the Job field the group filters on
 * (see jobMatchesOption in job-page.tsx for the field mapping).
 */
export const FILTER_GROUPS: FilterGroup[] = [
  {
    id: 'jobType',
    label: 'Job type',
    options: [
      { value: 'Full-time', label: 'Full-time' },
      { value: 'Part-time', label: 'Part-time' },
      { value: 'Contract', label: 'Contract' },
      { value: 'Internship', label: 'Internship' },
      { value: 'Freelance', label: 'Freelance' },
      // Not an employment type — matches the job's work mode (Remote).
      { value: 'Remote', label: 'Remote' },
    ],
  },
  {
    id: 'workMode',
    label: 'Work mode',
    options: [
      { value: 'Remote', label: 'Remote' },
      { value: 'Hybrid', label: 'Hybrid' },
      { value: 'On-site', label: 'On-site' },
    ],
  },
  {
    id: 'level',
    label: 'Experience level',
    options: [
      { value: 'Entry Level', label: 'Entry Level · 0–1 yr' },
      { value: 'Junior', label: 'Junior · 1–3 yrs' },
      { value: 'Mid Level', label: 'Mid Level · 3–5 yrs' },
      { value: 'Senior', label: 'Senior · 5–8 yrs' },
      { value: 'Lead', label: 'Lead · 8+ yrs' },
      { value: 'Executive', label: 'Executive · C-level' },
    ],
  },
]

/** Salary slider bounds, in $k. */
export const SALARY_BOUNDS = { min: 0, max: 500 } as const

export const DEFAULT_SALARY: SalaryRangeValue = [SALARY_BOUNDS.min, SALARY_BOUNDS.max]

export const SORT_OPTIONS: { value: SortId; label: string }[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'salary-high', label: 'Salary: high → low' },
  { value: 'salary-low', label: 'Salary: low → high' },
  { value: 'most-applied', label: 'Most applied' },
]
