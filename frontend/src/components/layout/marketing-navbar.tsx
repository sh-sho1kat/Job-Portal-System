import { HugeiconsIcon } from '@hugeicons/react'
import { Building01Icon } from '@hugeicons/core-free-icons'
import { Link, useNavigate } from 'react-router-dom'

import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'

/**
 * Landing-page navbar — lighter than the app bar: brand, one link, and the
 * auth actions. Sign in / Get Started go to the jobs page until the auth
 * service exists, so every control leads somewhere real.
 */
export function MarketingNavbar() {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--neu-edge)] bg-[var(--neu-surface)] [background-image:var(--neu-fill-raised)] shadow-[var(--neu-shadow-raised-sm)]">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2.5" aria-label="Hirely home">
          <span
            aria-hidden="true"
            className="flex size-9 shrink-0 items-center justify-center rounded-full [background-image:var(--neu-fill-primary)]"
          >
            <HugeiconsIcon
              icon={Building01Icon}
              strokeWidth={2}
              aria-hidden="true"
              className="size-4.5 text-[var(--primary-foreground)]"
            />
          </span>
          <span className="text-lg font-bold tracking-tight text-[var(--foreground)]">Hirely</span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 sm:flex">
          <button
            type="button"
            onClick={() => navigate('/jobs')}
            className="inline-flex items-center rounded-[var(--neu-radius-control)] px-3 py-2 text-sm font-medium text-[var(--muted-foreground)] transition-colors duration-[var(--neu-duration)] hover:bg-[var(--neu-surface-soft)] hover:text-[var(--foreground)]"
          >
            Find Jobs
          </button>
        </nav>

        <div className="flex items-center gap-2.5">
          {/* zoom (not transform-scale) shrinks the real layout box — same fix
              as the app navbar; 0.35 ≈ 90×39px, matching the h-10 controls
              beside it so the switch reads as part of the row, not a patch. */}
          <ThemeToggle className="shrink-0 [zoom:0.35]" />
          {/* Auth pages don't exist yet — the action lands on the jobs page.
              max-sm:hidden beats the base display utility regardless of CSS
              order, so the cluster can't overflow on phones. */}
          <Button variant="ghost" className="max-sm:hidden" onClick={() => navigate('/jobs')}>
            Sign in
          </Button>
          <Button
            variant="primary"
            className="[background-image:var(--neu-fill-primary)] text-[var(--primary-foreground)]"
            onClick={() => navigate('/jobs')}
          >
            Get Started
          </Button>
        </div>
      </div>
    </header>
  )
}
