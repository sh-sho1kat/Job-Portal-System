'use client'

import * as React from 'react'

import { HugeiconsIcon } from '@hugeicons/react'
import { DeleteIcon, GraduationCapIcon, PencilEdit02Icon } from '@hugeicons/core-free-icons'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DatePicker } from '@/components/ui/date-picker'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { ResumeEducationEntry, ResumeItem } from '../data'
import {
  EDUCATION_DESCRIPTION_MAX,
  formatDateRange,
  isoDateToDate,
  dateToIsoDate,
  rangeDuration,
} from '../data'
import {
  addEducation,
  removeEducation,
  updateEducation,
  type EducationInput,
} from '../store'

/**
 * Education — the resume's `EducationResponse` list under
 * `/api/resumes/{resumeId}/educations`: a collection, so the read view
 * carries per-entry Edit/Remove (`PUT` / `DELETE /{educationId}`) and an
 * Add action (`POST`). The form mirrors `EducationRequest` — institution
 * and degree required, `endDate` required unless currently studying,
 * description at most 5000 characters. There is no AI assist here: the
 * ai-service exposes no education endpoint.
 */

function emptyEntry(): EducationInput {
  return {
    institutionName: '',
    degree: '',
    fieldOfStudy: '',
    grade: '',
    startDate: '',
    endDate: null,
    isCurrentlyStudying: false,
    description: '',
    displayOrder: 0,
  }
}

/** Marks the fields `EducationRequest` requires. The star is for the eye
 *  only — the inputs' `required` attribute carries the semantics. */
function RequiredStar() {
  return (
    <span aria-hidden="true" className="text-[var(--neu-error-text)]">
      {' '}*
    </span>
  )
}

function EntryForm({
  resumeId,
  initial,
  onDone,
}: {
  resumeId: string
  initial: ResumeEducationEntry | null
  onDone: () => void
}) {
  const [draft, setDraft] = React.useState<EducationInput>(() =>
    initial ? { ...initial } : emptyEntry(),
  )
  const [error, setError] = React.useState<string | null>(null)

  const set = (partial: Partial<EducationInput>) => {
    setDraft((current) => ({ ...current, ...partial }))
    setError(null)
  }

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault()
    // The same rules `EducationRequest` enforces server-side.
    if (!draft.institutionName.trim()) return setError('Institution name is required.')
    if (draft.institutionName.length > 150) return setError('Institution name must be at most 150 characters.')
    if (!draft.degree.trim()) return setError('Degree is required.')
    if (draft.degree.length > 100) return setError('Degree must be at most 100 characters.')
    if (draft.fieldOfStudy.length > 100) return setError('Field of study must be at most 100 characters.')
    if (draft.grade.length > 100) return setError('Grade must be at most 100 characters.')
    if (!draft.startDate) return setError('Start date is required.')
    if (!draft.isCurrentlyStudying && !draft.endDate) {
      return setError('End date is required unless you are currently studying.')
    }
    if (draft.description.length > EDUCATION_DESCRIPTION_MAX) {
      return setError(`The description must be at most 5,000 characters — it is currently ${draft.description.length.toLocaleString('en-US')}.`)
    }

    if (initial) {
      updateEducation(resumeId, initial.id, draft)
    } else {
      addEducation(resumeId, draft)
    }
    onDone()
  }

  return (
    <form onSubmit={handleSave} noValidate className="flex min-w-0 flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="edu-institution">Institution name<RequiredStar /></FieldLabel>
          <Input
            id="edu-institution"
            value={draft.institutionName}
            maxLength={150}
            placeholder="Islamic University of Technology"
            onChange={(event) => set({ institutionName: event.target.value })}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="edu-degree">Degree<RequiredStar /></FieldLabel>
          <Input
            id="edu-degree"
            value={draft.degree}
            maxLength={100}
            placeholder="B.Sc. Engineering"
            onChange={(event) => set({ degree: event.target.value })}
            required
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="edu-field">Field of study</FieldLabel>
          <Input
            id="edu-field"
            value={draft.fieldOfStudy}
            maxLength={100}
            placeholder="Computer Science & Engineering"
            onChange={(event) => set({ fieldOfStudy: event.target.value })}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="edu-grade">Grade</FieldLabel>
          <Input
            id="edu-grade"
            value={draft.grade}
            maxLength={100}
            placeholder="3.71"
            onChange={(event) => set({ grade: event.target.value })}
          />
        </Field>
      </div>

      {/* The dates — current studies clear and disable the end date, exactly
          the backend's "required when isCurrentlyStudying is not true". */}
      <div className="grid gap-4 sm:grid-cols-3 sm:items-start">
        <Field>
          <FieldLabel htmlFor="edu-start">Start date<RequiredStar /></FieldLabel>
          <DatePicker
            id="edu-start"
            label="Start date"
            value={isoDateToDate(draft.startDate)}
            onValueChange={(date) => set({ startDate: date ? dateToIsoDate(date) : '' })}
            endMonth={new Date(new Date().getFullYear() + 1, 11)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="edu-end">End date<RequiredStar /></FieldLabel>
          <DatePicker
            id="edu-end"
            label="End date"
            value={isoDateToDate(draft.endDate ?? '')}
            onValueChange={(date) => set({ endDate: date ? dateToIsoDate(date) : null })}
            disabled={draft.isCurrentlyStudying}
            endMonth={new Date(new Date().getFullYear() + 1, 11)}
          />
        </Field>
        <label htmlFor="edu-current" className="flex cursor-pointer items-center gap-2 self-end pb-2.5 text-sm text-[var(--foreground)]">
          <Checkbox
            id="edu-current"
            checked={draft.isCurrentlyStudying}
            onCheckedChange={(checked) =>
              set({ isCurrentlyStudying: checked === true, endDate: checked === true ? null : draft.endDate })
            }
          />
          Currently studying
        </label>
      </div>

      <Field data-invalid={draft.description.length > EDUCATION_DESCRIPTION_MAX ? true : undefined}>
        <div className="flex items-baseline justify-between gap-3">
          <FieldLabel htmlFor="edu-description">Notes</FieldLabel>
          <span
            aria-live="polite"
            className={cn(
              'text-xs tabular-nums',
              draft.description.length > EDUCATION_DESCRIPTION_MAX
                ? 'font-semibold text-[var(--neu-error-text)]'
                : 'text-[var(--muted-foreground)]',
            )}
          >
            {draft.description.length.toLocaleString('en-US')} / {EDUCATION_DESCRIPTION_MAX.toLocaleString('en-US')}
          </span>
        </div>
        <Textarea
          id="edu-description"
          value={draft.description}
          maxLength={EDUCATION_DESCRIPTION_MAX}
          rows={4}
          placeholder="Thesis, honours, activities — anything a recruiter would ask about."
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
          {initial ? 'Save changes' : 'Add education'}
        </Button>
      </div>
    </form>
  )
}

