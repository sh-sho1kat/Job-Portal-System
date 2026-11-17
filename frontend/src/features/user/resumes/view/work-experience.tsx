'use client'

import * as React from 'react'

import { HugeiconsIcon } from '@hugeicons/react'
import { DeleteIcon, Location01Icon, PencilEdit02Icon } from '@hugeicons/core-free-icons'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DatePicker } from '@/components/ui/date-picker'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectItem } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { ResumeEmploymentType, ResumeItem, ResumeWorkEntry } from '../data'
import {
  EMPLOYMENT_TYPE_LABEL,
  WORK_DESCRIPTION_MAX,
  WORK_TECHNOLOGIES_MAX,
  WORK_TECHNOLOGY_MAX,
  formatDateRange,
  rangeDuration,
  isoDateToDate,
  dateToIsoDate,
} from '../data'
import {
  addWorkExperience,
  removeWorkExperience,
  updateWorkExperience,
  type WorkExperienceInput,
} from '../store'

/**
 * Work experience — the resume's `WorkExperienceResponse` list under
 * `/api/resumes/{resumeId}/work-experiences`: a collection, so the read
 * view carries per-entry Edit/Remove (`PUT` / `DELETE /{workExperienceId}`)
 * and an Add action (`POST`). The form mirrors `WorkExperienceRequest` —
 * company and position required, `endDate` required unless the role is
 * current, description at most 10,000 characters, at most 30 technologies
 * of 100 characters each.
 */

const HTTP_URL_PATTERN = /^https?:\/\/\S+$/

/** Marks the fields `WorkExperienceRequest` requires. The star is for the
 *  eye only — the inputs' `required` attribute carries the semantics. */
function RequiredStar() {
  return (
    <span aria-hidden="true" className="text-[var(--neu-error-text)]">
      {' '}*
    </span>
  )
}

function emptyEntry(): WorkExperienceInput {
  return {
    companyName: '',
    companyLogoUrl: '',
    position: '',
    employmentType: null,
    address: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    startDate: '',
    endDate: null,
    isCurrentJob: false,
    description: '',
    technologies: [],
    displayOrder: 0,
  }
}

/** Technologies come in as a comma-separated line — the backend stores a
 *  list of at most 30 strings of 100 characters each. */
function parseTechnologies(value: string): string[] {
  return value
    .split(',')
    .map((tech) => tech.trim())
    .filter(Boolean)
}

