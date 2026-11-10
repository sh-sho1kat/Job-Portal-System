import * as React from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Search02Icon } from '@hugeicons/core-free-icons'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

/** Terms that return real results from the current job data. */
const POPULAR_SEARCHES = ['Remote', 'Developer', 'React', 'Analyst']

/**
 * The landing page's one bold element: the brand navy gradient (fixed in both
 * themes, like the jobs-page hero band) with the search card as the centerpiece.
 */
export function LandingHero() {
  const navigate = useNavigate()
  const [query, setQuery] = React.useState('')
  const [location, setLocation] = React.useState('')

  const search = React.useCallback(
    (needle: string) => {
      const params = new URLSearchParams()
      if (needle.trim()) params.set('q', needle.trim())
      if (location.trim()) params.set('l', location.trim())
      navigate(params.size > 0 ? `/jobs?${params.toString()}` : '/jobs')
    },
    [location, navigate],
  )

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    search(query)
  }

  return (
    <section className="relative flex flex-1 flex-col overflow-hidden bg-[linear-gradient(165deg,#2e3d72_0%,#1e2a52_45%,#121a38_100%)] px-4">
      {/* One soft highlight above the card — draws the eye to the search. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(56%_44%_at_50%_0%,rgba(255,255,255,0.09),transparent)]"
      />
      <div className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-6 py-16 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white [text-wrap:balance] md:text-5xl lg:text-6xl">
          Find work that works for you
        </h1>
        <p className="max-w-xl text-sm text-white/70 md:text-base">
          Search open roles from verified companies — remote, hybrid, or on-site —
          and apply in minutes.
        </p>

        <Card variant="raised" className="mt-2 w-full p-4 text-left md:p-5">
          <form className="flex flex-col gap-3 md:flex-row" onSubmit={handleSubmit}>
            <div className="relative md:flex-1">
              <HugeiconsIcon
                icon={Search02Icon}
                strokeWidth={1.8}
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--muted-foreground)]"
              />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Job title or keyword"
                aria-label="Job title or keyword"
                className="pl-9"
              />
            </div>
            <Input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Location"
              aria-label="Location"
              className="md:w-44"
            />
            <Button
              type="submit"
              variant="primary"
              className="shrink-0 [background-image:var(--neu-fill-primary)] text-[var(--primary-foreground)]"
            >
              Search
            </Button>
          </form>
        </Card>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs text-white/60">Popular:</span>
          {POPULAR_SEARCHES.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => search(term)}
              className="cursor-pointer rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/85 transition-colors duration-[var(--neu-duration)] hover:bg-white/15"
            >
              {term}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
