import * as React from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Bookmark02Icon,
  Briefcase01Icon,
  CheckmarkBadge04Icon,
  Clock01Icon,
  Location01Icon,
  UserMultipleIcon,
} from '@hugeicons/core-free-icons'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { TakaMark } from './currency'
import { cn } from '@/lib/utils'
import type { Job } from '../data/types'

function companyInitials(company: string) {
  return company
    .split(/\s+/)
    .filter((word) => /[a-z0-9]/i.test(word[0]))
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('')
}

/** Listing card: logo plate, title block, meta row, badges, applicants footer. */
export function JobCard({ job }: { job: Job }) {
  const [saved, setSaved] = React.useState(false)

  return (
    <Card variant="raised" className="relative p-0 transition-shadow hover:shadow-[var(--neu-shadow-raised)]">
      {/* Stretched link — the whole card navigates to the detail page; the
          save button sits above it (z-10) and keeps its own click. */}
      <Link
        to={`/jobs/${job.id}`}
        aria-label={`View ${job.title} at ${job.company}`}
        className="absolute inset-0 z-0 rounded-[var(--neu-radius-surface)] focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)]"
      />
      <div className="flex flex-col gap-3.5 p-5 md:p-6">
        <div className="flex items-start gap-4">
          <span
            aria-hidden="true"
            className="flex size-14 shrink-0 items-center justify-center rounded-[14px] bg-[var(--neu-surface)] [background-image:var(--neu-fill-inset)] text-sm font-bold text-[var(--neu-accent-ink)] shadow-[var(--neu-shadow-inset)]"
          >
            {companyInitials(job.company)}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h3 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">{job.title}</h3>
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm">
              <span className="font-semibold text-[var(--foreground)]">{job.company}</span>
              {job.verified && (
                <HugeiconsIcon
                  icon={CheckmarkBadge04Icon}
                  strokeWidth={1.8}
                  role="img"
                  aria-label="Verified company"
                  className="size-4 text-[var(--neu-accent-ink)]"
                />
              )}
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              {job.industry} · {job.companySize} company
            </p>
            {job.tagline && (
              <p className="text-[13px] leading-relaxed text-[var(--muted-foreground)]">{job.tagline}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-pressed={saved}
            aria-label={saved ? 'Remove from saved jobs' : 'Save job'}
            onClick={() => setSaved((current) => !current)}
            className="relative z-10"
          >
            <HugeiconsIcon
              icon={Bookmark02Icon}
              strokeWidth={1.8}
              aria-hidden="true"
              className={cn(saved && 'text-[var(--neu-accent-ink)]')}
            />
          </Button>
        </div>

        <ul className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[13px] text-[var(--muted-foreground)]">
          <li className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <HugeiconsIcon icon={Location01Icon} strokeWidth={1.8} aria-hidden="true" className="size-4" />
            {job.location}
          </li>
          <li className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <HugeiconsIcon icon={Briefcase01Icon} strokeWidth={1.8} aria-hidden="true" className="size-4" />
            {job.employmentType}
          </li>
          <li className="inline-flex items-center gap-1.5 whitespace-nowrap font-medium tabular-nums text-[var(--foreground)]">
            <TakaMark className="text-[15px]" />
            {job.salaryLabel}
          </li>
          <li className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <HugeiconsIcon icon={Clock01Icon} strokeWidth={1.8} aria-hidden="true" className="size-4" />
            {job.postedLabel}
          </li>
        </ul>

        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="success" className="rounded-full px-3 py-1 uppercase">
            Open
          </Badge>
          {[job.workMode, job.level, job.category, ...job.skills].map((label) => (
            <Badge key={label} variant="soft" className="rounded-full px-3 py-1">
              {label}
            </Badge>
          ))}
        </div>

        <Separator />

        <p className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[13px] tabular-nums text-[var(--muted-foreground)]">
          <HugeiconsIcon icon={UserMultipleIcon} strokeWidth={1.8} aria-hidden="true" className="size-4" />
          {job.applicants} applicant{job.applicants === 1 ? '' : 's'}
          <span aria-hidden="true">·</span>
          {job.openings} opening{job.openings === 1 ? '' : 's'}
        </p>
      </div>
    </Card>
  )
}
