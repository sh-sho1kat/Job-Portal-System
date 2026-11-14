import * as React from 'react'
import { useSearchParams } from 'react-router-dom'

import { SiteNavbar } from '@/components/layout/site-navbar'
import { AiHero } from './components/ai-hero'
import { FiltersPanel } from './components/filters-panel'
import { JobCard } from './components/job-card'
import { ResultsEmpty } from './components/results-empty'
import { ResultsToolbar } from './components/results-toolbar'
import { DEFAULT_SALARY, FILTER_GROUPS, SALARY_BOUNDS, SORT_OPTIONS } from './data/filters'
import { JOBS } from './data/jobs'
import type {
  ActiveFilters,
  FilterGroupId,
  Job,
  SalaryRangeValue,
  SortId,
} from './data/types'

/** Group id → Job field. 'Remote' under Job type matches the work mode. */
function jobMatchesOption(job: Job, groupId: FilterGroupId, value: string): boolean {
  if (groupId === 'jobType') {
    return value === 'Remote' ? job.workMode === 'Remote' : job.employmentType === value
  }
  if (groupId === 'workMode') return job.workMode === value
  return job.level === value
}

const comparators: Record<SortId, (a: Job, b: Job) => number> = {
  newest: (a, b) => a.postedDaysAgo - b.postedDaysAgo,
  'salary-high': (a, b) => b.salaryMax - a.salaryMax,
  'salary-low': (a, b) => a.salaryMin - b.salaryMin,
  'most-applied': (a, b) => b.applicants - a.applicants,
}

/** Static placeholders + client filtering for now; swap in the job service call here. */
export function JobPage() {
  // The landing search hands off via /jobs?q=…&l=… — read once on mount.
  const [searchParams] = useSearchParams()
  const [query, setQuery] = React.useState(() => searchParams.get('q') ?? '')
  const [location, setLocation] = React.useState(() => searchParams.get('l') ?? '')
  const [aiQuery, setAiQuery] = React.useState('')
  const [selected, setSelected] = React.useState<ActiveFilters>({})
  const [salary, setSalary] = React.useState<SalaryRangeValue>(DEFAULT_SALARY)
  const [sort, setSort] = React.useState<SortId>(SORT_OPTIONS[0].value)

  const toggleFilter = React.useCallback((groupId: FilterGroupId, value: string) => {
    setSelected((current) => {
      const chosen = current[groupId] ?? []
      const next = chosen.includes(value) ? chosen.filter((item) => item !== value) : [...chosen, value]
      const updated = { ...current }
      if (next.length > 0) updated[groupId] = next
      else delete updated[groupId]
      return updated
    })
  }, [])

  const clearFilters = React.useCallback(() => {
    setSelected({})
    setSalary(DEFAULT_SALARY)
  }, [])

  const clearAll = React.useCallback(() => {
    clearFilters()
    setQuery('')
    setLocation('')
    setAiQuery('')
  }, [clearFilters])

  const applyAiSearch = React.useCallback(() => setQuery(aiQuery.trim()), [aiQuery])

  const filterCount =
    Object.values(selected).reduce((sum, values) => sum + values.length, 0) +
    (salary[0] !== SALARY_BOUNDS.min || salary[1] !== SALARY_BOUNDS.max ? 1 : 0)

  const filteredJobs = React.useMemo(() => {
    const needle = query.trim().toLowerCase()
    const where = location.trim().toLowerCase()

    return JOBS.filter((job) => {
      if (needle) {
        // workMode so a "remote" search finds remote roles.
        const haystack = [
          job.title,
          job.company,
          job.industry,
          job.category,
          job.workMode,
          job.tagline ?? '',
          ...job.skills,
        ]
        if (!haystack.some((text) => text.toLowerCase().includes(needle))) return false
      }
      if (where && !job.location.toLowerCase().includes(where)) return false
      const matchesGroups = FILTER_GROUPS.every((group) => {
        const chosen = selected[group.id]
        return !chosen?.length || chosen.some((value) => jobMatchesOption(job, group.id, value))
      })
      if (!matchesGroups) return false
      const [minK, maxK] = salary
      return job.salaryMax >= minK * 1000 && job.salaryMin <= maxK * 1000
    }).toSorted(comparators[sort])
  }, [query, location, selected, salary, sort])

  return (
    <div className="min-h-dvh">
      <SiteNavbar
        query={query}
        location={location}
        onQueryChange={setQuery}
        onLocationChange={setLocation}
      />
      <AiHero value={aiQuery} onValueChange={setAiQuery} onSubmit={applyAiSearch} />
      <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-6 md:px-6">
        <ResultsToolbar
          resultCount={filteredJobs.length}
          query={query}
          filterCount={filterCount}
          onClearFilters={clearFilters}
          sort={sort}
          onSortChange={setSort}
        />
        <div className="mt-4 grid items-start gap-6 lg:grid-cols-[16.5rem_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-24">
            <FiltersPanel
              groups={FILTER_GROUPS}
              selected={selected}
              onToggle={toggleFilter}
              salary={salary}
              onSalaryChange={setSalary}
              hasActive={filterCount > 0}
              onClearAll={clearFilters}
            />
          </aside>
          <section aria-label="Job listings" className="flex min-w-0 flex-col gap-4">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => <JobCard key={job.id} job={job} />)
            ) : (
              <ResultsEmpty onReset={clearAll} />
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
