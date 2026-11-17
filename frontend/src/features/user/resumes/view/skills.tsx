'use client'

import * as React from 'react'

import { HugeiconsIcon } from '@hugeicons/react'
import { DeleteIcon, PencilEdit02Icon, PlusSignIcon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectItem } from '@/components/ui/select'
import type { ResumeItem, ResumeProficiencyLevel, ResumeSkillEntry } from '../data'
import { PROFICIENCY_LABEL, SKILL_NAME_MAX, SKILL_YEARS_MAX } from '../data'
import { addSkill, removeSkill, updateSkill, type SkillInput } from '../store'

/**
 * Skills — the resume's `ResumeSkillResponse` list under
 * `/api/resumes/{resumeId}/skills`: a collection, so the read view carries
 * per-entry Edit/Remove (`PUT` / `DELETE /{skillId}`) and an Add action
 * (`POST`). The form mirrors `ResumeSkillRequest` — name required (≤100),
 * proficiency required (the four enum levels), years optional (0–50).
 * There is no AI assist here: the ai-service exposes no skills endpoint.
 */

const PROFICIENCY_ORDER: ResumeProficiencyLevel[] = [
  'BEGINNER',
  'INTERMEDIATE',
  'ADVANCED',
  'EXPERT',
]

/** Proficiency shading — quiet steps of the same accent, no rainbow. */
const PROFICIENCY_CLASS: Record<ResumeProficiencyLevel, string> = {
  BEGINNER: 'text-[var(--muted-foreground)]',
  INTERMEDIATE: 'text-[var(--foreground)]',
  ADVANCED: 'font-semibold text-[var(--neu-accent-ink)]',
  EXPERT: 'font-semibold text-[var(--neu-accent-ink)]',
}

function emptyInput(): SkillInput {
  return { skillName: '', proficiencyLevel: 'INTERMEDIATE', yearsOfExperience: null, displayOrder: 0 }
}

function SkillForm({
  resumeId,
  initial,
  onDone,
}: {
  resumeId: string
  initial: ResumeSkillEntry | null
  onDone: () => void
}) {
  const [draft, setDraft] = React.useState<SkillInput>(() =>
    initial ? { ...initial } : emptyInput(),
  )
  const [error, setError] = React.useState<string | null>(null)

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault()
    // The same rules `ResumeSkillRequest` enforces server-side.
    const name = draft.skillName.trim()
    if (!name) return setError('Skill name is required.')
    if (name.length > SKILL_NAME_MAX) return setError(`The skill name must be at most ${SKILL_NAME_MAX} characters.`)
    const years = draft.yearsOfExperience
    if (years !== null && (years < 0 || years > SKILL_YEARS_MAX)) {
      return setError(`Years of experience must be between 0 and ${SKILL_YEARS_MAX}.`)
    }

    if (initial) {
      updateSkill(resumeId, initial.id, { ...draft, skillName: name })
    } else {
      addSkill(resumeId, { ...draft, skillName: name })
    }
    onDone()
  }

  return (
    <form onSubmit={handleSave} noValidate className="flex min-w-0 flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-3 sm:items-start">
        <Field className="sm:col-span-2">
          <FieldLabel htmlFor="skill-name">Skill<RequiredStar /></FieldLabel>
          <Input
            id="skill-name"
            value={draft.skillName}
            maxLength={SKILL_NAME_MAX}
            placeholder="TypeScript"
            onChange={(event) => {
              setDraft((current) => ({ ...current, skillName: event.target.value }))
              setError(null)
            }}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="skill-proficiency">Proficiency<RequiredStar /></FieldLabel>
          <Select
            id="skill-proficiency"
            value={draft.proficiencyLevel}
            required
            onChange={(event) =>
              setDraft((current) => ({ ...current, proficiencyLevel: event.target.value as ResumeProficiencyLevel }))
            }
          >
            {PROFICIENCY_ORDER.map((level) => (
              <SelectItem key={level} value={level}>
                {PROFICIENCY_LABEL[level]}
              </SelectItem>
            ))}
          </Select>
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor="skill-years">Years of experience</FieldLabel>
        <Input
          id="skill-years"
          type="number"
          min={0}
          max={SKILL_YEARS_MAX}
          value={draft.yearsOfExperience ?? ''}
          placeholder="e.g. 4"
          onChange={(event) => {
            const raw = event.target.value
            setDraft((current) => ({
              ...current,
              yearsOfExperience: raw === '' ? null : Math.trunc(Number(raw)),
            }))
            setError(null)
          }}
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
          {initial ? 'Save changes' : 'Add skill'}
        </Button>
      </div>
    </form>
  )
}

/** Marks the fields `ResumeSkillRequest` requires. The star is for the eye
 *  only — the inputs' `required` attribute carries the semantics. */
function RequiredStar() {
  return (
    <span aria-hidden="true" className="text-[var(--neu-error-text)]">
      {' '}*
    </span>
  )
}

/** One stored skill — a quiet row, not a chip: proficiency and years read
 *  at a glance and the actions stay reachable. */
function SkillRow({
  entry,
  onEdit,
  onRemove,
}: {
  entry: ResumeSkillEntry
  onEdit: () => void
  onRemove: () => void
}) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-[var(--neu-radius-control)] bg-[var(--neu-surface)] px-4 py-3 [background-image:var(--neu-fill-inset)] shadow-[var(--neu-shadow-inset-sm)]">
      <div className="flex min-w-0 items-baseline gap-x-2.5 gap-y-0.5 flex-wrap">
        <p className="text-sm font-semibold text-[var(--foreground)]">{entry.skillName}</p>
        <span className={`text-xs ${PROFICIENCY_CLASS[entry.proficiencyLevel]}`}>
          {PROFICIENCY_LABEL[entry.proficiencyLevel]}
        </span>
        {entry.yearsOfExperience !== null && (
          <span className="text-xs tabular-nums text-[var(--muted-foreground)]">
            · {entry.yearsOfExperience} {entry.yearsOfExperience === 1 ? 'yr' : 'yrs'}
          </span>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={2} data-icon="inline-start" />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Remove ${entry.skillName}`}
          onClick={onRemove}
          className="size-8 text-[var(--muted-foreground)] hover:text-[var(--neu-error-text)]"
        >
          <HugeiconsIcon icon={DeleteIcon} strokeWidth={2} className="size-4" />
        </Button>
      </div>
    </li>
  )
}

export function SkillsSection({ resume }: { resume: ResumeItem }) {
  const [formOpen, setFormOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<ResumeSkillEntry | null>(null)

  const ordered = [...resume.skills].sort((a, b) => a.displayOrder - b.displayOrder)

  if (formOpen) {
    return <SkillForm resumeId={resume.id} initial={editing} onDone={() => { setFormOpen(false); setEditing(null) }} />
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
          Add skill
        </Button>
      </div>
      {ordered.length > 0 ? (
        <ul className="flex min-w-0 flex-col gap-2.5">
          {ordered.map((entry) => (
            <SkillRow
              key={entry.id}
              entry={entry}
              onEdit={() => {
                setEditing(entry)
                setFormOpen(true)
              }}
              onRemove={() => removeSkill(resume.id, entry.id)}
            />
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-1.5 rounded-[var(--neu-radius-control)] border border-dashed border-[color:var(--border)] px-4 py-8 text-center">
          <p className="text-[13px] font-medium text-[var(--foreground)]">No skills listed yet.</p>
          <p className="text-xs text-[var(--muted-foreground)]">
            The tools and strengths recruiters filter by.
          </p>
        </div>
      )}
    </div>
  )
}
