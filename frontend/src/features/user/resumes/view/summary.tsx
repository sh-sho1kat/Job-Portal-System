'use client'

import * as React from 'react'

import { HugeiconsIcon } from '@hugeicons/react'
import { PencilEdit02Icon, SparklesIcon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { ResumeItem } from '../data'
import { SUMMARY_MAX } from '../data'
import { canGenerateSummary, generateSummaryDraft } from '../ai'
import { updateSummary } from '../store'

/**
 * Summary — the resume's professional summary (`ResumeResponse.summary`),
 * editable inline like Personal Info: a read view with an Edit action and
 * a bare textarea form mirroring the backend's
 * `PATCH /api/resumes/{resumeId}/summary` (`UpdateSummaryRequest`, at most
 * 5000 characters; the empty string clears it). "Write with AI" drafts
 * from the resume's own record — the seam for `POST /api/ai/resume/summary`
 * lives in `ai.ts`.
 */

function SummaryForm({ resume, onDone }: { resume: ResumeItem; onDone: () => void }) {
  const [draft, setDraft] = React.useState(resume.summary)
  const [error, setError] = React.useState<string | null>(null)

  const trimmed = draft.trim()
  const dirty = trimmed !== resume.summary
  const count = draft.length
  const canGenerate = canGenerateSummary(resume)

  const handleGenerate = () => {
    const generated = generateSummaryDraft(resume)
    if (generated) {
      setDraft(generated.slice(0, SUMMARY_MAX))
      setError(null)
    }
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (count > SUMMARY_MAX) {
      setError(`The summary must be at most 5,000 characters — it is currently ${count.toLocaleString('en-US')}.`)
      return
    }
    updateSummary(resume.id, trimmed)
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex min-w-0 flex-col gap-5">
      <Field data-invalid={error ? true : undefined}>
        <div className="flex items-baseline justify-between gap-3">
          <FieldLabel htmlFor="summary-text">Professional summary</FieldLabel>
          <span
            aria-live="polite"
            className={cn(
              'text-xs tabular-nums',
              count > SUMMARY_MAX ? 'font-semibold text-[var(--neu-error-text)]' : 'text-[var(--muted-foreground)]',
            )}
          >
            {count.toLocaleString('en-US')} / {SUMMARY_MAX.toLocaleString('en-US')}
          </span>
        </div>
        <Textarea
          id="summary-text"
          value={draft}
          maxLength={SUMMARY_MAX}
          rows={8}
          aria-invalid={error ? true : undefined}
          placeholder="A short introduction — who you are, your strongest skills, and what you're looking for."
          onChange={(event) => {
            setDraft(event.target.value)
            setError(null)
          }}
        />
        {error && (
          <p role="alert" className="text-[13px] font-medium text-[var(--neu-error-text)]">
            {error}
          </p>
        )}
      </Field>

      <div className="flex flex-wrap items-center justify-end gap-3">
        {/* AI assist sits with the actions: secondary, on the opposite side
            of Save — the same placement the apply flow's letter uses. */}
        <Button
          type="button"
          variant="soft"
          size="sm"
          onClick={handleGenerate}
          disabled={!canGenerate}
          className="mr-auto"
        >
          <HugeiconsIcon icon={SparklesIcon} strokeWidth={1.8} data-icon="inline-start" />
          Write with AI
        </Button>
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={!dirty}>
          Save changes
        </Button>
      </div>
    </form>
  )
}

export function SummarySection({ resume }: { resume: ResumeItem }) {
  const [editing, setEditing] = React.useState(false)

  if (editing) {
    return <SummaryForm resume={resume} onDone={() => setEditing(false)} />
  }

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex items-center justify-end">
        <Button variant="soft" size="sm" onClick={() => setEditing(true)} className="shrink-0">
          <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={2} data-icon="inline-start" />
          {resume.summary ? 'Edit' : 'Add summary'}
        </Button>
      </div>
      {resume.summary ? (
        <p className="max-w-prose text-[15px] leading-relaxed text-[var(--foreground)]">
          {resume.summary}
        </p>
      ) : (
        <div className="flex flex-col items-center gap-1.5 rounded-[var(--neu-radius-control)] border border-dashed border-[color:var(--border)] px-4 py-8 text-center">
          <p className="text-[13px] font-medium text-[var(--foreground)]">No summary written yet.</p>
          <p className="text-xs text-[var(--muted-foreground)]">
            Two or three sentences — it's the first thing recruiters read.
          </p>
        </div>
      )}
    </div>
  )
}