function EntryForm({
  resumeId,
  initial,
  onDone,
}: {
  resumeId: string
  initial: ResumeWorkEntry | null
  onDone: () => void
}) {
  const [draft, setDraft] = React.useState<WorkExperienceInput>(() =>
    initial ? { ...initial } : emptyEntry(),
  )
  const [techLine, setTechLine] = React.useState(() => (initial ? initial.technologies.join(', ') : ''))
  const [error, setError] = React.useState<string | null>(null)

  const technologies = parseTechnologies(techLine)
  const set = (partial: Partial<WorkExperienceInput>) => {
    setDraft((current) => ({ ...current, ...partial }))
    setError(null)
  }

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault()
    // The same rules `WorkExperienceRequest` enforces server-side.
    if (!draft.companyName.trim()) return setError('Company name is required.')
    if (draft.companyName.length > 150) return setError('Company name must be at most 150 characters.')
    if (!draft.position.trim()) return setError('Position is required.')
    if (draft.position.length > 150) return setError('Position must be at most 150 characters.')
    if (draft.companyLogoUrl) {
      if (!HTTP_URL_PATTERN.test(draft.companyLogoUrl)) return setError('Company logo must be a http(s) URL.')
      if (draft.companyLogoUrl.length > 500) return setError('Company logo URL must be at most 500 characters.')
    }
    if (draft.address.length > 255) return setError('Address must be at most 255 characters.')
    if (draft.city.length > 100 || draft.state.length > 100 || draft.country.length > 100) {
      return setError('City, state, and country must each be at most 100 characters.')
    }
    if (draft.zipCode.length > 20) return setError('Zip code must be at most 20 characters.')
    if (!draft.startDate) return setError('Start date is required.')
    if (!draft.isCurrentJob && !draft.endDate) return setError('End date is required unless this is your current role.')
    if (draft.description.length > WORK_DESCRIPTION_MAX) {
      return setError(`The description must be at most 10,000 characters — it is currently ${draft.description.length.toLocaleString('en-US')}.`)
    }
    if (technologies.length > WORK_TECHNOLOGIES_MAX) {
      return setError(`At most ${WORK_TECHNOLOGIES_MAX} technologies — ${technologies.length} given.`)
    }
    if (technologies.some((tech) => tech.length > WORK_TECHNOLOGY_MAX)) {
      return setError('Each technology must be at most 100 characters.')
    }

    const payload: WorkExperienceInput = { ...draft, technologies }
    if (initial) {
      updateWorkExperience(resumeId, initial.id, payload)
    } else {
      addWorkExperience(resumeId, payload)
    }
    onDone()
  }

  return (
    <form onSubmit={handleSave} noValidate className="flex min-w-0 flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field data-invalid={!draft.companyName.trim() && error ? true : undefined}>
          <FieldLabel htmlFor="work-company">Company name<RequiredStar /></FieldLabel>
          <Input
            id="work-company"
            value={draft.companyName}
            maxLength={150}
            placeholder="Lumen Retail"
            onChange={(event) => set({ companyName: event.target.value })}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="work-position">Position<RequiredStar /></FieldLabel>
          <Input
            id="work-position"
            value={draft.position}
            maxLength={150}
            placeholder="Frontend Developer"
            onChange={(event) => set({ position: event.target.value })}
            required
          />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="work-type">Employment type</FieldLabel>
          <Select
            id="work-type"
            value={draft.employmentType ?? ''}
            onChange={(event) => set({ employmentType: (event.target.value || null) as ResumeEmploymentType | null })}
          >
            <SelectItem value="">Not specified</SelectItem>
            {(Object.keys(EMPLOYMENT_TYPE_LABEL) as ResumeEmploymentType[]).map((type) => (
              <SelectItem key={type} value={type}>
                {EMPLOYMENT_TYPE_LABEL[type]}
              </SelectItem>
            ))}
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="work-logo">Company logo URL</FieldLabel>
          <Input
            id="work-logo"
            type="url"
            value={draft.companyLogoUrl}
            maxLength={500}
            placeholder="https://…"
            onChange={(event) => set({ companyLogoUrl: event.target.value })}
          />
        </Field>
      </div>

      {/* The dates — current roles clear and disable the end date, exactly
          the backend's "required when isCurrentJob is not true". */}
      <div className="grid gap-4 sm:grid-cols-3 sm:items-start">
        <Field>
          <FieldLabel htmlFor="work-start">Start date<RequiredStar /></FieldLabel>
          <DatePicker
            id="work-start"
            label="Start date"
            value={isoDateToDate(draft.startDate)}
            onValueChange={(date) => set({ startDate: date ? dateToIsoDate(date) : '' })}
            endMonth={new Date(new Date().getFullYear() + 1, 11)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="work-end">End date<RequiredStar /></FieldLabel>
          <DatePicker
            id="work-end"
            label="End date"
            value={isoDateToDate(draft.endDate ?? '')}
            onValueChange={(date) => set({ endDate: date ? dateToIsoDate(date) : null })}
            disabled={draft.isCurrentJob}
            endMonth={new Date(new Date().getFullYear() + 1, 11)}
          />
        </Field>
        <label htmlFor="work-current" className="flex cursor-pointer items-center gap-2 self-end pb-2.5 text-sm text-[var(--foreground)]">
          <Checkbox
            id="work-current"
            checked={draft.isCurrentJob}
            onCheckedChange={(checked) =>
              set({ isCurrentJob: checked === true, endDate: checked === true ? null : draft.endDate })
            }
          />
          Current role
        </label>
      </div>

      {/* Location — the same embeddable shape the job service uses. */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="work-address">Address</FieldLabel>
          <Input
            id="work-address"
            value={draft.address}
            maxLength={255}
            onChange={(event) => set({ address: event.target.value })}
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="work-city">City</FieldLabel>
            <Input
              id="work-city"
              value={draft.city}
              maxLength={100}
              onChange={(event) => set({ city: event.target.value })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="work-zip">Zip code</FieldLabel>
            <Input
              id="work-zip"
              value={draft.zipCode}
              maxLength={20}
              onChange={(event) => set({ zipCode: event.target.value })}
            />
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="work-state">State</FieldLabel>
          <Input
            id="work-state"
            value={draft.state}
            maxLength={100}
            onChange={(event) => set({ state: event.target.value })}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="work-country">Country</FieldLabel>
          <Input
            id="work-country"
            value={draft.country}
            maxLength={100}
            onChange={(event) => set({ country: event.target.value })}
          />
        </Field>
      </div>

      <Field data-invalid={error && draft.description.length > WORK_DESCRIPTION_MAX ? true : undefined}>
        <div className="flex items-baseline justify-between gap-3">
          <FieldLabel htmlFor="work-description">What you did</FieldLabel>
          <span
            aria-live="polite"
            className={cn(
              'text-xs tabular-nums',
              draft.description.length > WORK_DESCRIPTION_MAX
                ? 'font-semibold text-[var(--neu-error-text)]'
                : 'text-[var(--muted-foreground)]',
            )}
          >
            {draft.description.length.toLocaleString('en-US')} / {WORK_DESCRIPTION_MAX.toLocaleString('en-US')}
          </span>
        </div>
        <Textarea
          id="work-description"
          value={draft.description}
          maxLength={WORK_DESCRIPTION_MAX}
          rows={5}
          placeholder="Rough notes are fine — what you owned, what changed, what it moved."
          onChange={(event) => {
            set({ description: event.target.value })
          }}
        />
      </Field>

      <Field data-invalid={technologies.length > WORK_TECHNOLOGIES_MAX ? true : undefined}>
        <FieldLabel htmlFor="work-tech">Technologies</FieldLabel>
        <Input
          id="work-tech"
          value={techLine}
          onChange={(event) => {
            setTechLine(event.target.value)
            setError(null)
          }}
          placeholder="React, TypeScript, Playwright"
        />
        {technologies.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {technologies.map((tech, index) => (
              <Badge key={`${tech}-${index}`} variant="soft" className="rounded-full px-2.5 py-0.5 text-xs">
                {tech}
              </Badge>
            ))}
          </div>
        )}
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
          {initial ? 'Save changes' : 'Add experience'}
        </Button>
      </div>
    </form>
  )
}

/** One stored role — the inset-tile rhythm the other sections use. */
function EntryCard({
  entry,
  onEdit,
  onRemove,
}: {
  entry: ResumeWorkEntry
  onEdit: () => void
  onRemove: () => void
}) {
  const location = [entry.city, entry.country].filter(Boolean).join(', ')
  return (
    <li className="rounded-[var(--neu-radius-control)] bg-[var(--neu-surface)] px-4 py-3.5 [background-image:var(--neu-fill-inset)] shadow-[var(--neu-shadow-inset-sm)]">
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            {entry.position}
            <span className="font-normal text-[var(--muted-foreground)]"> · {entry.companyName}</span>
          </p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs tabular-nums text-[var(--muted-foreground)]">
            {formatDateRange(entry.startDate, entry.endDate, entry.isCurrentJob)}
            <span aria-hidden="true">·</span>
            {rangeDuration(entry.startDate, entry.endDate, entry.isCurrentJob)}
            {entry.employmentType && (
              <>
                <span aria-hidden="true">·</span>
                {EMPLOYMENT_TYPE_LABEL[entry.employmentType]}
              </>
            )}
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
            aria-label={`Remove ${entry.position} at ${entry.companyName}`}
            onClick={onRemove}
            className="size-8 text-[var(--muted-foreground)] hover:text-[var(--neu-error-text)]"
          >
            <HugeiconsIcon icon={DeleteIcon} strokeWidth={2} className="size-4" />
          </Button>
        </div>
      </div>

      {location && (
        <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-[var(--muted-foreground)]">
          <HugeiconsIcon icon={Location01Icon} strokeWidth={1.8} aria-hidden="true" className="size-3.5" />
          {location}
        </p>
      )}

      {entry.description && (
        <p className="mt-2 whitespace-pre-line text-[13px] leading-relaxed text-[var(--muted-foreground)]">
          {entry.description}
        </p>
      )}

      {entry.technologies.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {entry.technologies.map((tech, index) => (
            <Badge key={`${tech}-${index}`} variant="soft" className="rounded-full px-2.5 py-0.5 text-xs">
              {tech}
            </Badge>
          ))}
        </div>
      )}
    </li>
  )
}

export function WorkExperienceSection({ resume }: { resume: ResumeItem }) {
  const [formOpen, setFormOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<ResumeWorkEntry | null>(null)
  // Removals are immediate (the backend soft-deletes); no confirm dialog.
  const remove = (workId: string) => removeWorkExperience(resume.id, workId)

  const ordered = [...resume.work].sort(
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
          Add experience
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
          <p className="text-[13px] font-medium text-[var(--foreground)]">No work experience added yet.</p>
          <p className="text-xs text-[var(--muted-foreground)]">
            Start with your current or most recent role — recruiters read top down.
          </p>
        </div>
      )}
    </div>
  )
}
