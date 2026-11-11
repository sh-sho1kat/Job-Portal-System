import * as React from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Bookmark02Icon,
  Briefcase01Icon,
  CheckmarkBadge04Icon,
  Clock01Icon,
  DollarSignIcon,
  Search02Icon,
} from '@hugeicons/core-free-icons'

import { Card } from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel'
import { cn } from '@/lib/utils'

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
  {
    icon: DollarSignIcon,
    title: 'Pay up front',
    body: "Every opening shows its salary band before you click — no 'competitive salary' riddles.",
  },
  {
    icon: Bookmark02Icon,
    title: 'Save as you browse',
    body: 'Bookmark roles while you scroll and keep them in one list for later.',
  },
  {
    icon: Clock01Icon,
    title: 'Fresh listings',
    body: 'Posting age is right on every card, so nothing stale pretends to be new.',
  },
]

/** About block — brand story up front, six promises in a three-up looping carousel. */
export function AboutSection() {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = React.useState(0)

  React.useEffect(() => {
    if (!api) return
    const onSelect = () => setCurrent(api.selectedScrollSnap())
    api.on('select', onSelect)
    onSelect()
    return () => {
      api.off('select', onSelect)
    }
  }, [api])

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

      {/* Gutters (px-10/12) reserve room so the arrows flank the cards instead
          of sitting on top of them. Three cards visible, like the old grid;
          the arrows advance to the promises beyond the first three. */}
      <Carousel
        opts={{ loop: true, align: 'start' }}
        setApi={setApi}
        aria-label="What Hirely promises"
        className="relative mx-auto mt-9 max-w-7xl px-10 md:px-12"
      >
        <CarouselContent>
          {VALUES.map((value) => (
            <CarouselItem key={value.title} className="basis-full sm:basis-1/3">
              <Card variant="raised" className="flex h-full flex-col gap-3 p-5 text-left">
                <span
                  aria-hidden="true"
                  className="flex size-10 shrink-0 items-center justify-center rounded-[14px] bg-[var(--neu-surface)] [background-image:var(--neu-fill-inset)] text-[var(--neu-accent-ink)] shadow-[var(--neu-shadow-inset)]"
                >
                  <HugeiconsIcon icon={value.icon} strokeWidth={1.8} aria-hidden="true" className="size-4.5" />
                </span>
                <h3 className="text-base font-semibold tracking-tight text-[var(--foreground)]">{value.title}</h3>
                <p className="text-[13px] leading-relaxed text-[var(--muted-foreground)]">{value.body}</p>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-0 size-9" />
        <CarouselNext className="right-0 size-9" />
      </Carousel>

      {/* Slide dots — double as a direct jump control. */}
      <div className="mt-5 flex items-center justify-center gap-2">
        {VALUES.map((value, index) => (
          <button
            key={value.title}
            type="button"
            aria-label={`Go to promise ${index + 1} of ${VALUES.length}`}
            aria-current={index === current}
            onClick={() => api?.scrollTo(index)}
            className={cn(
              'size-2 cursor-pointer rounded-full transition-colors duration-[var(--neu-duration)]',
              index === current
                ? 'bg-[var(--primary)]'
                : 'bg-[var(--neu-surface-low)] hover:bg-[var(--muted-foreground)]',
            )}
          />
        ))}
      </div>
    </section>
  )
}
