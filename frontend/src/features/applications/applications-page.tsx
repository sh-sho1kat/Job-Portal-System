import { HugeiconsIcon } from '@hugeicons/react'
import {
  Calendar01Icon,
  File02Icon,
  Search02Icon,
  Sent02Icon,
  StarIcon,
  Tick02Icon,
} from '@hugeicons/core-free-icons'
import * as React from 'react'
import { Link } from 'react-router'

import { SiteNavbar } from '@/components/layout/site-navbar'
import { Badge } from '@/components/ui/badge'
import { Button, buttonClassName } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectItem } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { TakaMark } from '@/features/jobs/components/currency'
import { cn } from '@/lib/utils'
import type { Application, ApplicationStatus, TimelineStage } from './data'
import {
  APPLICATIONS,
  STATUS_LABEL,
  STATUS_VARIANT,
  canWithdraw,
  formatAmount,
  formatAppliedAt,
  formatAvailableFrom,
  formatUpdatedAt,
  isClosed,
  statusTimeline,
} from './data'

const STATUS_ORDER: ApplicationStatus[] = [
  'PENDING',
  'REVIEWING',
  'SHORTLISTED',
  'INTERVIEW_SCHEDULED',
  'HIRED',
  'REJECTED',
  'WITHDRAWN',
]

type Filter = 'ALL' | ApplicationStatus

function companyInitials(company: string) {
  return company
    .split(/\s+/)
    .filter((word) => /[a-z0-9]/i.test(word[0]))
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('')
}

/** One summary chip: a status filter with its live count. */
function FilterChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] transition-shadow duration-[var(--neu-duration)] motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)]',
        active
          ? '[background-image:var(--neu-fill-primary)] font-semibold text-[var(--primary-foreground)] shadow-[var(--neu-shadow-raised-sm)]'
          : 'bg-[var(--neu-surface)] font-medium text-[var(--muted-foreground)] [background-image:var(--neu-fill-raised)] shadow-[var(--neu-shadow-raised-sm)] hover:text-[var(--foreground)]',
      )}
    >
      {label}
      <span
        className={cn(
          'rounded-full px-1.5 py-0.5 text-[11px] font-semibold leading-none tabular-nums',
          active
            ? 'bg-white/15 text-[var(--primary-foreground)]'
            : 'bg-[var(--neu-surface-soft)] text-[var(--muted-foreground)]',
        )}
      >
        {count}
      </span>
    </button>
  )
}

/** Applied → Reviewing → Shortlisted → Interview → Offer, with the stage the
 *  status sits at highlighted and closed paths left quiet. */
function StatusTimeline({ stages }: { stages: TimelineStage[] }) {
  return (
    <ol className="flex items-start">
      {stages.map((stage, i) => (
        <li key={stage.label} className="flex min-w-0 flex-1 flex-col items-center">
          <div className="relative flex w-full items-center justify-center">
            {i < stages.length - 1 && (
              <span
                aria-hidden="true"
                className={cn(
                  'absolute right-0 left-1/2 ml-3 h-0.5 rounded-full',
                  stage.done ? 'bg-[color:var(--success)] opacity-50' : 'bg-[var(--neu-edge)]',
                )}
              />
            )}
            {stage.current ? (
              <span
                aria-hidden="true"
                className="relative flex size-3.5 items-center justify-center rounded-full [background-image:var(--neu-fill-primary)]"
              >
                <span className="absolute -inset-1 rounded-full border-2 border-[color:var(--primary)] opacity-30" />
              </span>
            ) : (
              <span
                aria-hidden="true"
                className={cn(
                  'relative size-2.5 rounded-full',
                  stage.done ? 'bg-[color:var(--success)]' : 'bg-[var(--muted-foreground)] opacity-40',
                )}
              />
            )}
          </div>
          <span
            className={cn(
              'mt-2 text-center text-[11px] leading-tight',
              stage.current
                ? 'font-semibold text-[var(--foreground)]'
                : stage.done
                  ? 'font-medium text-[var(--foreground)]'
                  : 'text-[var(--muted-foreground)]',
            )}
          >
            {stage.label}
          </span>
        </li>
      ))}
    </ol>
  )
}

/** Listing card for one application — the job-card shape: company plate,
 *  title block, meta row, badges, progress, cover letter, actions footer.
 *  Everything the candidate needs sits on the card; nothing hides behind a
 *  second click. The whole card links to the job posting (stretched link);
 *  the star, withdraw, and view-posting controls sit above it (z-10). */
