import { HugeiconsIcon } from '@hugeicons/react'
import { AlertCircleIcon } from '@hugeicons/core-free-icons'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { Job } from '../../data/types'
import { RESUMES, parseExpectedSalary, type ApplicationDraft } from '../data'

interface ReviewStepProps {
  job: Job
  draft: ApplicationDraft
  /** Jumps back to a step to fix something — labels carry the step name. */
  onEdit: (stepIndex: number) => void
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function ChangeButton({ stepIndex, onEdit }: { stepIndex: number; onEdit: (index: number) => void }) {
  return (
    <button
      type="button"
      onClick={() => onEdit(stepIndex)}
      className="shrink-0 rounded-[var(--neu-radius-small)] text-sm font-semibold text-[var(--neu-accent-ink)] outline-hidden transition-opacity duration-[var(--neu-duration)] hover:opacity-75 focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)]"
    >
      Change
    </button>
  )
}

/**
 * One block per thing being sent — resume, letter, terms — each with its
 * heading and Change control on one line, content below. The letter shows
 * in full: this page is the last look before it goes out.
 */
export function ReviewStep({ job, draft, onEdit }: ReviewStepProps) {
  const resume = RESUMES.find((item) => item.id === draft.resumeId)
  const salary = parseExpectedSalary(draft.expectedSalary)
  const letter = draft.coverLetter.trim()

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">Review your application</h2>
        <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
          Please review your application below before submitting it to{' '}
          {job.company}.
        </p>
      </div>

      {/* Resume */}
      <section aria-label="Resume">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-bold tracking-tight text-[var(--neu-accent-ink)]">Resume</h3>
          <ChangeButton stepIndex={0} onEdit={onEdit} />
        </div>
        {resume ? (
          <div className="mt-2">
            <p className="text-sm font-semibold text-[var(--foreground)]">{resume.name}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {resume.skills.map((skill) => (
                <Badge key={skill} variant="soft" className="rounded-full px-2.5 py-0.5 text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        ) : (
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">Not selected.</p>
        )}
      </section>

      <Separator />

      {/* Cover letter — in full */}
      <section aria-label="Cover letter">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-bold tracking-tight text-[var(--neu-accent-ink)]">Cover letter</h3>
          <ChangeButton stepIndex={1} onEdit={onEdit} />
        </div>
        {letter ? (
          <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[var(--foreground)]">
            {letter}
          </div>
        ) : (
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Not provided.
          </p>
        )}
      </section>

      <Separator />

      {/* Terms */}
      <section aria-label="Salary and availability">
        <h3 className="text-sm font-bold tracking-tight text-[var(--neu-accent-ink)]">Salary & availability</h3>
        <div className="mt-2 grid gap-4 sm:grid-cols-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-[var(--muted-foreground)]">Expected salary</p>
              <p className="mt-0.5 text-sm font-semibold tabular-nums text-[var(--foreground)]">
                {salary && salary !== 'invalid'
                  ? `৳${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(salary)}`
                  : 'Not provided'}
              </p>
            </div>
            <ChangeButton stepIndex={2} onEdit={onEdit} />
          </div>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-[var(--muted-foreground)]">Available from</p>
              <p className="mt-0.5 text-sm font-semibold text-[var(--foreground)]">
                {draft.availableFrom ? formatDate(draft.availableFrom) : 'Not provided'}
              </p>
            </div>
            <ChangeButton stepIndex={2} onEdit={onEdit} />
          </div>
        </div>
      </section>

      {/* Candidacy note — one line, in the alert box it was before. */}
      <Alert>
        <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={1.8} />
        <AlertDescription>
          Once submitted, the application is sent to {job.company} and cannot
          be edited.
        </AlertDescription>
      </Alert>
    </div>
  )
}