/** One stored entry — the inset-tile rhythm the other sections use. */
function EntryCard({
  entry,
  onEdit,
  onRemove,
}: {
  entry: ResumeEducationEntry
  onEdit: () => void
  onRemove: () => void
}) {
  return (
    <li className="rounded-[var(--neu-radius-control)] bg-[var(--neu-surface)] px-4 py-3.5 [background-image:var(--neu-fill-inset)] shadow-[var(--neu-shadow-inset-sm)]">
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            {entry.degree}
            {entry.fieldOfStudy && (
              <span className="font-normal text-[var(--muted-foreground)]"> · {entry.fieldOfStudy}</span>
            )}
          </p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs tabular-nums text-[var(--muted-foreground)]">
            {formatDateRange(entry.startDate, entry.endDate, entry.isCurrentlyStudying)}
            <span aria-hidden="true">·</span>
            {rangeDuration(entry.startDate, entry.endDate, entry.isCurrentlyStudying)}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={2} data-icon="inline-start" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Remove ${entry.degree} at ${entry.institutionName}`}
            onClick={onRemove}
            className="size-8 text-[var(--muted-foreground)] hover:text-[var(--neu-error-text)]"
          >
            <HugeiconsIcon icon={DeleteIcon} strokeWidth={2} className="size-4" />
          </Button>
        </div>
      </div>

      <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-[var(--muted-foreground)]">
        <HugeiconsIcon icon={GraduationCapIcon} strokeWidth={1.8} aria-hidden="true" className="size-3.5" />
        {entry.institutionName}
        {entry.grade && (
          <>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{entry.grade}</span>
          </>
        )}
      </p>

      {entry.isCurrentlyStudying && (
        <Badge variant="success" className="mt-2 rounded-full px-2.5 py-0.5 text-xs font-semibold">
          Current
        </Badge>
      )}

      {entry.description && (
        <p className="mt-2 whitespace-pre-line text-[13px] leading-relaxed text-[var(--muted-foreground)]">
          {entry.description}
        </p>
      )}
    </li>
  )
}

export function EducationSection({ resume }: { resume: ResumeItem }) {
  const [formOpen, setFormOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<ResumeEducationEntry | null>(null)
  // Removals are immediate (the backend soft-deletes); no confirm dialog.
  const remove = (educationId: string) => removeEducation(resume.id, educationId)

  const ordered = [...resume.education].sort(
    (a, b) => a.displayOrder - b.displayOrder || new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
  )

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
          Add education
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
              onRemove={() => remove(entry.id)}
            />
          ))}
        </ol>
      ) : (
        <div className="flex flex-col items-center gap-1.5 rounded-[var(--neu-radius-control)] border border-dashed border-[color:var(--border)] px-4 py-8 text-center">
          <p className="text-[13px] font-medium text-[var(--foreground)]">No education added yet.</p>
          <p className="text-xs text-[var(--muted-foreground)]">
            Degrees and schools — most recent first is the convention.
          </p>
        </div>
      )}
    </div>
  )
}
