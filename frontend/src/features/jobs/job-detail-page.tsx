import * as React from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Bookmark02Icon,
  Briefcase01Icon,
  CheckmarkBadge04Icon,
  ChevronLeftIcon,
  Clock01Icon,
  DollarSignIcon,
  EyeIcon,
  Location01Icon,
  Share01Icon,
  TickIcon,
  UserMultipleIcon,
} from '@hugeicons/core-free-icons'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import type { EmploymentType, Job } from './data/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { SiteNavbar } from '@/components/layout/site-navbar'
import { cn } from '@/lib/utils'
import { AiSkillMatch } from './components/ai-skill-match'
import { JOBS } from './data/jobs'

const TYPE_VARIANT: Record<EmploymentType, 'primary' | 'success' | 'soft'> = {
  'Full-time': 'primary',
  'Part-time': 'success',
  Contract: 'soft',
  Internship: 'soft',
  Freelance: 'soft',
}

const PERIOD_SUFFIX: Record<string, string> = {
  Hourly: 'an hour',
  Monthly: 'a month',
  Yearly: 'a year',
}

function companyInitials(company: string) {
  return company
    .split(/\s+/)
    .filter((word) => /[a-z0-9]/i.test(word[0]))
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('')
}

/** "2026-12-15" → "Dec 15, 2026" (UTC-pinned so the static data stays honest). */
function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${iso}T00:00:00Z`))
}

/** Structured location when the DTO fields are present, card label otherwise. */
function fullLocation(job: Job) {
  const parts = [job.address, job.city, job.state, job.country].filter(Boolean)
  return parts.length > 0 ? parts.join(', ') : job.location
}

/** Two address lines like a mailing block: street, then "City, State, Country - Zip". */
function locationLines(job: Job) {
  const second = [job.city, job.state, job.country].filter(Boolean).join(', ')
  const withZip = job.zipCode ? `${second} - ${job.zipCode}` : second
  return [job.address ?? (withZip ? undefined : 'Remote'), withZip].filter(Boolean)
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="mt-3.5 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-[var(--muted-foreground)]">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card variant="raised" className="p-5 md:p-6">
      <h2 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">{title}</h2>
      {children}
    </Card>
  )
}

function OverviewRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <>
      <div className="flex items-center justify-between gap-4 py-2.5 text-sm">
        <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
        <dd className="text-right font-medium text-[var(--foreground)]">{value}</dd>
      </div>
      <Separator />
    </>
  )
}

/** Public job posting — mirrors the backend's JobResponse DTO fields.
 *  Left column: the posting itself plus the AI skills-gap band. Right
 *  column: apply actions, overview, tags, and the mailing-block address. */
export function JobDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [query, setQuery] = React.useState('')
  const [location, setLocation] = React.useState('')
  const [saved, setSaved] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  // Navbar search has no live results here — submit hands off to /jobs.
  const searchJobs = React.useCallback(
    (nextQuery: string, nextLocation: string) => {
      const params = new URLSearchParams()
      if (nextQuery.trim()) params.set('q', nextQuery.trim())
      if (nextLocation.trim()) params.set('l', nextLocation.trim())
      navigate(params.size > 0 ? `/jobs?${params.toString()}` : '/jobs')
    },
    [navigate],
  )

  const copyLink = React.useCallback(() => {
    navigator.clipboard?.writeText(window.location.href).then(
      () => {
        setCopied(true)
        window.setTimeout(() => setCopied(false), 2000)
      },
      () => {},
    )
  }, [])

  const job = JOBS.find((candidate) => candidate.id === id)

  if (!job) {
    return (
      <div className="min-h-dvh">
        <SiteNavbar
          query={query}
          location={location}
          onQueryChange={setQuery}
          onLocationChange={setLocation}
          onSearch={searchJobs}
        />
        <main className="mx-auto w-full max-w-7xl px-4 pb-24 pt-20 text-center md:px-6">
          <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">Job not found</h1>
          <p className="mx-auto mt-2.5 max-w-md text-sm text-[var(--muted-foreground)] md:text-base">
            This posting may have been closed or removed. The listing page has
            everything that is still open.
          </p>
          <Link
            to="/jobs"
            className="mt-5 inline-block text-sm font-semibold text-[var(--neu-accent-ink)] underline underline-offset-4 transition-opacity duration-[var(--neu-duration)] hover:opacity-75"
          >
            Back to all jobs
          </Link>
        </main>
      </div>
    )
  }

  const deadline = job.applicationDeadline ? formatDate(job.applicationDeadline) : undefined
  const addressLines = locationLines(job)

  return (
    <div className="min-h-dvh">
      <SiteNavbar
        query={query}
        location={location}
        onQueryChange={setQuery}
        onLocationChange={setLocation}
        onSearch={searchJobs}
      />

      <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-6 md:px-6">
        <Link
          to="/jobs"
          className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--neu-accent-ink)] transition-opacity duration-[var(--neu-duration)] hover:opacity-75"
        >
          <HugeiconsIcon icon={ChevronLeftIcon} strokeWidth={2} aria-hidden="true" className="size-4" />
          Back to all jobs
        </Link>

        <div className="mt-4 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_25rem]">
          <div className="flex min-w-0 flex-col gap-4">
            {/* Header card — identity, badges, meta. Actions live in the sidebar. */}
            <Card variant="raised" className="p-5 md:p-6">
              <div className="flex items-start gap-4">
                <span
                  aria-hidden="true"
                  className="flex size-14 shrink-0 items-center justify-center rounded-[14px] bg-[var(--neu-surface)] [background-image:var(--neu-fill-inset)] text-sm font-bold text-[var(--neu-accent-ink)] shadow-[var(--neu-shadow-inset)]"
                >
                  {companyInitials(job.company)}
                </span>
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] md:text-3xl">
                    {job.title}
                  </h1>
                  <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm">
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
                    <span aria-hidden="true">·</span>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                      {job.industry} · {job.companySize} company
                    </span>
                  </p>
                </div>
                <Badge variant={TYPE_VARIANT[job.employmentType]} className="hidden uppercase sm:inline-flex">
                  {job.employmentType}
                </Badge>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                <Badge variant="success" className="rounded-full px-3 py-1 uppercase">
                  Open
                </Badge>
                <Badge variant={TYPE_VARIANT[job.employmentType]} className="rounded-full uppercase sm:hidden">
                  {job.employmentType}
                </Badge>
                <Badge variant="soft" className="rounded-full px-3 py-1">
                  {job.workMode}
                </Badge>
                <Badge variant="soft" className="rounded-full px-3 py-1">
                  {job.level}
                </Badge>
                <Badge variant="soft" className="rounded-full px-3 py-1">
                  {job.category}
                </Badge>
                {job.skills.map((skill) => (
                  <Badge key={skill} variant="soft" className="rounded-full px-3 py-1">
                    {skill}
                  </Badge>
                ))}
              </div>

              <ul className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[13px] text-[var(--muted-foreground)]">
                <li className="inline-flex items-center gap-1.5 whitespace-nowrap">
                  <HugeiconsIcon icon={Location01Icon} strokeWidth={1.8} aria-hidden="true" className="size-4" />
                  {fullLocation(job)}
                </li>
                <li className="inline-flex items-center gap-1.5 whitespace-nowrap">
                  <HugeiconsIcon icon={Briefcase01Icon} strokeWidth={1.8} aria-hidden="true" className="size-4" />
                  {job.employmentType}
                </li>
                <li className="inline-flex items-center gap-1.5 whitespace-nowrap font-medium tabular-nums text-[var(--foreground)]">
                  <HugeiconsIcon icon={DollarSignIcon} strokeWidth={1.8} aria-hidden="true" className="size-4" />
                  {job.salaryLabel}
                  <span className="font-normal text-[var(--muted-foreground)]">
                    {PERIOD_SUFFIX[job.salaryPeriod ?? 'Yearly']}
                  </span>
                </li>
                <li className="inline-flex items-center gap-1.5 whitespace-nowrap">
                  <HugeiconsIcon icon={Clock01Icon} strokeWidth={1.8} aria-hidden="true" className="size-4" />
                  {job.postedLabel}
                </li>
              </ul>
            </Card>

            <AiSkillMatch job={job} />

            {job.description && (
              <Section title="About the role">
                <p className="mt-3.5 text-sm leading-relaxed text-[var(--muted-foreground)]">{job.description}</p>
              </Section>
            )}

            {job.responsibilities && job.responsibilities.length > 0 && (
              <Section title="Responsibilities">
                <Bullets items={job.responsibilities} />
              </Section>
            )}

            {job.requirements && job.requirements.length > 0 && (
              <Section title="Requirements">
                <Bullets items={job.requirements} />
              </Section>
            )}

            {job.benefits && job.benefits.length > 0 && (
              <Section title="Benefits">
                <Bullets items={job.benefits} />
              </Section>
            )}
          </div>

          <aside className="flex flex-col gap-4 lg:sticky lg:top-24">
            {/* Actions + overview in one card: apply, then the key facts. */}
            {/* The application service isn't wired yet — the button is the
                seam until it exists. */}
            <Card variant="raised" className="p-5 md:p-6">
              <div className="flex flex-col gap-2.5">
                <Button
                  variant="primary"
                  onClick={() => navigate(`/jobs/${job.id}/apply`)}
                  className="h-11 w-full text-[15px] [background-image:var(--neu-fill-primary)] text-[var(--primary-foreground)]"
                >
                  Apply now
                </Button>
                {/* Carved-in wells (same treatment as inputs) so both read as
                    real controls on the page surface — --neu-edge is
                    transparent in light mode, so borders can't carry them.
                    Hover keeps the soft fill-in they had as ghost buttons. */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    aria-pressed={saved}
                    aria-label={saved ? 'Remove from saved jobs' : 'Save job'}
                    onClick={() => setSaved((current) => !current)}
                    className="h-10 flex-1 bg-[var(--neu-surface)] [background-image:var(--neu-fill-inset)] shadow-[var(--neu-shadow-inset)] hover:bg-[var(--neu-surface-soft)] hover:[background-image:none] hover:shadow-none"
                  >
                    <HugeiconsIcon
                      icon={Bookmark02Icon}
                      strokeWidth={1.8}
                      aria-hidden="true"
                      className={cn('size-4.5', saved && 'text-[var(--neu-accent-ink)]')}
                    />
                    {saved ? 'Saved' : 'Save job'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={copied ? 'Link copied' : 'Copy link to this job'}
                    onClick={copyLink}
                    className="size-10 bg-[var(--neu-surface)] [background-image:var(--neu-fill-inset)] shadow-[var(--neu-shadow-inset)] hover:bg-[var(--neu-surface-soft)] hover:[background-image:none] hover:shadow-none"
                  >
                    <HugeiconsIcon
                      icon={copied ? TickIcon : Share01Icon}
                      strokeWidth={1.8}
                      aria-hidden="true"
                      className={cn('size-4.5', copied && 'text-[var(--neu-accent-ink)]')}
                    />
                  </Button>
                </div>
              </div>

              <Separator />

              <dl>
                <OverviewRow label="Job type" value={job.employmentType} />
                <OverviewRow label="Work mode" value={job.workMode} />
                <OverviewRow label="Experience" value={job.level} />
                <OverviewRow
                  label="Salary"
                  value={
                    <span className="tabular-nums">
                      {job.salaryLabel} {PERIOD_SUFFIX[job.salaryPeriod ?? 'Yearly']}
                    </span>
                  }
                />
                <OverviewRow label="Openings" value={job.openings} />
                {deadline && <OverviewRow label="Deadline" value={deadline} />}
                <OverviewRow label="Posted" value={job.postedLabel} />
              </dl>

              <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs tabular-nums text-[var(--muted-foreground)]">
                <span className="inline-flex items-center gap-1">
                  <HugeiconsIcon icon={UserMultipleIcon} strokeWidth={1.8} aria-hidden="true" className="size-3.5" />
                  {job.applicants} applicant{job.applicants === 1 ? '' : 's'}
                </span>
                <span className="inline-flex items-center gap-1">
                  <HugeiconsIcon icon={EyeIcon} strokeWidth={1.8} aria-hidden="true" className="size-3.5" />
                  {job.views ?? 0} views
                </span>
              </p>
            </Card>

            {job.tags && job.tags.length > 0 && (
              <Card variant="raised" className="p-5 md:p-6">
                <h2 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">Tags</h2>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {job.tags.map((tag) => (
                    <Badge key={tag} variant="soft" className="rounded-full px-3 py-1">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}

            <Card variant="raised" className="p-5 md:p-6">
              <h2 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">Location details</h2>
              <address className="mt-3 flex flex-col gap-1 text-sm not-italic leading-relaxed text-[var(--muted-foreground)]">
                {addressLines.map((line) => (
                  <span key={line} className="inline-flex items-center gap-1.5">
                    <HugeiconsIcon icon={Location01Icon} strokeWidth={1.8} aria-hidden="true" className="size-4 shrink-0" />
                    {line}
                  </span>
                ))}
              </address>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  )
}
