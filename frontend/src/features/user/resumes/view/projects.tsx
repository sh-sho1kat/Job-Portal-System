'use client'

import * as React from 'react'

import { HugeiconsIcon } from '@hugeicons/react'
import { DeleteIcon, Link01Icon, PencilEdit02Icon, SourceCodeIcon } from '@hugeicons/core-free-icons'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { DatePicker } from '@/components/ui/date-picker'
import { cn } from '@/lib/utils'
import type { ResumeItem, ResumeProjectEntry } from '../data'
import {
  HTTP_URL_PATTERN,
  PROJECT_DESCRIPTION_MAX,
  PROJECT_TECHNOLOGIES_MAX,
  PROJECT_TECH_MAX,
  PROJECT_URL_MAX,
  formatDateRange,
  isoDateToDate,
  dateToIsoDate,
  rangeDuration,
} from '../data'
import { addProject, removeProject, updateProject, type ProjectInput } from '../store'

/**
 * Projects — the resume's `ProjectResponse` list under
 * `/api/resumes/{resumeId}/projects`: a collection, so the read view
 * carries per-entry Edit/Remove (`PUT` / `DELETE /{projectId}`) and an Add
 * action (`POST`). The form mirrors `ProjectRequest` — title required
 * (≤150), description ≤10000, at most 30 technologies of ≤100 characters,
 * both URLs http(s) and ≤500, and an optional end date: the backend
 * derives `isOngoing` from an omitted end date. There is no AI assist
 * here: the ai-service exposes no projects endpoint.
 */

function parseTechnologies(raw: string): string[] {
  return raw
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
}

function emptyInput(): ProjectInput {
  return {
    title: '',
    description: '',
    technologies: [],
    projectUrl: '',
    sourceCodeUrl: '',
    startDate: '',
    endDate: null,
    isOngoing: false,
    displayOrder: 0,
  }
}

