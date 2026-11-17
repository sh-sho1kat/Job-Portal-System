'use client'

import * as React from 'react'

import { HugeiconsIcon } from '@hugeicons/react'
import { DeleteIcon, PencilEdit02Icon, PlusSignIcon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectItem } from '@/components/ui/select'
import type { ResumeItem, ResumeLanguageEntry, ResumeLanguageProficiency } from '../data'
import { LANGUAGE_NAME_MAX, LANGUAGE_PROFICIENCY_LABEL } from '../data'
import { addLanguage, removeLanguage, updateLanguage, type LanguageInput } from '../store'

/**
 * Languages — the resume's `LanguageProficiencyResponse` list under
 * `/api/resumes/{resumeId}/languages`: a collection, so the read view
 * carries per-entry Edit/Remove (`PUT` / `DELETE /{languageId}`) and an
 * Add action (`POST`). The form mirrors `LanguageProficiencyRequest` —
 * language required (≤100), proficiency required (the four enum levels).
 * There is no AI assist here: the ai-service exposes no languages
 * endpoint.
 */

const PROFICIENCY_ORDER: ResumeLanguageProficiency[] = [
  'BASIC',
  'CONVERSATIONAL',
  'FLUENT',
  'NATIVE',
]

/** Marks the fields `LanguageProficiencyRequest` requires. The star is for
 *  the eye only — the inputs' `required` attribute carries the semantics. */
function RequiredStar() {
  return (
    <span aria-hidden="true" className="text-[var(--neu-error-text)]">
      {' '}*
    </span>
  )
}

function emptyInput(): LanguageInput {
  return { language: '', proficiency: 'CONVERSATIONAL', displayOrder: 0 }
}

function LanguageForm({
  resumeId,
  initial,
  onDone,
}: {
  resumeId: string
  initial: ResumeLanguageEntry | null
  onDone: () => void
}) {
  const [draft, setDraft] = React.useState<LanguageInput>(() =>
    initial ? { ...initial } : emptyInput(),
  )
  const [error, setError] = React.useState<string | null>(null)

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault()
    // The same rules `LanguageProficiencyRequest` enforces server-side.
    const language = draft.language.trim()
    if (!language) return setError('Language is required.')
    if (language.length > LANGUAGE_NAME_MAX) {
      return setError(`The language must be at most ${LANGUAGE_NAME_MAX} characters.`)
    }

    if (initial) {
      updateLanguage(resumeId, initial.id, { ...draft, language })
    } else {
      addLanguage(resumeId, { ...draft, language })
    }
    onDone()
  }

  return (
    <form onSubmit={handleSave} noValidate className="flex min-w-0 flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2 sm:items-start">
        <Field>
          <FieldLabel htmlFor="lang-name">Language<RequiredStar /></FieldLabel>
          <Input
            id="lang-name"
            value={draft.language}
            maxLength={LANGUAGE_NAME_MAX}
            placeholder="Bengali"
            onChange={(event) => {
              setDraft((current) => ({ ...current, language: event.target.value }))
              setError(null)
            }}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="lang-proficiency">Proficiency<RequiredStar /></FieldLabel>
          <Select
            id="lang-proficiency"
            value={draft.proficiency}
            required
            onChange={(event) =>
              setDraft((current) => ({ ...current, proficiency: event.target.value as ResumeLanguageProficiency }))
            }
          >
            {PROFICIENCY_ORDER.map((level) => (
              <SelectItem key={level} value={level}>
                {LANGUAGE_PROFICIENCY_LABEL[level]}
              </SelectItem>
            ))}
          </Select>
        </Field>
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
          {initial ? 'Save changes' : 'Add language'}
        </Button>
      </div>
    </form>
  )
}

/** One stored language — the quiet-row rhythm the skills section uses. */
function LanguageRow({
  entry,
  onEdit,
  onRemove,
}: {
  entry: ResumeLanguageEntry
  onEdit: () => void
  onRemove: () => void
}) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-[var(--neu-radius-control)] bg-[var(--neu-surface)] px-4 py-3 [background-image:var(--neu-fill-inset)] shadow-[var(--neu-shadow-inset-sm)]">
      <div className="flex min-w-0 flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
        <p className="text-sm font-semibold text-[var(--foreground)]">{entry.language}</p>
        <span
          className={cnProficiency(entry.proficiency)}
        >
          {LANGUAGE_PROFICIENCY_LABEL[entry.proficiency]}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={2} data-icon="inline-start" />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Remove ${entry.language}`}
          onClick={onRemove}
          className="size-8 text-[var(--muted-foreground)] hover:text-[var(--neu-error-text)]"
        >
          <HugeiconsIcon icon={DeleteIcon} strokeWidth={2} className="size-4" />
        </Button>
      </div>
    </li>
  )
}

/** Proficiency shading — quiet steps of the same accent, no rainbow. */
function cnProficiency(proficiency: ResumeLanguageProficiency): string {
  switch (proficiency) {
    case 'BASIC':
      return 'text-xs text-[var(--muted-foreground)]'
    case 'CONVERSATIONAL':
      return 'text-xs text-[var(--foreground)]'
    case 'FLUENT':
    case 'NATIVE':
      return 'text-xs font-semibold text-[var(--neu-accent-ink)]'
  }
}

export function LanguagesSection({ resume }: { resume: ResumeItem }) {
  const [formOpen, setFormOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<ResumeLanguageEntry | null>(null)

  const ordered = [...resume.languages].sort((a, b) => a.displayOrder - b.displayOrder)

  if (formOpen) {
    return <LanguageForm resumeId={resume.id} initial={editing} onDone={() => { setFormOpen(false); setEditing(null) }} />
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
          <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} data-icon="inline-start" />
          Add language
        </Button>
      </div>
      {ordered.length > 0 ? (
        <ul className="flex min-w-0 flex-col gap-2.5">
          {ordered.map((entry) => (
            <LanguageRow
              key={entry.id}
              entry={entry}
              onEdit={() => {
                setEditing(entry)
                setFormOpen(true)
              }}
              onRemove={() => removeLanguage(resume.id, entry.id)}
            />
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-1.5 rounded-[var(--neu-radius-control)] border border-dashed border-[color:var(--border)] px-4 py-8 text-center">
          <p className="text-[13px] font-medium text-[var(--foreground)]">No languages added yet.</p>
          <p className="text-xs text-[var(--muted-foreground)]">
            What you speak and how well — from basic to native.
          </p>
        </div>
      )}
    </div>
  )
}
