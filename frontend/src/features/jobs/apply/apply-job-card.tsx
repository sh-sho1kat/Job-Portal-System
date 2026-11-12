import { HugeiconsIcon } from '@hugeicons/react'
import {
  CheckmarkBadge04Icon,
  Clock01Icon,
  DollarSignIcon,
  Location01Icon,
  UserMultipleIcon,
} from '@hugeicons/core-free-icons'
import type { IconSvgElement } from '@hugeicons/react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { Job } from '../data/types'

/** Detail page's formatting rules, kept identical so the two agree. */
function companyInitials(company: string) {
  return company
    .split(/\s+/)
    .filter((word) => /[a-z0-9]/i.test(word[0]))
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('')
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${iso}T00:00:00Z`))
}

function MetaItem({ icon, children }: { icon: IconSvgElement; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[13px] text-[var(--muted-foreground)]">
      <HugeiconsIcon icon={icon} strokeWidth={1.8} aria-hidden="true" className="size-4 shrink-0" />
      {children}
    </span>
  )
}

/**
 * Full-width header card: the posting you're applying to. The title doubles
 * as the page h1 — one identity block, no separate heading above it.
 */
export function ApplyJobCard({ job }: { job: Job }) {
  return (
    <Card variant="raised" className="p-5 md:p-6">
      <div className="flex items-start gap-4">
        <span
          aria-hidden="true"
          className="flex size-12 shrink-0 items-center justify-center rounded-[var(--neu-radius-surface)] bg-[var(--neu-surface)] [background-image:var(--neu-fill-inset)] text-sm font-bold text-[var(--neu-accent-ink)] shadow-[var(--neu-shadow-inset)]"
        >
          {companyInitials(job.company)}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)] md:text-2xl">
            {job.title}
          </h1>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-[var(--muted-foreground)]">
            <span className="font-semibold text-[var(--foreground)]">{job.company}</span>
            {job.verified && (
              <HugeiconsIcon
                icon={CheckmarkBadge04Icon}
                strokeWidth={1.8}
                role="img"
                aria-label="Verified company"
                className="size-4 shrink-0 text-[var(--neu-accent-ink)]"
              />
            )}
          </p>
        </div>
        <div className="hidden shrink-0 flex-wrap justify-end gap-1.5 sm:flex">
          <Badge variant="soft" className="rounded-full px-3 py-1">
            {job.workMode}
          </Badge>
          <Badge variant="soft" className="rounded-full px-3 py-1">
            {job.employmentType}
          </Badge>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5 sm:hidden">
        <Badge variant="soft" className="rounded-full px-3 py-1">
          {job.workMode}
        </Badge>
        <Badge variant="soft" className="rounded-full px-3 py-1">
          {job.employmentType}
        </Badge>
      </div>

      <Separator className="my-4" />

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <MetaItem icon={Location01Icon}>{job.location}</MetaItem>
        <MetaItem icon={DollarSignIcon}>
          <span className="font-medium tabular-nums text-[var(--foreground)]">{job.salaryLabel}</span>
          <span>{job.salaryPeriod === 'Monthly' ? 'a month' : job.salaryPeriod === 'Hourly' ? 'an hour' : 'a year'}</span>
        </MetaItem>
        {job.applicationDeadline && (
          <MetaItem icon={Clock01Icon}>
            Apply by <span className="font-medium text-[var(--foreground)]">{formatDate(job.applicationDeadline)}</span>
          </MetaItem>
        )}
        <MetaItem icon={UserMultipleIcon}>
          {job.applicants} applicant{job.applicants === 1 ? '' : 's'}
        </MetaItem>
      </div>
    </Card>
  )
}
