import * as React from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { MagicWand01Icon, SparklesIcon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

interface AiHeroProps {
  value: string
  onValueChange: (value: string) => void
  onSubmit: () => void
}

/**
 * Brand band under the navbar — the one bold element on the page. The navy
 * gradient is a fixed brand color in both themes (treated like a hero image);
 * the card inside uses theme surfaces so dark mode still adapts.
 */
export function AiHero({ value, onValueChange, onSubmit }: AiHeroProps) {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit()
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault()
      onSubmit()
    }
  }

  return (
    <section className="bg-[linear-gradient(165deg,#2e3d72_0%,#1e2a52_45%,#121a38_100%)] px-4 py-12 md:py-16">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-white/90">
          <HugeiconsIcon icon={SparklesIcon} strokeWidth={1.8} aria-hidden="true" className="size-3.5" />
          AI-Powered Job Search
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
          Find Your Next Opportunity
        </h1>
        <p className="text-sm text-white/70 md:text-base">
          Discover the perfect job match with our AI-powered search engine.
        </p>
        <Card variant="raised" className="mt-3 w-full p-4 text-left md:p-5">
          <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            <div className="relative">
              <HugeiconsIcon
                icon={MagicWand01Icon}
                strokeWidth={1.8}
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-3.5 size-4 text-[var(--muted-foreground)]"
              />
              <Textarea
                rows={3}
                value={value}
                onChange={(event) => onValueChange(event.target.value)}
                onKeyDown={handleKeyDown}
                aria-label="Describe the job you're looking for"
                placeholder={
                  "Describe the job you're looking for...\nE.g. Software Engineer with 5 years experience in React and Spring boot"
                }
                className="resize-none pl-10"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-[var(--muted-foreground)]">Tip: Ctrl + Enter to search</p>
              <Button
                type="submit"
                variant="primary"
                className="[background-image:var(--neu-fill-primary)] text-[var(--primary-foreground)]"
              >
                <HugeiconsIcon icon={MagicWand01Icon} strokeWidth={1.8} aria-hidden="true" />
                Search With AI
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </section>
  )
}
