import { HugeiconsIcon } from '@hugeicons/react'
import { Building01Icon, ChevronRightIcon, File02Icon, Sent02Icon } from '@hugeicons/core-free-icons'
import { Link } from 'react-router'

import { Card } from '@/components/ui/card'
import type { UserAccount } from './data'

/**
 * Workspace links — the doors out of the profile, by role. A job seeker
 * gets their applications and resumes; an employer gets their company.
 * These rows are options, not data — the pages themselves carry the detail.
 */
export function WorkspaceLinksCard({ account }: { account: UserAccount }) {
  const isEmployer = account.userRole === 'ROLE_EMPLOYER'

  const rows = isEmployer
    ? [
        {
          to: '/company',
          icon: Building01Icon,
          title: 'My company',
          description: 'Your company profile and its openings.',
        },
      ]
    : [
        {
          to: '/applications',
          icon: Sent02Icon,
          title: 'My applications',
          description: 'Everything you have applied to, and where each stands.',
        },
        {
          to: '/resumes',
          icon: File02Icon,
          title: 'My resumes',
          description: 'The resumes you can attach to an application.',
        },
      ]

  return (
    <Card variant="raised" className="gap-0 p-5 md:p-6">
      <h2 className="text-[15px] font-semibold tracking-tight text-[var(--foreground)]">
        {isEmployer ? 'Company' : 'Workspace'}
      </h2>
      <p className="mt-1 text-[13px] text-[var(--muted-foreground)]">
        {isEmployer ? 'Manage your company on Hirely.' : 'Your job search, one click away.'}
      </p>

      <nav aria-label="Workspace" className="mt-4 flex flex-col gap-1.5">
        {rows.map((row) => (
          <Link
            key={row.to}
            to={row.to}
            className="group flex items-center gap-3.5 rounded-[var(--neu-radius-control)] bg-[var(--neu-surface)] px-3.5 py-3 [background-image:var(--neu-fill-inset)] shadow-[var(--neu-shadow-inset)] transition-shadow duration-[var(--neu-duration)] hover:shadow-[var(--neu-shadow-raised-sm)] motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-[color:var(--ring)]"
          >
            <span
              aria-hidden="true"
              className="flex size-9 shrink-0 items-center justify-center rounded-[var(--neu-radius-control)] bg-[var(--neu-surface)] text-[var(--neu-accent-ink)] [background-image:var(--neu-fill-raised)] shadow-[var(--neu-shadow-raised-sm)]"
            >
              <HugeiconsIcon icon={row.icon} strokeWidth={1.8} className="size-4.5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-[var(--foreground)]">{row.title}</span>
              <span className="mt-0.5 block truncate text-[13px] text-[var(--muted-foreground)]">
                {row.description}
              </span>
            </span>
            <HugeiconsIcon
              icon={ChevronRightIcon}
              strokeWidth={2}
              aria-hidden="true"
              className="size-4 shrink-0 text-[var(--muted-foreground)] transition-transform duration-[var(--neu-duration)] group-hover:translate-x-0.5 motion-reduce:transition-none"
            />
          </Link>
        ))}
      </nav>
    </Card>
  )
}