/** Marks the fields `ProjectRequest` requires. The star is for the eye
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
  initial: ResumeProjectEntry | null
  onDone: () => void
}) {
  const [draft, setDraft] = React.useState<ProjectInput>(() =>
    initial ? { ...initial } : emptyInput(),
  )
  const [techDraft, setTechDraft] = React.useState(() =>
    initial ? initial.technologies.join(', ') : '',
  )
  const [error, setError] = React.useState<string | null>(null)

  const set = (partial: Partial<ProjectInput>) => {
    setDraft((current) => ({ ...current, ...partial }))
    setError(null)
  }

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault()
    // The same rules `ProjectRequest` enforces server-side.
    const technologies = parseTechnologies(techDraft)
    if (!draft.title.trim()) return setError('Title is required.')
    if (draft.title.length > 150) return setError('Title must be at most 150 characters.')
    if (draft.description.length > PROJECT_DESCRIPTION_MAX) {
      return setError(`The description must be at most 10,000 characters — it is currently ${draft.description.length.toLocaleString('en-US')}.`)
    }
    if (technologies.length > PROJECT_TECHNOLOGIES_MAX) {
      return setError(`At most ${PROJECT_TECHNOLOGIES_MAX} technologies — you listed ${technologies.length}.`)
    }
    if (technologies.some((tech) => tech.length > PROJECT_TECH_MAX)) {
      return setError(`Each technology must be at most ${PROJECT_TECH_MAX} characters.`)
    }
    for (const [label, url] of [
      ['Project link', draft.projectUrl],
      ['Source code link', draft.sourceCodeUrl],
    ] as const) {
      if (url && (!HTTP_URL_PATTERN.test(url) || url.length > PROJECT_URL_MAX)) {
        return setError(`${label} must be a http(s) URL of at most ${PROJECT_URL_MAX} characters.`)
      }
    }
    if (!draft.startDate) return setError('Start date is required.')
    // The backend treats an omitted end date as ongoing — so with the
    // checkbox off, the date is required or the record would silently
    // read as ongoing.
    if (!draft.isOngoing && !draft.endDate) {
      return setError('End date is required unless the project is ongoing.')
    }

    if (initial) {
      updateProject(resumeId, initial.id, { ...draft, technologies })
    } else {
      addProject(resumeId, { ...draft, technologies })
    }
    onDone()
  }

  return (
    <form onSubmit={handleSave} noValidate className="flex min-w-0 flex-col gap-5">
      <Field>
        <FieldLabel htmlFor="prj-title">Title<RequiredStar /></FieldLabel>
        <Input
          id="prj-title"
          value={draft.title}
          maxLength={150}
          placeholder="Checkout rebuild — Lumen Retail"
          onChange={(event) => set({ title: event.target.value })}
          required
        />
      </Field>

      <Field data-invalid={draft.description.length > PROJECT_DESCRIPTION_MAX ? true : undefined}>
        <div className="flex items-baseline justify-between gap-3">
          <FieldLabel htmlFor="prj-description">Description</FieldLabel>
          <span
            aria-live="polite"
            className={cn(
              'text-xs tabular-nums',
              draft.description.length > PROJECT_DESCRIPTION_MAX
                ? 'font-semibold text-[var(--neu-error-text)]'
                : 'text-[var(--muted-foreground)]',
            )}
          >
            {draft.description.length.toLocaleString('en-US')} / {PROJECT_DESCRIPTION_MAX.toLocaleString('en-US')}
          </span>
        </div>
        <Textarea
          id="prj-description"
          value={draft.description}
          maxLength={PROJECT_DESCRIPTION_MAX}
          rows={4}
          placeholder="What it does, what you owned, what it changed."
          onChange={(event) => set({ description: event.target.value })}
        />
      </Field>

      <Field data-invalid={parseTechnologies(techDraft).length > PROJECT_TECHNOLOGIES_MAX ? true : undefined}>
        <FieldLabel htmlFor="prj-tech">Technologies</FieldLabel>
        <Input
          id="prj-tech"
          value={techDraft}
          placeholder="React, TypeScript, Vite"
          onChange={(event) => {
            setTechDraft(event.target.value)
            setError(null)
          }}
        />
        {parseTechnologies(techDraft).length > 0 && (
          <ul className="flex min-w-0 flex-wrap gap-1.5">
            {parseTechnologies(techDraft).map((tech, index) => (
              <li
                key={`${tech}-${index}`}
                className="rounded-full bg-[var(--neu-surface)] px-2.5 py-0.5 text-xs font-medium text-[var(--muted-foreground)] [background-image:var(--neu-fill-raised)] shadow-[var(--neu-shadow-raised-sm)]"
              >
                {tech}
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs text-[var(--muted-foreground)]">
          Comma-separated — at most {PROJECT_TECHNOLOGIES_MAX}.
        </p>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="prj-project-url">Project link</FieldLabel>
          <Input
            id="prj-project-url"
            type="url"
            value={draft.projectUrl}
            maxLength={PROJECT_URL_MAX}
            placeholder="https://example.com"
            onChange={(event) => set({ projectUrl: event.target.value })}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="prj-source-url">Source code link</FieldLabel>
          <Input
            id="prj-source-url"
            type="url"
            value={draft.sourceCodeUrl}
            maxLength={PROJECT_URL_MAX}
            placeholder="https://github.com/you/repo"
            onChange={(event) => set({ sourceCodeUrl: event.target.value })}
          />
        </Field>
      </div>

      {/* Dates — ticking Ongoing clears and disables the end date, which is
          exactly the backend's "ongoing when endDate is omitted". */}
      <div className="grid gap-4 sm:grid-cols-3 sm:items-start">
        <Field>
          <FieldLabel htmlFor="prj-start">Start date<RequiredStar /></FieldLabel>
          <DatePicker
            id="prj-start"
            label="Start date"
            value={isoDateToDate(draft.startDate)}
            onValueChange={(date) => set({ startDate: date ? dateToIsoDate(date) : '' })}
            endMonth={new Date(new Date().getFullYear() + 1, 11)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="prj-end">End date<RequiredStar /></FieldLabel>
          <DatePicker
            id="prj-end"
            label="End date"
            value={isoDateToDate(draft.endDate ?? '')}
            onValueChange={(date) => set({ endDate: date ? dateToIsoDate(date) : null })}
            disabled={draft.isOngoing}
            endMonth={new Date(new Date().getFullYear() + 1, 11)}
          />
        </Field>
        <label htmlFor="prj-ongoing" className="flex cursor-pointer items-center gap-2 self-end pb-2.5 text-sm text-[var(--foreground)]">
          <Checkbox
            id="prj-ongoing"
            checked={draft.isOngoing}
            onCheckedChange={(checked) =>
              set({ isOngoing: checked === true, endDate: checked === true ? null : draft.endDate })
            }
          />
          Ongoing
        </label>
      </div>

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
          {initial ? 'Save changes' : 'Add project'}
        </Button>
      </div>
    </form>
  )
}

