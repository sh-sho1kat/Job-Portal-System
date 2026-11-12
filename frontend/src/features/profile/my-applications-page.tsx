import * as React from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeftIcon, Sent02Icon } from '@hugeicons/core-free-icons'
import { Link } from 'react-router'

import { SiteNavbar } from '@/components/layout/site-navbar'
import { Card } from '@/components/ui/card'
import { buttonClassName } from '@/components/ui/button'

/**
 * My applications — where submitted applications will be tracked once the
 * gateway's `GET /api/applications` is wired. Today the demo data has no
 * submitted applications, so the page is an honest empty state: the option
 * to act, not a stub list.
 */
export function ApplicationsPage() {
  const [query, setQuery] = React.useState('')
  const [location, setLocation] = React.useState('')

  return (
    <div className="min-h-dvh">
      <SiteNavbar query={query} location={location} onQueryChange={setQuery} onLocationChange={setLocation} />
      <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-8 md:px-6">
        <header>
          <Link
            to="/profile"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--muted-foreground)] transition-colors duration-[var(--neu-duration)] hover:text-[var(--foreground)]"
          >
            <HugeiconsIcon icon={ArrowLeftIcon} strokeWidth={2} aria-hidden="true" className="size-3.5" />
            Back to profile
          </Link>
          <h1 className="mt-3 text-[22px] font-bold tracking-tight text-[var(--foreground)]">My applications</h1>
          <p className="mt-1 text-sm leading-relaxed text-[var(--muted-foreground)]">
            Everything you have applied to, and where each stands.
          </p>
        </header>

        <Card variant="raised" className="mt-6 items-center gap-2 px-6 py-12 text-center">
          <HugeiconsIcon icon={Sent02Icon} strokeWidth={1.5} aria-hidden="true" className="size-8 text-[var(--muted-foreground)]" />
          <p className="text-sm font-medium text-[var(--foreground)]">No applications yet</p>
          <p className="max-w-xs text-sm text-[var(--muted-foreground)]">
            Apply to a job and it will show up here with its current stage.
          </p>
          <Link to="/jobs" className={buttonClassName({ variant: 'soft', size: 'sm' })}>
            Browse jobs
          </Link>
        </Card>
      </main>
    </div>
  )
}
