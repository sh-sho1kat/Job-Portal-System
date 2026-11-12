import * as React from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeftIcon, Building01Icon } from '@hugeicons/core-free-icons'
import { Link } from 'react-router'

import { SiteNavbar } from '@/components/layout/site-navbar'
import { Card } from '@/components/ui/card'

/**
 * My company — the employer's company home. The company-service endpoint
 * isn't wired to the frontend yet, so the page is an honest empty state
 * standing in for the company profile and its openings.
 */
export function CompanyPage() {
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
          <h1 className="mt-3 text-[22px] font-bold tracking-tight text-[var(--foreground)]">My company</h1>
          <p className="mt-1 text-sm leading-relaxed text-[var(--muted-foreground)]">
            Your company profile and its openings.
          </p>
        </header>

        <Card variant="raised" className="mt-6 items-center gap-2 px-6 py-12 text-center">
          <HugeiconsIcon icon={Building01Icon} strokeWidth={1.5} aria-hidden="true" className="size-8 text-[var(--muted-foreground)]" />
          <p className="text-sm font-medium text-[var(--foreground)]">No company yet</p>
          <p className="max-w-xs text-sm text-[var(--muted-foreground)]">
            Register your company to post openings and manage applications.
          </p>
        </Card>
      </main>
    </div>
  )
}