function ApplicationCard({
  application,
  onToggleStar,
  onWithdraw,
}: {
  application: Application
  onToggleStar: (id: string) => void
  onWithdraw: (id: string) => void
}) {
  return (
    <Card variant="raised" className="relative p-0 transition-shadow hover:shadow-[var(--neu-shadow-raised)]">
      <Link
        to={`/jobs/${application.job.id}`}
        aria-label={`View ${application.job.title} at ${application.company.name}`}
        className="absolute inset-0 z-0 rounded-[var(--neu-radius-surface)] focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)]"
      />
      <div className="flex flex-col gap-3.5 p-5 md:p-6">
        <div className="flex items-start gap-4">
          <span
            aria-hidden="true"
            className="flex size-14 shrink-0 items-center justify-center rounded-[14px] bg-[var(--neu-surface)] [background-image:var(--neu-fill-inset)] text-sm font-bold text-[var(--neu-accent-ink)] shadow-[var(--neu-shadow-inset)]"
          >
            {companyInitials(application.company.name)}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h3 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
              {application.job.title}
            </h3>
            <p className="text-sm font-semibold text-[var(--foreground)]">{application.company.name}</p>
            <p className="text-[13px] text-[var(--muted-foreground)]">
              {application.job.employmentType} · {application.job.workMode}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-pressed={application.isStarred}
            aria-label={application.isStarred ? 'Remove star' : 'Star this application'}
            onClick={() => onToggleStar(application.id)}
            className="relative z-10"
          >
            <HugeiconsIcon
              icon={StarIcon}
              strokeWidth={1.8}
              aria-hidden="true"
              className={cn(application.isStarred && 'text-[color:var(--success)]')}
            />
          </Button>
        </div>

        <ul className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[13px] text-[var(--muted-foreground)]">
          <li className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <HugeiconsIcon icon={Calendar01Icon} strokeWidth={1.8} aria-hidden="true" className="size-4" />
            Applied {formatAppliedAt(application.appliedAt)}
          </li>
          <li className="inline-flex items-center gap-1.5 min-w-0">
            <HugeiconsIcon icon={File02Icon} strokeWidth={1.8} aria-hidden="true" className="size-4 shrink-0" />
            <span className="truncate">{application.resume.title}</span>
          </li>
          <li className="inline-flex items-center gap-1.5 whitespace-nowrap font-medium tabular-nums text-[var(--foreground)]">
            <TakaMark className="text-[15px]" />
            {formatAmount(application.expectedSalary)}
          </li>
          <li className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <HugeiconsIcon icon={Sent02Icon} strokeWidth={1.8} aria-hidden="true" className="size-4" />
            Available {formatAvailableFrom(application.availableFrom)}
          </li>
        </ul>

        <div className="flex flex-wrap items-center gap-1.5">
          <Badge
            variant={STATUS_VARIANT[application.status]}
            className="rounded-full px-3 py-1 uppercase"
          >
            {STATUS_LABEL[application.status]}
          </Badge>
        </div>

        <div className="rounded-[var(--neu-radius-control)] bg-[var(--neu-surface)] px-4 py-4 [background-image:var(--neu-fill-inset)] shadow-[var(--neu-shadow-inset)]">
          <StatusTimeline stages={statusTimeline(application.status)} />
          {isClosed(application.status) && (
            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[13px] text-[var(--muted-foreground)]">
              <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} aria-hidden="true" className="size-3.5" />
              This application is closed — {STATUS_LABEL[application.status]}.
              {application.withdrawnReason ? ` Reason: ${application.withdrawnReason}` : ''}
            </p>
          )}
        </div>

        <Separator />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[13px] tabular-nums text-[var(--muted-foreground)]">
            Last updated {formatUpdatedAt(application.updatedAt)}
          </p>
          <div className="flex items-center gap-2">
            {canWithdraw(application.status) && (
              <Button
                variant="ghost"
                type="button"
                onClick={() => onWithdraw(application.id)}
                className="relative z-10 text-[var(--neu-error-text)] hover:text-[var(--neu-error-text)]"
              >
                Withdraw
              </Button>
            )}
            <Link
              to={`/jobs/${application.job.id}`}
              className={buttonClassName({ variant: 'soft' })}
              aria-label={`View job posting for ${application.job.title}`}
            >
              View job posting
            </Link>
          </div>
        </div>
      </div>
    </Card>
  )
}

/**
 * My applications — the candidate's submitted applications as rich cards:
 * status chips with counts, search, newest/oldest ordering, and every
 * application's progress, facts, and cover letter on its card — no second
 * click to see where things stand. Data is a stand-in for the application
 * service (`GET /api/applications/my-applications` through the gateway);
 * withdraw mirrors `POST /api/applications/{id}/withdraw`.
 */
