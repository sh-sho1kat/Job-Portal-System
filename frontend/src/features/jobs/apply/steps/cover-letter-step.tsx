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

const TIPS = [
  'Lead with the position you are applying for and your most relevant achievement.',
  'Reference a specific product, project, or initiative of the company and connect it to your experience.',
  'Close by expressing interest in an interview and thanking the reader for their time.',
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
          Optional. A concise cover letter provides the employer with
          additional context about your experience.
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
          {overLimit && <span className="ml-2 font-medium text-[var(--neu-error-text)]">Reduce the length to continue.</span>}
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
        This draft was generated from the job posting and your selected
        resume. You may edit it before submitting.
      </p>

      <aside
        aria-label="Writing tips"
        className="rounded-[var(--neu-radius-surface)] bg-[var(--neu-surface-soft)] p-4"
      >
        <h3 className="text-sm font-semibold text-[var(--foreground)]">Writing tips</h3>
        <ul className="mt-2 flex list-disc flex-col gap-1 pl-5 text-sm leading-relaxed text-[var(--muted-foreground)]">
          {TIPS.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </aside>
    </div>
  )
}
