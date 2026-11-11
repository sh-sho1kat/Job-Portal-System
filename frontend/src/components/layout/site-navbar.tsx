import { HugeiconsIcon } from '@hugeicons/react'
import {
  Building01Icon,
  Notification03Icon,
  Search02Icon,
  SparklesIcon,
  Target02Icon,
  UserAccountIcon,
} from '@hugeicons/core-free-icons'
import { Link } from 'react-router-dom'

import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface SiteNavbarProps {
  query: string
  location: string
  onQueryChange: (value: string) => void
  onLocationChange: (value: string) => void
}

interface NavLink {
  label: string
  icon?: typeof SparklesIcon
  active?: boolean
  to?: string
}

const NAV_LINKS: NavLink[] = [
  { label: 'Jobs', active: true, to: '/jobs' },
  { label: 'AI Tools', icon: SparklesIcon },
  { label: 'AI Match', icon: Target02Icon },
]

/** Sticky top bar: brand, inline search, primary links, alerts, account, theme.
 *  Full-bleed like the landing navbar — no max-width cap. */
export function SiteNavbar({ query, location, onQueryChange, onLocationChange }: SiteNavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--neu-edge)] bg-[var(--neu-surface)] [background-image:var(--neu-fill-raised)] shadow-[var(--neu-shadow-raised-sm)]">
      {/* Full-bleed: brand at the screen edge, actions at the other — no max-width cap. */}
      <div className="mx-auto flex h-16 w-full flex-wrap items-center gap-x-4 gap-y-2 px-4 md:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label="Hirely home">
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

        <form
          className="hidden min-w-0 flex-1 items-center gap-2.5 md:flex"
          onSubmit={(event) => event.preventDefault()}
        >
          <div className="relative min-w-0 w-full max-w-72">
            <HugeiconsIcon
              icon={Search02Icon}
              strokeWidth={1.8}
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--muted-foreground)]"
            />
            <Input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Job title or keyword"
              aria-label="Job title or keyword"
              className="pl-9"
            />
          </div>
          <Input
            value={location}
            onChange={(event) => onLocationChange(event.target.value)}
            placeholder="Location"
            aria-label="Location"
            className="w-44 min-w-0"
          />
          <Button
            type="submit"
            variant="primary"
            className="shrink-0 [background-image:var(--neu-fill-primary)] text-[var(--primary-foreground)]"
          >
            Search
          </Button>
        </form>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => {
            const className = cn(
              'inline-flex items-center gap-1.5 rounded-[var(--neu-radius-control)] px-3 py-2 text-sm transition-colors duration-[var(--neu-duration)] hover:bg-[var(--neu-surface-soft)]',
              link.active
                ? 'font-semibold text-[var(--foreground)]'
                : 'font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)]',
            )
            const content = (
              <>
                {link.icon && (
                  <HugeiconsIcon icon={link.icon} strokeWidth={1.8} aria-hidden="true" className="size-4.5" />
                )}
                {link.label}
              </>
            )
            return link.to ? (
              <Link key={link.label} to={link.to} aria-current={link.active ? 'page' : undefined} className={className}>
                {content}
              </Link>
            ) : (
              <button key={link.label} type="button" aria-current={link.active ? 'page' : undefined} className={className}>
                {content}
              </button>
            )
          })}
        </nav>

        {/* Right cluster, ordered from the edge inward: profile last (most
            right), then notifications, then the theme switch. shrink-0 keeps
            the icons from being squeezed into their neighbours. */}
        <div className="flex shrink-0 items-center gap-1.5">
          {/* zoom (not transform-scale) shrinks the real layout box — the switch
              stays a normal flex item, aligned and in place at every width.
              0.25 ≈ 64×28px — visibly smaller than the icons beside it. */}
          <ThemeToggle className="shrink-0 [zoom:0.25]" />
          <button
            type="button"
            aria-label="Notifications, 3 unread"
            className="relative flex size-9 cursor-pointer items-center justify-center rounded-full text-[var(--muted-foreground)] transition-colors duration-[var(--neu-duration)] hover:bg-[var(--neu-surface-soft)] hover:text-[var(--foreground)]"
          >
            <HugeiconsIcon icon={Notification03Icon} strokeWidth={1.8} aria-hidden="true" className="size-4.5" />
            <span className="absolute right-0.5 top-0.5 flex size-4 items-center justify-center rounded-full [background-image:var(--neu-fill-primary)] text-[10px] font-bold leading-none text-[var(--primary-foreground)]">
              3
            </span>
          </button>
          <button
            type="button"
            aria-label="Account"
            className="flex size-9 cursor-pointer items-center justify-center rounded-full [background-image:var(--neu-fill-primary)] text-[var(--primary-foreground)]"
          >
            <HugeiconsIcon icon={UserAccountIcon} strokeWidth={1.8} aria-hidden="true" className="size-4.5" />
          </button>
        </div>
      </div>
    </header>
  )
}