export function ApplicationsPage() {
  const [query, setQuery] = React.useState('')
  const [location, setLocation] = React.useState('')
  const [apps, setApps] = React.useState(APPLICATIONS)
  const [filter, setFilter] = React.useState<Filter>('ALL')
  const [search, setSearch] = React.useState('')
  const [newestFirst, setNewestFirst] = React.useState(true)
  const [withdrawingId, setWithdrawingId] = React.useState<string | null>(null)
  const [withdrawReason, setWithdrawReason] = React.useState('')

  const statusesPresent = STATUS_ORDER.filter((status) =>
    apps.some((app) => app.status === status),
  )

  const filtered = apps
    .filter((app) => filter === 'ALL' || app.status === filter)
    .filter((app) => {
      const needle = search.trim().toLowerCase()
      if (!needle) return true
      return (
        app.job.title.toLowerCase().includes(needle) ||
        app.company.name.toLowerCase().includes(needle)
      )
    })
    .sort((a, b) => {
      const diff = new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
      return newestFirst ? diff : -diff
    })

  const withdrawing = apps.find((app) => app.id === withdrawingId) ?? null

  // Local apply — the withdraw endpoint is the seam (`POST /api/applications/
  // {id}/withdraw` with `WithdrawApplicationRequest`). The row stays in the
  // list as WITHDRAWN — the backend keeps the record, it doesn't delete it.
  const toggleStar = (id: string) => {
    setApps((current) =>
      current.map((app) => (app.id === id ? { ...app, isStarred: !app.isStarred } : app)),
    )
  }

  const confirmWithdraw = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!withdrawing) return
    setApps((current) =>
      current.map((app) =>
        app.id === withdrawing.id
          ? {
              ...app,
              status: 'WITHDRAWN' as const,
              updatedAt: new Date().toISOString(),
              withdrawnReason: withdrawReason.trim() || undefined,
            }
          : app,
      ),
    )
    setWithdrawingId(null)
    setWithdrawReason('')
  }

  const clearFilters = () => {
    setFilter('ALL')
    setSearch('')
  }

  return (
    <div className="min-h-dvh">
      <SiteNavbar query={query} location={location} onQueryChange={setQuery} onLocationChange={setLocation} />

      <main className="mx-auto w-full max-w-4xl px-4 pb-16 pt-8 md:px-6">
        <header>
          <h1 className="text-[22px] font-bold tracking-tight text-[var(--foreground)]">My applications</h1>
          <p className="mt-1 text-sm leading-relaxed text-[var(--muted-foreground)]">
            Everything you have applied to, and where each stands.
          </p>
        </header>

        {/* Status chips with counts — the fastest read of where things stand. */}
        <div className="mt-5 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:thin]">
          <FilterChip
            label="All"
            count={apps.length}
            active={filter === 'ALL'}
            onClick={() => setFilter('ALL')}
          />
          {statusesPresent.map((status) => (
            <FilterChip
              key={status}
              label={STATUS_LABEL[status]}
              count={apps.filter((app) => app.status === status).length}
              active={filter === status}
              onClick={() => setFilter(filter === status ? 'ALL' : status)}
            />
          ))}
        </div>

        {/* Search and ordering. */}
        <div className="mt-3 flex flex-col gap-2.5 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <HugeiconsIcon
              icon={Search02Icon}
              strokeWidth={1.8}
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--muted-foreground)]"
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by job title or company"
              aria-label="Search applications"
              className="pl-9"
            />
          </div>
          <Select
            value={newestFirst ? 'newest' : 'oldest'}
            onChange={(event) => setNewestFirst(event.target.value === 'newest')}
            aria-label="Sort applications"
            className="w-full shrink-0 sm:w-44"
          >
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
          </Select>
        </div>

        {filtered.length > 0 ? (
          <div className="mt-4 flex flex-col gap-4">
            {filtered.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
                onToggleStar={toggleStar}
                onWithdraw={(id) => {
                  setWithdrawingId(id)
                  setWithdrawReason('')
                }}
              />
            ))}
          </div>
        ) : (
          <Card variant="raised" className="mt-4 items-center gap-2 px-6 py-12 text-center">
            <HugeiconsIcon icon={Sent02Icon} strokeWidth={1.5} aria-hidden="true" className="size-8 text-[var(--muted-foreground)]" />
            <p className="text-sm font-medium text-[var(--foreground)]">No applications match</p>
            <p className="max-w-xs text-sm text-[var(--muted-foreground)]">
              Nothing here under the current filter or search.
            </p>
            <Button variant="soft" type="button" onClick={clearFilters}>
              Clear filters
            </Button>
          </Card>
        )}

        <p className="mt-3 text-[13px] text-[var(--muted-foreground)]">
          Applications come from the application service when it is wired; withdrawing an application lands here too.
        </p>
      </main>

      {/* Withdraw — a typed-out consequence and an optional reason, like the
          backend's `WithdrawApplicationRequest` expects. */}
      <Dialog open={withdrawing !== null} onOpenChange={(open) => !open && setWithdrawingId(null)}>
        <DialogContent className="max-w-md">
          {withdrawing && (
            <form onSubmit={confirmWithdraw} className="flex min-w-0 flex-col gap-5">
              <DialogTitle>Withdraw application?</DialogTitle>
              <DialogDescription>
                Your application for {withdrawing.job.title} at {withdrawing.company.name} will
                be marked as withdrawn. This cannot be undone.
              </DialogDescription>

              <Field>
                <FieldLabel htmlFor="withdraw-reason">Reason (optional)</FieldLabel>
                <Textarea
                  id="withdraw-reason"
                  value={withdrawReason}
                  onChange={(event) => setWithdrawReason(event.target.value)}
                  maxLength={300}
                  rows={3}
                  placeholder="e.g. Accepted another offer"
                />
              </Field>

              <DialogFooter>
                <Button variant="soft" type="button" onClick={() => setWithdrawingId(null)}>
                  Keep application
                </Button>
                <Button
                  type="submit"
                  className="border-[color:var(--destructive)] bg-[var(--destructive)] text-white"
                >
                  Withdraw
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
