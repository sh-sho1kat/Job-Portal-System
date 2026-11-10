import * as React from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Location01Icon, Search02Icon } from '@hugeicons/core-free-icons'
import { useNavigate } from 'react-router-dom'

import heroImage from '@/assets/Modern 3D Job Search Workspace-1.png'

/** Terms that return real results from the current job data. */
const POPULAR_SEARCHES = ['Remote', 'Developer', 'React', 'Analyst']

/**
 * The illustration is the hero: its left side is open space, so the headline
 * and search sit inside the artwork (like the reference). The image is a fixed
 * brand visual — same treatment the navy band had — so everything on top uses
 * fixed ink, not theme tokens, and reads identically in both themes.
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
    <section className="relative overflow-hidden bg-[#e0e4f6] px-4 py-14 md:px-10 md:py-20 lg:px-16">
      {/* Stacks under the text on phones; full-bleed artwork from sm up. */}
      <img
        aria-hidden="true"
        src={heroImage}
        className="mt-10 w-full rounded-[var(--neu-radius-surface)] shadow-[0_18px_44px_rgba(29,35,43,0.18)] sm:absolute sm:inset-0 sm:mt-0 sm:h-full sm:w-full sm:rounded-none sm:object-cover sm:shadow-none"
      />

      <div className="relative z-10 max-w-xl">
        <h1 className="text-3xl font-bold leading-[1.12] tracking-tight text-[#1d232b] [text-wrap:balance] sm:text-4xl lg:text-[2.6rem]">
          Find a job that aligns with your interests and skills
        </h1>
        <p className="mt-3 text-sm text-[#4d5670] md:text-base">
          Thousands of jobs across leading sectors are waiting for you.
        </p>

        <form
          className="mt-7 flex flex-col gap-2 rounded-[var(--radius)] bg-white p-2 shadow-[0_14px_36px_rgba(29,35,43,0.16)] sm:flex-row sm:items-center"
          onSubmit={handleSubmit}
        >
          <div className="relative flex-1">
            <HugeiconsIcon
              icon={Search02Icon}
              strokeWidth={1.8}
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8a90a4]"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Job title, keyword"
              aria-label="Job title or keyword"
              className="h-11 w-full rounded-[var(--neu-radius-control)] border border-[rgb(29_35_43_/_0.14)] bg-transparent pl-9 pr-3 text-sm text-[#1d232b] placeholder:text-[#8a90a4] focus-visible:outline-2 focus-visible:outline-[#3f536f]"
            />
          </div>
          <div className="relative sm:w-40">
            <HugeiconsIcon
              icon={Location01Icon}
              strokeWidth={1.8}
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8a90a4]"
            />
            <input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Location"
              aria-label="Location"
              className="h-11 w-full rounded-[var(--neu-radius-control)] border border-[rgb(29_35_43_/_0.14)] bg-transparent pl-9 pr-3 text-sm text-[#1d232b] placeholder:text-[#8a90a4] focus-visible:outline-2 focus-visible:outline-[#3f536f]"
            />
          </div>
          <button
            type="submit"
            className="inline-flex h-11 shrink-0 cursor-pointer items-center justify-center rounded-[var(--neu-radius-control)] bg-[#3f536f] px-5 text-sm font-semibold text-white transition-colors duration-[var(--neu-duration)] hover:bg-[#35465e] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3f536f]"
          >
            Find Job
          </button>
        </form>

        <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-[#6a7390]">
          Popular:
          {POPULAR_SEARCHES.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => search(term)}
              className="cursor-pointer font-medium text-[#3f536f] underline decoration-[rgb(63_83_111_/_0.35)] underline-offset-4 transition-colors duration-[var(--neu-duration)] hover:decoration-[#3f536f]"
            >
              {term}
            </button>
          ))}
        </p>
      </div>
    </section>
  )
}
