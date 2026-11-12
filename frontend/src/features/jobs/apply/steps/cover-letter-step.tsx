import { HugeiconsIcon } from '@hugeicons/react'
import { SparklesIcon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  COVER_LETTER_MAX,
  coverLetterCount,
  generateCoverLetter,
  type ApplicationDraft,
} from '../data'
import type { Job } from '../../data/types'

interface CoverLetterStepProps {
  job: Job
  draft: ApplicationDraft
  onPatch: (patch: Partial<ApplicationDraft>) => void
}

const STARTERS = [
  'Open with the work you want to keep doing — and one result that proves it.',
  'Name something the company builds that you actually use or admire.',
  'Close by asking for the conversation, not the job.',
]

/** Step 2 — the cover letter. Optional per the DTO, capped at 5000 chars. */
export function CoverLetterStep({ job, draft, onPatch }: CoverLetterStepProps) {
  const overLimit = draft.coverLetter.length > COVER_LETTER_MAX

  const writeWithAi = () => {
    const letter = generateCoverLetter(job, draft.resumeId)
    onPatch({ coverLetter: letter.slice(0, COVER_LETTER_MAX) })
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">Add a cover letter</h2>
        <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
          Optional, but a short letter doubles the chance a hiring manager
          reads past the first page of your resume.
        </p>
      </div>

      <Textarea
        value={draft.coverLetter}
        onChange={(event) => onPatch({ coverLetter: event.target.value })}
        aria-label="Cover letter"
        aria-invalid={overLimit || undefined}
        rows={9}
        className="min-h-56"
        placeholder="Dear hiring team, …"
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs tabular-nums" aria-live="polite">
          <span className={overLimit ? 'font-semibold text-[var(--neu-error-text)]' : 'text-[var(--muted-foreground)]'}>
            {coverLetterCount(draft.coverLetter)}
          </span>
          {overLimit && <span className="ml-2 font-medium text-[var(--neu-error-text)]">Trim it back to continue.</span>}
        </p>
        <Button
          variant="soft"
          size="sm"
          type="button"
          onClick={writeWithAi}
        >
          <HugeiconsIcon icon={SparklesIcon} strokeWidth={1.8} data-icon="inline-start" />
          {draft.coverLetter.trim() ? 'Rewrite with AI' : 'Write with AI'}
        </Button>
      </div>
      <p className="text-xs leading-relaxed text-[var(--muted-foreground)]">
        The draft is a starting point built from this posting and your chosen
        resume — edit it freely so it sounds like you.
      </p>

      <aside
        aria-label="Writing tips"
        className="rounded-[var(--neu-radius-surface)] bg-[var(--neu-surface-soft)] p-4"
      >
        <h3 className="text-sm font-semibold text-[var(--foreground)]">Three things that work</h3>
        <ul className="mt-2 flex list-disc flex-col gap-1 pl-5 text-sm leading-relaxed text-[var(--muted-foreground)]">
          {STARTERS.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </aside>
    </div>
  )
}