/** One stored project — the inset-tile rhythm the other sections use. */
function EntryCard({
  entry,
  onEdit,
  onRemove,
}: {
  entry: ResumeProjectEntry
  onEdit: () => void
  onRemove: () => void
}) {
  return (
    <li className="rounded-[var(--neu-radius-control)] bg-[var(--neu-surface)] px-4 py-3.5 [background-image:var(--neu-fill-inset)] shadow-[var(--neu-shadow-inset-sm)]">
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--foreground)]">{entry.title}</p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs tabular-nums text-[var(--muted-foreground)]">
            {formatDateRange(entry.startDate, entry.endDate, entry.isOngoing)}
            <span aria-hidden="true">·</span>
            {rangeDuration(entry.startDate, entry.endDate, entry.isOngoing)}
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
            aria-label={`Remove ${entry.title}`}
            onClick={onRemove}
            className="size-8 text-[var(--muted-foreground)] hover:text-[var(--neu-error-text)]"
          >
            <HugeiconsIcon icon={DeleteIcon} strokeWidth={2} className="size-4" />
          </Button>
        </div>
      </div>

      {entry.description && (
        <p className="mt-2 whitespace-pre-line text-[13px] leading-relaxed text-[var(--muted-foreground)]">
          {entry.description}
        </p>
      )}

      {entry.technologies.length > 0 && (
        <ul className="mt-2.5 flex min-w-0 flex-wrap gap-1.5">
          {entry.technologies.map((tech) => (
            <li
              key={tech}
              className="rounded-full bg-[var(--neu-surface)] px-2.5 py-0.5 text-xs font-medium text-[var(--muted-foreground)] [background-image:var(--neu-fill-raised)] shadow-[var(--neu-shadow-raised-sm)]"
            >
              {tech}
            </li>
          ))}
        </ul>
      )}

      {(entry.projectUrl || entry.sourceCodeUrl) && (
        <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
          {entry.projectUrl && (
            <a
              href={entry.projectUrl}
              target="_blank"
              rel="noreferrer"
              className="flex min-w-0 items-center gap-1.5 truncate text-xs font-medium text-[var(--neu-accent-ink)] hover:underline"
            >
              <HugeiconsIcon icon={Link01Icon} strokeWidth={1.8} aria-hidden="true" className="size-3.5 shrink-0" />
              <span className="truncate">{entry.projectUrl}</span>
            </a>
          )}
          {entry.sourceCodeUrl && (
            <a
              href={entry.sourceCodeUrl}
              target="_blank"
              rel="noreferrer"
              className="flex min-w-0 items-center gap-1.5 truncate text-xs font-medium text-[var(--neu-accent-ink)] hover:underline"
            >
              <HugeiconsIcon icon={SourceCodeIcon} strokeWidth={1.8} aria-hidden="true" className="size-3.5 shrink-0" />
              <span className="truncate">{entry.sourceCodeUrl}</span>
            </a>
          )}
        </div>
      )}

      {entry.isOngoing && (
        <Badge variant="success" className="mt-2.5 rounded-full px-2.5 py-0.5 text-xs font-semibold">
          Ongoing
        </Badge>
      )}
    </li>
  )
}

export function ProjectsSection({ resume }: { resume: ResumeItem }) {
  const [formOpen, setFormOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<ResumeProjectEntry | null>(null)

  const ordered = [...resume.projects].sort((a, b) => a.displayOrder - b.displayOrder)

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
          Add project
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
              onRemove={() => removeProject(resume.id, entry.id)}
            />
          ))}
        </ol>
      ) : (
        <div className="flex flex-col items-center gap-1.5 rounded-[var(--neu-radius-control)] border border-dashed border-[color:var(--border)] px-4 py-8 text-center">
          <p className="text-[13px] font-medium text-[var(--foreground)]">No projects added yet.</p>
          <p className="text-xs text-[var(--muted-foreground)]">
            Built things that show how you work — links welcome.
          </p>
        </div>
      )}
    </div>
  )
}
