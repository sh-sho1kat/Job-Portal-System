import * as React from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { TickIcon } from '@hugeicons/core-free-icons'

import { cn } from '@/lib/utils'

export interface ApplyStep {
  id: string
  label: string
}

interface StepperProps {
  steps: ApplyStep[]
  /** Index of the step being shown. */
  current: number
  /** Highest index the candidate has reached — only these are clickable. */
  reached: number
  onStepSelect: (index: number) => void
}

/**
 * Horizontal stepper, read left to right. Completed steps tick over, the
 * current step is the inset well, future steps stay quiet and inert.
 * The connector after a finished step is filled, the rest stay hollow.
 */
export function ApplyStepper({ steps, current, reached, onStepSelect }: StepperProps) {
  return (
    <nav aria-label="Application progress">
      <ol className="flex w-full items-start">
        {steps.map((step, index) => {
          const isDone = index < current
          const isCurrent = index === current
          const isReachable = index <= reached
          return (
            <React.Fragment key={step.id}>
              {index > 0 && (
                <li aria-hidden="true" className="mt-[11px] h-0.5 min-w-2 flex-1 px-0.5">
                  <span
                    className={cn(
                      'block h-full w-full rounded-full transition-colors duration-[var(--neu-duration)]',
                      index <= current ? 'bg-[var(--primary)]/50' : 'bg-[color:var(--border)]',
                    )}
                  />
                </li>
              )}
              <li className="flex flex-col items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className={cn(
                    'flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold tabular-nums transition-[background-color,box-shadow] duration-[var(--neu-duration)]',
                    isDone &&
                      '[background-image:var(--neu-fill-primary)] text-[var(--primary-foreground)] shadow-[var(--neu-shadow-primary)]',
                    isCurrent &&
                      'bg-[var(--neu-surface)] [background-image:var(--neu-fill-inset)] text-[var(--neu-accent-ink)] shadow-[var(--neu-shadow-inset)] ring-2 ring-[var(--ring)] ring-offset-2 ring-offset-[var(--background)]',
                    !isDone && !isCurrent &&
                      'bg-[var(--neu-surface)] [background-image:var(--neu-fill-inset)] text-[var(--muted-foreground)] shadow-[var(--neu-shadow-inset)]',
                  )}
                >
                  {isDone ? (
                    <HugeiconsIcon icon={TickIcon} strokeWidth={2.5} className="size-3.5" />
                  ) : (
                    index + 1
                  )}
                </span>
                <button
                  type="button"
                  aria-current={isCurrent ? 'step' : undefined}
                  disabled={!isReachable || isCurrent}
                  onClick={() => onStepSelect(index)}
                  className={cn(
                    'whitespace-nowrap rounded-[var(--neu-radius-small)] px-1 text-[11px] font-semibold leading-4 outline-hidden transition-[color,opacity] duration-[var(--neu-duration)] focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)]',
                    isCurrent ? 'text-[var(--foreground)]' : 'text-[var(--muted-foreground)]',
                    isReachable && !isCurrent && 'hover:text-[var(--neu-accent-ink)] hover:opacity-80',
                    !isReachable && 'cursor-not-allowed opacity-50',
                  )}
                >
                  {step.label}
                </button>
              </li>
            </React.Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
