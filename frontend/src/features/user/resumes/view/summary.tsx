'use client'

import * as React from 'react'

import { HugeiconsIcon } from '@hugeicons/react'
import { PencilEdit02Icon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import type { ResumeItem } from '../data'
import { updateSummary } from '../store'

/**
 * Summary — the resume's professional summary (`ResumeResponse.summary`),
 * editable inline like Personal Info: a read view with an Edit action and
 * a bare textarea form mirroring the backend's
 * `PATCH /api/resumes/{resumeId}/summary` (`UpdateSummaryRequest`, at most
 * 5000 characters; the empty string clears it). It graduates to its own
 * file here so `sections.tsx` keeps only read-only pages.
 */

function SummaryForm({ resume, onDone }: { resume: ResumeItem; onDone: () => void }) {
  const [draft, setDraft] = React.useState(resume.summary)

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    updateSummary(resume.id, draft.trim())
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex min-w-0 flex-col gap-5">
      <Field>
        <FieldLabel htmlFor="summary-text">Professional summary</FieldLabel>
        <Textarea
          id="summary-text"
          value={draft}
          maxLength={5000}
          rows={8}
          placeholder="A short introduction — who you are, your strongest skills, and what you're looking for."
          onChange={(event) => setDraft(event.target.value)}
        />
      </Field>
      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
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
        <p className="max-w-prose text-sm leading-relaxed text-[var(--foreground)]">
          {resume.summary}
        </p>
      ) : (
        <div className="flex flex-col items-center gap-1.5 rounded-[var(--neu-radius-control)] border border-dashed border-[color:var(--border)] px-4 py-8 text-center">
          <p className="text-[13px] font-medium text-[var(--foreground)]">No summary written yet.</p>
          <p className="text-xs text-[var(--muted-foreground)]">
            A short introduction — it's the first thing recruiters read.
          </p>
        </div>
      )}
    </div>
  )
}
