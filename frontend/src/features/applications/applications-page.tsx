import { HugeiconsIcon } from '@hugeicons/react'
import { Sent02Icon, StarIcon } from '@hugeicons/core-free-icons'
import * as React from 'react'
import { Link } from 'react-router'

import { SiteNavbar } from '@/components/layout/site-navbar'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { TakaMark } from '@/features/jobs/components/currency'
import {
  APPLICATIONS,
  STATUS_LABEL,
  STATUS_VARIANT,
  formatAmount,
  formatAppliedAt,
} from './data'

/**
 * My applications — the candidate's submitted applications, one row per
 * application, newest first. Data is a stand-in for the application
 * service (`GET /api/applications` through the gateway); each row links
 * back to the job it was submitted for. Reached from the navbar.
 */
export function ApplicationsPage() {
  const [query, setQuery] = React.useState('')
  const [location, setLocation] = React.useState('')

  const applications = [...APPLICATIONS].sort(
    (a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime(),
  )

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

        <Card variant="raised" className="mt-6 gap-0 px-5 py-2 md:px-6">
          <ul className="flex flex-col divide-y divide-[color:var(--neu-edge)]">
            {applications.map((application) => (
              <li key={application.id}>
                <Link
                  to={`/jobs/${application.job.id}`}
                  className="group -mx-2 flex items-start gap-3.5 rounded-[var(--neu-radius-control)] px-2 py-4 transition-colors duration-[var(--neu-duration)] hover:bg-[var(--neu-surface-soft)] motion-reduce:transition-none"
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
                    <span className="mt-1 block truncate text-[13px] text-[var(--muted-foreground)]">
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
                </Link>
              </li>
            ))}
          </ul>
          <Separator className="mt-2" />
          <p className="py-3 text-[13px] text-[var(--muted-foreground)]">
            Applications come from the application service when it is wired; withdrawing an application lands here too.
          </p>
        </Card>
      </main>
    </div>
  )
}
