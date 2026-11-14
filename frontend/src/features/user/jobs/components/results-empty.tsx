import { HugeiconsIcon } from '@hugeicons/react'
import { Search02Icon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface ResultsEmptyProps {
  onReset: () => void
}

/** Pressed-in well shown when search and filters eliminate every job. */
export function ResultsEmpty({ onReset }: ResultsEmptyProps) {
  return (
    <Card variant="inset">
      <div className="flex flex-col items-center gap-3 px-6 py-10 text-center sm:py-14">
        <span
          aria-hidden="true"
          className="flex size-12 items-center justify-center rounded-full bg-[var(--neu-surface)] [background-image:var(--neu-fill-inset)] shadow-[var(--neu-shadow-inset)]"
        >
          <HugeiconsIcon icon={Search02Icon} strokeWidth={1.8} aria-hidden="true" className="size-5 text-[var(--muted-foreground)]" />
        </span>
        <p className="text-lg font-semibold tracking-tight text-[var(--foreground)]">No jobs found</p>
        <p className="max-w-sm text-sm leading-relaxed text-[var(--muted-foreground)]">
          Try different search words, or remove some filters and search again.
        </p>
        <Button variant="default" onClick={onReset} className="mt-1">
          Reset everything
        </Button>
      </div>
    </Card>
  )
}
