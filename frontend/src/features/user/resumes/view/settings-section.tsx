'use client'

import * as React from 'react'

import { HugeiconsIcon } from '@hugeicons/react'
import { CheckmarkCircleIcon, StarIcon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectItem } from '@/components/ui/select'
import type { ResumeItem, ResumeTemplateType, ResumeVisibility } from '../data'
import { RESUME_TITLE_MAX, TEMPLATE_LABEL, VISIBILITY_LABEL } from '../data'
import { formatResumeDate } from '../data'
import { MetaList, MetaRow } from './sections'
import { setDefaultResume, updateResume } from '../store'

/**
 * Settings — the resume shell's own fields: `PUT /api/resumes/{id}` with
 * `UpdateResumeRequest{title ≤150, template, visibility}` and
 * `POST /api/resumes/{id}/set-default`. Everything else (completion,
 * timestamps) is server-derived and shown read-only.
 */

const TEMPLATE_ORDER: ResumeTemplateType[] = ['DEFAULT', 'MODERN', 'CLASSIC', 'PROFESSIONAL']
const VISIBILITY_ORDER: ResumeVisibility[] = ['PUBLIC', 'PRIVATE', 'LINK_ONLY']

/** Marks the fields `UpdateResumeRequest` requires. The star is for the eye
 *  only — the inputs' `required` attribute carries the semantics. */
function RequiredStar() {
  return (
    <span aria-hidden="true" className="text-[var(--neu-error-text)]">
      {' '}*
    </span>
  )
}

export function SettingsSection({ resume }: { resume: ResumeItem }) {
  const [draft, setDraft] = React.useState({
    title: resume.title,
    template: resume.template,
    visibility: resume.visibility,
  })
  const [error, setError] = React.useState<string | null>(null)
  const [saved, setSaved] = React.useState(false)

  // The draft covers only the three fields this form itself mutates, so
  // it cannot go stale underneath (set-default touches neither).
  const dirty =
    draft.title !== resume.title ||
    draft.template !== resume.template ||
    draft.visibility !== resume.visibility

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault()
    // The same rule `UpdateResumeRequest` enforces server-side.
    const title = draft.title.trim()
    if (!title) return setError('Title is required.')
    if (title.length > RESUME_TITLE_MAX) {
      return setError(`The title must be at most ${RESUME_TITLE_MAX} characters.`)
    }
    updateResume(resume.id, { ...draft, title })
    setError(null)
    setSaved(true)
  }

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <form onSubmit={handleSave} noValidate className="flex min-w-0 flex-col gap-5">
        <Field>
          <FieldLabel htmlFor="settings-title">Resume title<RequiredStar /></FieldLabel>
          <Input
            id="settings-title"
            value={draft.title}
            maxLength={RESUME_TITLE_MAX}
            placeholder="Frontend Engineer — 2026"
            onChange={(event) => {
              setDraft((current) => ({ ...current, title: event.target.value }))
              setError(null)
              setSaved(false)
            }}
            required
          />
          <p className="text-xs text-[var(--muted-foreground)]">
            Only you see this — it names the resume in your list.
          </p>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2 sm:items-start">
          <Field>
            <FieldLabel htmlFor="settings-template">Template</FieldLabel>
            <Select
              id="settings-template"
              value={draft.template}
              onChange={(event) => {
                setDraft((current) => ({ ...current, template: event.target.value as ResumeTemplateType }))
                setSaved(false)
              }}
            >
              {TEMPLATE_ORDER.map((type) => (
                <SelectItem key={type} value={type}>
                  {TEMPLATE_LABEL[type]}
                </SelectItem>
              ))}
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="settings-visibility">Visibility</FieldLabel>
            <Select
              id="settings-visibility"
              value={draft.visibility}
              onChange={(event) => {
                setDraft((current) => ({ ...current, visibility: event.target.value as ResumeVisibility }))
                setSaved(false)
              }}
            >
              {VISIBILITY_ORDER.map((type) => (
                <SelectItem key={type} value={type}>
                  {VISIBILITY_LABEL[type]}
                </SelectItem>
              ))}
            </Select>
            <p className="text-xs text-[var(--muted-foreground)]">
              {draft.visibility === 'PUBLIC'
                ? 'Any employer viewing a shareable link can read it.'
                : draft.visibility === 'LINK_ONLY'
                  ? 'Readable only through the share link you send.'
                  : 'Only you can open this resume.'}
            </p>
          </Field>
        </div>

        <div aria-live="polite">
          {error && (
            <p role="alert" className="text-[13px] font-medium text-[var(--neu-error-text)]">
              {error}
            </p>
          )}
          {saved && !error && (
            <p className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--success)]">
              <HugeiconsIcon icon={CheckmarkCircleIcon} strokeWidth={2} aria-hidden="true" className="size-4" />
              Settings saved.
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3">
          {dirty && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setDraft({ title: resume.title, template: resume.template, visibility: resume.visibility })
                setError(null)
                setSaved(false)
              }}
            >
              Reset
            </Button>
          )}
          <Button type="submit" variant="primary" disabled={!dirty}>
            Save settings
          </Button>
        </div>
      </form>

      <div className="flex min-w-0 flex-col gap-3">
        <div className="h-px bg-[color:var(--border)]" aria-hidden="true" />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--foreground)]">Default resume</p>
            <p className="text-xs text-[var(--muted-foreground)]">
              {resume.isDefault
                ? 'This is the resume applications start from.'
                : 'Applications start from your default resume — make this the one instead.'}
            </p>
          </div>
          <Button
            variant={resume.isDefault ? 'ghost' : 'soft'}
            size="sm"
            disabled={resume.isDefault}
            onClick={() => setDefaultResume(resume.id)}
          >
            <HugeiconsIcon icon={StarIcon} strokeWidth={2} data-icon="inline-start" />
            {resume.isDefault ? 'Current default' : 'Set as default'}
          </Button>
        </div>

        <MetaList>
          <MetaRow label="Completion">{resume.completionScore}%</MetaRow>
          <MetaRow label="Created">{formatResumeDate(resume.createdAt)}</MetaRow>
          <MetaRow label="Last updated">{formatResumeDate(resume.updatedAt)}</MetaRow>
        </MetaList>
      </div>
    </div>
  )
}
