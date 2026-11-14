import * as React from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Bookmark02Icon, Location01Icon } from '@hugeicons/core-free-icons'
import { Link, useNavigate } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TakaMark } from '@/features/user/jobs/components/currency'
import { Card } from '@/components/ui/card'
import { JOBS } from '@/features/user/jobs/data/jobs'
import type { EmploymentType, Job } from '@/features/user/jobs/data/types'
import { cn } from '@/lib/utils'

/** Newest three roles — stands in for a "featured" flag until the service exists. */
const FEATURED = [...JOBS].toSorted((a, b) => a.postedDaysAgo - b.postedDaysAgo).slice(0, 3)

const TYPE_VARIANT: Record<EmploymentType, 'primary' | 'success' | 'soft'> = {
  'Full-time': 'primary',
  'Part-time': 'success',
  Contract: 'soft',
  Internship: 'soft',
  Freelance: 'soft',
}

function companyInitials(company: string) {
  return company
    .split(/\s+/)
    .filter((word) => /[a-z0-9]/i.test(word[0]))
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('')
}

function BookmarkButton({ saved, onToggle }: { saved: boolean; onToggle: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-pressed={saved}
      aria-label={saved ? 'Remove from saved jobs' : 'Save job'}
      onClick={onToggle}
    >
      <HugeiconsIcon
        icon={Bookmark02Icon}
        strokeWidth={1.8}
        aria-hidden="true"
        className={cn(saved && 'text-[var(--neu-accent-ink)]')}
      />
    </Button>
  )
}

/** Compact card per the reference: title, type + salary, company, applicants, actions. */
function FeaturedCard({ job }: { job: Job }) {
  const navigate = useNavigate()
  const [saved, setSaved] = React.useState(false)

  return (
    <Card variant="raised" className="flex flex-col gap-3.5 p-5 transition-shadow hover:shadow-[var(--neu-shadow-raised)]">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold leading-snug tracking-tight text-[var(--foreground)]">{job.title}</h3>
        <BookmarkButton saved={saved} onToggle={() => setSaved((current) => !current)} />
      </div>

      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
        <Badge variant={TYPE_VARIANT[job.employmentType]} className="uppercase">
          {job.employmentType}
        </Badge>
        <span className="inline-flex items-center gap-1 text-sm tabular-nums text-[var(--muted-foreground)]">
          Salary: <TakaMark className="text-[15px] font-semibold text-[var(--foreground)]" /> {job.salaryLabel}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex size-10 shrink-0 items-center justify-center rounded-[14px] bg-[var(--neu-surface)] [background-image:var(--neu-fill-inset)] text-xs font-bold text-[var(--neu-accent-ink)] shadow-[var(--neu-shadow-inset)]"
        >
          {companyInitials(job.company)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[var(--foreground)]">{job.company}</p>
          <p className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
            <HugeiconsIcon icon={Location01Icon} strokeWidth={1.8} aria-hidden="true" className="size-3.5" />
            {job.location}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <div aria-hidden="true" className="flex">
          {['AL', 'MJ', 'RS'].map((initials, index) => (
            <span
              key={initials}
              className={cn(
                'flex size-6 items-center justify-center rounded-full bg-[var(--neu-surface-soft)] text-[9px] font-bold text-[var(--muted-foreground)] ring-2 ring-[var(--card)]',
                index > 0 && '-ml-1.5',
              )}
            >
              {initials}
            </span>
          ))}
        </div>
        <span className="text-xs text-[var(--muted-foreground)]">
          {job.applicants > 0 ? `${job.applicants}+ applicants` : 'Be the first to apply'}
        </span>
      </div>

      {/* Job details exist (/jobs/:id); the application flow doesn't yet —
          both actions land on the posting for now. */}
      <div className="mt-auto grid grid-cols-2 gap-3 pt-1.5">
        {/* Same raised fill as the card face, so it gets a darker step of its
            own to read as a control, not a card patch. */}
        <Button
          variant="default"
          className="bg-[#a0a8b5] [background-image:none] text-[var(--foreground)] active:bg-[#99a2b0]"
          onClick={() => navigate(`/jobs/${job.id}`)}
        >
          View details
        </Button>
        <Button
          variant="primary"
          className="[background-image:var(--neu-fill-primary)] text-[var(--primary-foreground)]"
          onClick={() => navigate(`/jobs/${job.id}`)}
        >
          Apply now
        </Button>
      </div>
    </Card>
  )
}

export function FeaturedJobs() {
  return (
    <section
      id="featured-jobs"
      aria-labelledby="featured-jobs-heading"
      className="scroll-mt-20 mx-auto w-full max-w-7xl px-4 pb-16 pt-14 md:px-6"
    >
      <div className="mx-auto max-w-2xl text-center">
        <h2 id="featured-jobs-heading" className="text-3xl font-bold tracking-tight text-[var(--foreground)] md:text-4xl">
          Featured Jobs
        </h2>
        <p className="mt-2.5 text-sm text-[var(--muted-foreground)] md:text-base">
          Choose jobs from the top employers and apply for the same.
        </p>
      </div>

      <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURED.map((job) => (
          <FeaturedCard key={job.id} job={job} />
        ))}
      </div>

      <div className="mt-9 text-center">
        <Link
          to="/jobs"
          className="text-sm font-semibold text-[var(--neu-accent-ink)] underline underline-offset-4 transition-opacity duration-[var(--neu-duration)] hover:opacity-75"
        >
          View all
        </Link>
      </div>
    </section>
  )
}
