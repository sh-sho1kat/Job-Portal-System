import { HugeiconsIcon } from '@hugeicons/react'
import { Bookmark02Icon } from '@hugeicons/core-free-icons'
import * as React from 'react'
import { Link } from 'react-router'

import { SiteNavbar } from '@/components/layout/site-navbar'
import { buttonClassName } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { JobCard } from '@/features/user/jobs/components/job-card'
import { JOBS } from '@/features/user/jobs/data/jobs'
import { removeSavedJob, useSavedJobIds } from './data'

/**
 * Saved jobs — the candidate's bookmarked listings, reached from the
 * navbar's "Saved jobs" link. Each card is the standard listing card; the
 * trash control pulls the bookmark (reversible — the bookmark toggle on
 * the jobs page restores it). Data is the shared demo jobs dataset; the
 * saved-jobs store is the seam for the backend's user-preference bookmark
 * list.
 */
export function SavedJobsPage() {
  const [query, setQuery] = React.useState('')
  const [location, setLocation] = React.useState('')
  const savedIds = useSavedJobIds()
  const savedJobs = JOBS.filter((job) => savedIds.includes(job.id))

  return (
    <div className="min-h-dvh">
      <SiteNavbar query={query} location={location} onQueryChange={setQuery} onLocationChange={setLocation} />

      <main className="mx-auto w-full max-w-4xl px-4 pb-16 pt-8 md:px-6">
        <header>
          <h1 className="text-[22px] font-bold tracking-tight text-[var(--foreground)]">Saved jobs</h1>
          <p className="mt-1 text-sm leading-relaxed text-[var(--muted-foreground)]">
            {savedJobs.length > 0
              ? `${savedJobs.length} listing${savedJobs.length === 1 ? '' : 's'} kept for later.`
              : 'Bookmarked listings, kept until you are ready to apply.'}
          </p>
        </header>

        {savedJobs.length > 0 ? (
          <div className="mt-6 flex flex-col gap-4">
            {savedJobs.map((job) => (
              <JobCard key={job.id} job={job} onDelete={() => removeSavedJob(job.id)} />
            ))}
          </div>
        ) : (
          <Card variant="raised" className="mt-6 items-center gap-2 px-6 py-12 text-center">
            <HugeiconsIcon
              icon={Bookmark02Icon}
              strokeWidth={1.5}
              aria-hidden="true"
              className="size-8 text-[var(--muted-foreground)]"
            />
            <p className="text-sm font-medium text-[var(--foreground)]">No saved jobs yet</p>
            <p className="max-w-xs text-sm text-[var(--muted-foreground)]">
              Tap the bookmark on any listing to keep it here for later.
            </p>
            <Link to="/jobs" className={buttonClassName({ variant: 'soft' })}>
              Browse jobs
            </Link>
          </Card>
        )}
      </main>
    </div>
  )
}
