import { HugeiconsIcon } from '@hugeicons/react'
import {
  ArrowRight01Icon,
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
import { Textarea } from '@/components/ui/textarea'
import { TakaMark } from '@/features/jobs/components/currency'
import { cn } from '@/lib/utils'
import type { ApplicationStatus, TimelineStage } from './data'
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

/**
 * My applications — the candidate's submitted applications with the tools
 * that make the list usable day to day: status chips with counts, a search
 * over job and company, newest/oldest ordering, a detail view (status
 * timeline, cover letter, facts) and withdraw with a reason. Data is a
 * stand-in for the application service (`GET /api/applications/
 * my-applications` through the gateway); withdraw mirrors `POST /api/
 * applications/{id}/withdraw`.
 */
export function ApplicationsPage() {
  const [query, setQuery] = React.useState('')
  const [location, setLocation] = React.useState('')
  const [apps, setApps] = React.useState(APPLICATIONS)
  const [filter, setFilter] = React.useState<Filter>('ALL')
  const [search, setSearch] = React.useState('')
  const [newestFirst, setNewestFirst] = React.useState(true)
  const [detailId, setDetailId] = React.useState<string | null>(null)
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

  const detail = apps.find((app) => app.id === detailId) ?? null
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
          <Card variant="raised" className="mt-4 gap-0 px-5 py-2 md:px-6">
            <ul className="flex flex-col divide-y divide-[color:var(--neu-edge)]">
              {filtered.map((application) => (
                <li key={application.id}>
                  <button
                    type="button"
                    onClick={() => setDetailId(application.id)}
                    aria-label={`View application details for ${application.job.title} at ${application.company.name}`}
                    className="group -mx-2 flex w-[calc(100%+1rem)] items-start gap-3.5 rounded-[var(--neu-radius-control)] px-2 py-4 text-left transition-colors duration-[var(--neu-duration)] hover:bg-[var(--neu-surface-soft)] motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)]"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-[var(--neu-radius-control)] bg-[var(--neu-surface)] text-[var(--neu-accent-ink)] [background-image:var(--neu-fill-raised)] shadow-[var(--neu-shadow-raised-sm)]"
                    >
                      <HugeiconsIcon icon={Sent02Icon} strokeWidth={1.8} className="size-5" />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-sm font-semibold text-[var(--foreground)] group-hover:underline">
                          {application.job.title}
                        </span>
                        {application.isStarred && (
                          <HugeiconsIcon
                            icon={StarIcon}
                            strokeWidth={2}
                            aria-label="Starred"
                            className="size-3.5 shrink-0 text-[color:var(--success)]"
                          />
                        )}
                      </span>
                      <span className="mt-0.5 block truncate text-[13px] text-[var(--muted-foreground)]">
                        {application.company.name} · {application.job.employmentType} · {application.job.workMode}
                      </span>
                      <span className="mt-0.5 block truncate text-[13px] text-[var(--muted-foreground)]">
                        Resume: {application.resume.title}
                      </span>
                    </span>

                    <span className="flex shrink-0 flex-col items-end gap-1.5">
                      <Badge
                        variant={STATUS_VARIANT[application.status]}
                        className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                      >
                        {STATUS_LABEL[application.status]}
                      </Badge>
                      <span className="text-[13px] text-[var(--muted-foreground)]">
                        Applied {formatAppliedAt(application.appliedAt)}
                      </span>
                      <span className="text-sm font-semibold tabular-nums text-[var(--foreground)]">
                        <TakaMark className="mr-0.5 text-[0.8em]" />
                        {formatAmount(application.expectedSalary)}
                      </span>
                    </span>

                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      strokeWidth={2}
                      aria-hidden="true"
                      className="mt-8 hidden size-4 shrink-0 text-[var(--muted-foreground)] transition-transform duration-[var(--neu-duration)] group-hover:translate-x-0.5 sm:block motion-reduce:transition-none"
                    />
                  </button>
                </li>
              ))}
            </ul>
          </Card>
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

      {/* Detail — what was submitted and where it stands. */}
      <Dialog open={detail !== null} onOpenChange={(open) => !open && setDetailId(null)}>
        <DialogContent className="max-w-lg">
          {detail && (
            <>
              <DialogTitle>{detail.job.title}</DialogTitle>
              <DialogDescription>
                {detail.company.name} · {detail.job.employmentType} · {detail.job.workMode}
              </DialogDescription>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={STATUS_VARIANT[detail.status]}
                    className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  >
                    {STATUS_LABEL[detail.status]}
                  </Badge>
                  <span className="text-[13px] text-[var(--muted-foreground)]">
                    Applied {formatAppliedAt(detail.appliedAt)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => toggleStar(detail.id)}
                  aria-pressed={detail.isStarred}
                  aria-label={detail.isStarred ? 'Remove star' : 'Star this application'}
                  className="flex size-8 items-center justify-center rounded-full text-[var(--muted-foreground)] transition-colors duration-[var(--neu-duration)] hover:bg-[var(--neu-surface-soft)] hover:text-[var(--foreground)] focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)]"
                >
                  <HugeiconsIcon
                    icon={StarIcon}
                    strokeWidth={2}
                    aria-hidden="true"
                    className={cn('size-4', detail.isStarred && 'text-[color:var(--success)]')}
                  />
                </button>
              </div>

              <div className="rounded-[var(--neu-radius-control)] bg-[var(--neu-surface)] px-4 py-4 [background-image:var(--neu-fill-inset)] shadow-[var(--neu-shadow-inset)]">
                <StatusTimeline stages={statusTimeline(detail.status)} />
                {isClosed(detail.status) && (
                  <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[13px] text-[var(--muted-foreground)]">
                    <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} aria-hidden="true" className="size-3.5" />
                    This application is closed — {STATUS_LABEL[detail.status]}.
                  </p>
                )}
                {detail.withdrawnReason && (
                  <p className="mt-2 text-center text-[13px] text-[var(--muted-foreground)]">
                    Reason: {detail.withdrawnReason}
                  </p>
                )}
              </div>

              <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
                <div>
                  <dt className="text-[13px] text-[var(--muted-foreground)]">Expected salary</dt>
                  <dd className="mt-0.5 text-sm font-semibold tabular-nums text-[var(--foreground)]">
                    <TakaMark className="mr-0.5 text-[0.8em]" />
                    {formatAmount(detail.expectedSalary)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[13px] text-[var(--muted-foreground)]">Available from</dt>
                  <dd className="mt-0.5 text-sm font-semibold tabular-nums text-[var(--foreground)]">
                    {formatAvailableFrom(detail.availableFrom)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[13px] text-[var(--muted-foreground)]">Resume</dt>
                  <dd className="mt-0.5 truncate text-sm font-medium text-[var(--foreground)]">
                    {detail.resume.title}
                  </dd>
                </div>
                <div>
                  <dt className="text-[13px] text-[var(--muted-foreground)]">Last updated</dt>
                  <dd className="mt-0.5 text-sm font-medium tabular-nums text-[var(--foreground)]">
                    {formatUpdatedAt(detail.updatedAt)}
                  </dd>
                </div>
              </dl>

              <div>
                <h3 className="text-[13px] font-semibold text-[var(--foreground)]">Cover letter</h3>
                <p className="mt-1.5 rounded-[var(--neu-radius-control)] bg-[var(--neu-surface)] px-3.5 py-3 text-sm leading-relaxed text-[var(--foreground)] [background-image:var(--neu-fill-inset)] shadow-[var(--neu-shadow-inset)]">
                  {detail.coverLetter}
                </p>
              </div>

              <DialogFooter>
                {canWithdraw(detail.status) && (
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => {
                      setWithdrawingId(detail.id)
                      setWithdrawReason('')
                      setDetailId(null)
                    }}
                    className="text-[var(--neu-error-text)] hover:text-[var(--neu-error-text)]"
                  >
                    Withdraw
                  </Button>
                )}
                <Link
                  to={`/jobs/${detail.job.id}`}
                  className={buttonClassName({ variant: 'soft' })}
                >
                  View job posting
                </Link>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

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
