import { HugeiconsIcon } from '@hugeicons/react'
import {
  Briefcase01Icon,
  CheckmarkBadge04Icon,
  Search02Icon,
} from '@hugeicons/core-free-icons'

import { Card } from '@/components/ui/card'

const VALUES: Array<{ icon: typeof Search02Icon; title: string; body: string }> = [
  {
    icon: CheckmarkBadge04Icon,
    title: 'Verified employers',
    body: 'Company profiles are checked before their roles go live, so you know who is behind every opening.',
  },
  {
    icon: Search02Icon,
    title: 'Search that fits the job',
    body: 'Filter by work mode, level, and salary range instead of scrolling — the results page is built around it.',
  },
  {
    icon: Briefcase01Icon,
    title: 'Apply in minutes',
    body: 'Your details once, then one click per role. No forms that read like a mortgage application.',
  },
]

/** About block — brand story up front, three concrete promises below it. */
export function AboutSection() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="mx-auto w-full max-w-7xl scroll-mt-20 px-4 pb-16 md:px-6"
    >
      <div className="mx-auto max-w-2xl text-center">
        <h2 id="about-heading" className="text-3xl font-bold tracking-tight text-[var(--foreground)] md:text-4xl">
          About Us
        </h2>
        <p className="mt-2.5 text-sm leading-relaxed text-[var(--muted-foreground)] md:text-base">
          Finding work should feel like a search, not a scroll. Hirely gathers
          open roles from verified companies in one quiet place — searchable by
          role, location, pay, and work mode.
        </p>
      </div>

      <div className="mt-9 grid gap-5 sm:grid-cols-3">
        {VALUES.map((value) => (
          <Card key={value.title} variant="raised" className="flex flex-col gap-3 p-5">
            <span
              aria-hidden="true"
              className="flex size-10 shrink-0 items-center justify-center rounded-[14px] bg-[var(--neu-surface)] [background-image:var(--neu-fill-inset)] text-[var(--neu-accent-ink)] shadow-[var(--neu-shadow-inset)]"
            >
              <HugeiconsIcon icon={value.icon} strokeWidth={1.8} aria-hidden="true" className="size-4.5" />
            </span>
            <h3 className="text-base font-semibold tracking-tight text-[var(--foreground)]">{value.title}</h3>
            <p className="text-[13px] leading-relaxed text-[var(--muted-foreground)]">{value.body}</p>
          </Card>
        ))}
      </div>
    </section>
  )
}
