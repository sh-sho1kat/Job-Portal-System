import { Link } from 'react-router-dom'

import { BrandLogo } from '@/components/layout/brand-logo'

const POPULAR_SEARCHES = ['Remote', 'Developer', 'React', 'Analyst']

const linkClass =
  'text-sm text-[var(--muted-foreground)] transition-colors duration-[var(--neu-duration)] hover:text-[var(--foreground)]'

/** Landing footer — only links that go somewhere real; searches hand off to /jobs. */
export function SiteFooter() {
  return (
    <footer className="border-t border-[color:var(--neu-edge)] bg-[var(--neu-surface)] [background-image:var(--neu-fill-raised)]">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr] md:px-6">
        <div>
          <Link to="/" className="flex w-fit items-center gap-2.5" aria-label="Hirely home">
            <BrandLogo />
          </Link>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-[var(--muted-foreground)]">
            Find a job that aligns with your interests and skills — from verified companies worldwide.
          </p>
        </div>

        <nav aria-label="Explore">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Explore</h3>
          <ul className="mt-3 flex flex-col items-start gap-2">
            <li>
              <Link to="/" className={linkClass}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/jobs" className={linkClass}>
                Find Jobs
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Popular searches">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Popular searches</h3>
          <ul className="mt-3 flex flex-col items-start gap-2">
            {POPULAR_SEARCHES.map((term) => (
              <li key={term}>
                <Link to={`/jobs?q=${term}`} className={linkClass}>
                  {term} jobs
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-[color:var(--neu-edge)]">
        <div className="mx-auto w-full max-w-7xl px-4 py-4 text-xs text-[var(--muted-foreground)] md:px-6">
          © 2026 Hirely. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
