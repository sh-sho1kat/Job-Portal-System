'use client'

import * as React from 'react'

import { HugeiconsIcon } from '@hugeicons/react'
import { DeleteIcon, MedalIcon, PencilEdit02Icon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { DatePicker } from '@/components/ui/date-picker'
import { cn } from '@/lib/utils'
import type { ResumeAwardEntry, ResumeItem } from '../data'
import {
  AWARD_DESCRIPTION_MAX,
  AWARD_ISSUER_MAX,
  AWARD_TITLE_MAX,
  formatResumeDate,
  isoDateToDate,
  dateToIsoDate,
} from '../data'
import { addAward, removeAward, updateAward, type AwardInput } from '../store'

/**
 * Awards — the resume's `AwardResponse` list under
 * `/api/resumes/{resumeId}/awards`: a collection, so the read view carries
 * per-entry Edit/Remove (`PUT` / `DELETE /{awardId}`) and an Add action
 * (`POST`). The form mirrors `AwardRequest` — title required (≤200);
 * issuer (≤150), date and description (≤5000) optional, with the
 * backend's `@PastOrPresent` rule on the date. There is no AI assist
 * here: the ai-service exposes no awards endpoint.
 */

/** Marks the fields `AwardRequest` requires. The star is for the eye
 *  only — the inputs' `required` attribute carries the semantics. */
function RequiredStar() {
  return (
    <span aria-hidden="true" className="text-[var(--neu-error-text)]">
      {' '}*
    </span>
  )
}

function emptyInput(): AwardInput {
  return { title: '', issuer: '', dateAwarded: '', description: '', displayOrder: 0 }
}

function EntryForm({
  resumeId,
  initial,
  onDone,
}: {
  resumeId: string
  initial: ResumeAwardEntry | null
  onDone: () => void
}) {
  const [draft, setDraft] = React.useState<AwardInput>(() =>
    initial ? { ...initial } : emptyInput(),
  )
  const [error, setError] = React.useState<string | null>(null)

  const set = (partial: Partial<AwardInput>) => {
    setDraft((current) => ({ ...current, ...partial }))
    setError(null)
  }

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault()
    // The same rules `AwardRequest` enforces server-side.
    if (!draft.title.trim()) return setError('Title is required.')
    if (draft.title.length > AWARD_TITLE_MAX) return setError(`The title must be at most ${AWARD_TITLE_MAX} characters.`)
    if (draft.issuer.length > AWARD_ISSUER_MAX) return setError(`The issuer must be at most ${AWARD_ISSUER_MAX} characters.`)
    if (draft.dateAwarded) {
      const today = dateToIsoDate(new Date())
      if (draft.dateAwarded > today) return setError('The date of the award cannot be in the future.')
    }
    if (draft.description.length > AWARD_DESCRIPTION_MAX) {
      return setError(`The description must be at most 5,000 characters — it is currently ${draft.description.length.toLocaleString('en-US')}.`)
    }

    if (initial) {
      updateAward(resumeId, initial.id, draft)
    } else {
      addAward(resumeId, draft)
    }
    onDone()
  }

  return (
    <form onSubmit={handleSave} noValidate className="flex min-w-0 flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2 sm:items-start">
        <Field>
          <FieldLabel htmlFor="awd-title">Title<RequiredStar /></FieldLabel>
          <Input
            id="awd-title"
            value={draft.title}
            maxLength={AWARD_TITLE_MAX}
            placeholder="Champion — Inter-university programming contest"
            onChange={(event) => set({ title: event.target.value })}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="awd-issuer">Issuer</FieldLabel>
          <Input
            id="awd-issuer"
            value={draft.issuer}
            maxLength={AWARD_ISSUER_MAX}
            placeholder="IUT CSE Society"
            onChange={(event) => set({ issuer: event.target.value })}
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 sm:items-start">
        <Field>
          <FieldLabel htmlFor="awd-date">Date awarded</FieldLabel>
          <DatePicker
            id="awd-date"
            label="Date awarded"
            value={isoDateToDate(draft.dateAwarded)}
            onValueChange={(date) => set({ dateAwarded: date ? dateToIsoDate(date) : '' })}
            endMonth={new Date(new Date().getFullYear() + 1, 11)}
          />
          <p className="text-xs text-[var(--muted-foreground)]">
            Optional — but it cannot be in the future.
          </p>
        </Field>
      </div>

      <Field data-invalid={draft.description.length > AWARD_DESCRIPTION_MAX ? true : undefined}>
        <div className="flex items-baseline justify-between gap-3">
          <FieldLabel htmlFor="awd-description">Description</FieldLabel>
          <span
            aria-live="polite"
            className={cn(
              'text-xs tabular-nums',
              draft.description.length > AWARD_DESCRIPTION_MAX
                ? 'font-semibold text-[var(--neu-error-text)]'
                : 'text-[var(--muted-foreground)]',
            )}
          >
            {draft.description.length.toLocaleString('en-US')} / {AWARD_DESCRIPTION_MAX.toLocaleString('en-US')}
          </span>
        </div>
        <Textarea
          id="awd-description"
          value={draft.description}
          maxLength={AWARD_DESCRIPTION_MAX}
          rows={4}
          placeholder="What it was for, who chose it, what it came with."
          onChange={(event) => set({ description: event.target.value })}
        />
      </Field>

      <div aria-live="polite">
        {error && (
          <p role="alert" className="text-[13px] font-medium text-[var(--neu-error-text)]">
            {error}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {initial ? 'Save changes' : 'Add award'}
        </Button>
      </div>
    </form>
  )
}

/** One stored award — the inset-tile rhythm the other sections use. */
function EntryCard({
  entry,
  onEdit,
  onRemove,
}: {
  entry: ResumeAwardEntry
  onEdit: () => void
  onRemove: () => void
}) {
  return (
    <li className="rounded-[var(--neu-radius-control)] bg-[var(--neu-surface)] px-4 py-3.5 [background-image:var(--neu-fill-inset)] shadow-[var(--neu-shadow-inset-sm)]">
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
        <div className="flex min-w-0 items-start gap-2.5">
          <HugeiconsIcon icon={MedalIcon} strokeWidth={1.8} aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[var(--neu-accent-ink)]" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--foreground)]">{entry.title}</p>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs tabular-nums text-[var(--muted-foreground)]">
              {entry.dateAwarded && formatResumeDate(entry.dateAwarded)}
              {entry.dateAwarded && entry.issuer && <span aria-hidden="true">·</span>}
              {entry.issuer && <span className="tabular-nums-none font-normal">{entry.issuer}</span>}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={2} data-icon="inline-start" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Remove ${entry.title}`}
            onClick={onRemove}
            className="size-8 text-[var(--muted-foreground)] hover:text-[var(--neu-error-text)]"
          >
            <HugeiconsIcon icon={DeleteIcon} strokeWidth={2} className="size-4" />
          </Button>
        </div>
      </div>

      {entry.description && (
        <p className="mt-2 whitespace-pre-line pl-[26px] text-[13px] leading-relaxed text-[var(--muted-foreground)]">
          {entry.description}
        </p>
      )}
    </li>
  )
}

export function AwardsSection({ resume }: { resume: ResumeItem }) {
  const [formOpen, setFormOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<ResumeAwardEntry | null>(null)

  const ordered = [...resume.awards].sort((a, b) => a.displayOrder - b.displayOrder)

  if (formOpen) {
    return <EntryForm resumeId={resume.id} initial={editing} onDone={() => { setFormOpen(false); setEditing(null) }} />
  }

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex items-center justify-end">
        <Button
          variant="soft"
          size="sm"
          onClick={() => {
            setEditing(null)
            setFormOpen(true)
          }}
          className="shrink-0"
        >
          <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={2} data-icon="inline-start" />
          Add award
        </Button>
      </div>
      {ordered.length > 0 ? (
        <ol className="flex min-w-0 flex-col gap-3">
          {ordered.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              onEdit={() => {
                setEditing(entry)
                setFormOpen(true)
              }}
              onRemove={() => removeAward(resume.id, entry.id)}
            />
          ))}
        </ol>
      ) : (
        <div className="flex flex-col items-center gap-1.5 rounded-[var(--neu-radius-control)] border border-dashed border-[color:var(--border)] px-4 py-8 text-center">
          <p className="text-[13px] font-medium text-[var(--foreground)]">No awards added yet.</p>
          <p className="text-xs text-[var(--muted-foreground)]">
            Competitions, honours, recognitions — the moments that stood out.
          </p>
        </div>
      )}
    </div>
  )
}
