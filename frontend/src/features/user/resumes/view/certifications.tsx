'use client'

import * as React from 'react'

import { HugeiconsIcon } from '@hugeicons/react'
import { DeleteIcon, Link01Icon, PencilEdit02Icon, BadgeCheckIcon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { DatePicker } from '@/components/ui/date-picker'
import type { ResumeCertificationEntry, ResumeItem } from '../data'
import {
  CERTIFICATION_CREDENTIAL_ID_MAX,
  CERTIFICATION_NAME_MAX,
  CERTIFICATION_ORG_MAX,
  CERTIFICATION_URL_MAX,
  HTTP_URL_PATTERN,
  formatResumeDate,
  isoDateToDate,
  dateToIsoDate,
} from '../data'
import { addCertification, removeCertification, updateCertification, type CertificationInput } from '../store'

/**
 * Certifications — the resume's `CertificationResponse` list under
 * `/api/resumes/{resumeId}/certifications`: a collection, so the read view
 * carries per-entry Edit/Remove (`PUT` / `DELETE /{certificationId}`) and
 * an Add action (`POST`). The form mirrors `CertificationRequest` — name
 * required (≤200) and issue date required; organization (≤150),
 * credential id (≤255) and credential url (http(s), ≤500) optional.
 * There is no AI assist here: the ai-service exposes no endpoint for
 * certifications.
 */

/** Marks the fields `CertificationRequest` requires. The star is for the
 *  eye only — the inputs' `required` attribute carries the semantics. */
function RequiredStar() {
  return (
    <span aria-hidden="true" className="text-[var(--neu-error-text)]">
      {' '}*
    </span>
  )
}

function emptyInput(): CertificationInput {
  return {
    name: '',
    issuingOrganization: '',
    issueDate: '',
    expirationDate: null,
    credentialId: '',
    credentialUrl: '',
    displayOrder: 0,
  }
}

function EntryForm({
  resumeId,
  initial,
  onDone,
}: {
  resumeId: string
  initial: ResumeCertificationEntry | null
  onDone: () => void
}) {
  const [draft, setDraft] = React.useState<CertificationInput>(() =>
    initial ? { ...initial } : emptyInput(),
  )
  const [error, setError] = React.useState<string | null>(null)

  const set = (partial: Partial<CertificationInput>) => {
    setDraft((current) => ({ ...current, ...partial }))
    setError(null)
  }

  const handleSave = (event: React.FormEvent) => {
    event.preventDefault()
    // The same rules `CertificationRequest` enforces server-side.
    if (!draft.name.trim()) return setError('Name is required.')
    if (draft.name.length > CERTIFICATION_NAME_MAX) return setError(`The name must be at most ${CERTIFICATION_NAME_MAX} characters.`)
    if (draft.issuingOrganization.length > CERTIFICATION_ORG_MAX) return setError(`The issuing organization must be at most ${CERTIFICATION_ORG_MAX} characters.`)
    if (!draft.issueDate) return setError('Issue date is required.')
    if (draft.credentialId.length > CERTIFICATION_CREDENTIAL_ID_MAX) return setError(`The credential ID must be at most ${CERTIFICATION_CREDENTIAL_ID_MAX} characters.`)
    if (draft.credentialUrl && (!HTTP_URL_PATTERN.test(draft.credentialUrl) || draft.credentialUrl.length > CERTIFICATION_URL_MAX)) {
      return setError(`The credential link must be a http(s) URL of at most ${CERTIFICATION_URL_MAX} characters.`)
    }

    if (initial) {
      updateCertification(resumeId, initial.id, draft)
    } else {
      addCertification(resumeId, draft)
    }
    onDone()
  }

  return (
    <form onSubmit={handleSave} noValidate className="flex min-w-0 flex-col gap-5">
      <Field>
        <FieldLabel htmlFor="cert-name">Name<RequiredStar /></FieldLabel>
        <Input
          id="cert-name"
          value={draft.name}
          maxLength={CERTIFICATION_NAME_MAX}
          placeholder="AWS Certified Cloud Practitioner"
          onChange={(event) => set({ name: event.target.value })}
          required
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="cert-org">Issuing organization</FieldLabel>
        <Input
          id="cert-org"
          value={draft.issuingOrganization}
          maxLength={CERTIFICATION_ORG_MAX}
          placeholder="Amazon Web Services"
          onChange={(event) => set({ issuingOrganization: event.target.value })}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2 sm:items-start">
        <Field>
          <FieldLabel htmlFor="cert-issue">Issue date<RequiredStar /></FieldLabel>
          <DatePicker
            id="cert-issue"
            label="Issue date"
            value={isoDateToDate(draft.issueDate)}
            onValueChange={(date) => set({ issueDate: date ? dateToIsoDate(date) : '' })}
            endMonth={new Date(new Date().getFullYear() + 1, 11)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="cert-expiry">Expiration date</FieldLabel>
          <DatePicker
            id="cert-expiry"
            label="Expiration date"
            value={isoDateToDate(draft.expirationDate ?? '')}
            onValueChange={(date) => set({ expirationDate: date ? dateToIsoDate(date) : null })}
            endMonth={new Date(new Date().getFullYear() + 1, 11)}
          />
          <p className="text-xs text-[var(--muted-foreground)]">
            Leave empty when the certification does not expire.
          </p>
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 sm:items-start">
        <Field>
          <FieldLabel htmlFor="cert-id">Credential ID</FieldLabel>
          <Input
            id="cert-id"
            value={draft.credentialId}
            maxLength={CERTIFICATION_CREDENTIAL_ID_MAX}
            placeholder="AWS-CCP-8842"
            onChange={(event) => set({ credentialId: event.target.value })}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="cert-url">Credential link</FieldLabel>
          <Input
            id="cert-url"
            type="url"
            value={draft.credentialUrl}
            maxLength={CERTIFICATION_URL_MAX}
            placeholder="https://creds.example.com/verify"
            onChange={(event) => set({ credentialUrl: event.target.value })}
          />
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
          {initial ? 'Save changes' : 'Add certification'}
        </Button>
      </div>
    </form>
  )
}

/** One stored certification — the inset-tile rhythm the other sections use. */
function EntryCard({
  entry,
  onEdit,
  onRemove,
}: {
  entry: ResumeCertificationEntry
  onEdit: () => void
  onRemove: () => void
}) {
  return (
    <li className="rounded-[var(--neu-radius-control)] bg-[var(--neu-surface)] px-4 py-3.5 [background-image:var(--neu-fill-inset)] shadow-[var(--neu-shadow-inset-sm)]">
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
        <div className="flex min-w-0 items-start gap-2.5">
          <HugeiconsIcon icon={BadgeCheckIcon} strokeWidth={1.8} aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-[var(--neu-accent-ink)]" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--foreground)]">{entry.name}</p>
            <p className="mt-0.5 text-xs tabular-nums text-[var(--muted-foreground)]">
              {formatResumeDate(entry.issueDate)}
              {entry.expirationDate ? ` — expires ${formatResumeDate(entry.expirationDate)}` : ' · no expiration'}
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
            aria-label={`Remove ${entry.name}`}
            onClick={onRemove}
            className="size-8 text-[var(--muted-foreground)] hover:text-[var(--neu-error-text)]"
          >
            <HugeiconsIcon icon={DeleteIcon} strokeWidth={2} className="size-4" />
          </Button>
        </div>
      </div>

      {(entry.issuingOrganization || entry.credentialId) && (
        <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 pl-[26px] text-[13px] text-[var(--muted-foreground)]">
          {entry.issuingOrganization}
          {entry.issuingOrganization && entry.credentialId && <span aria-hidden="true">·</span>}
          {entry.credentialId && <span className="tabular-nums">{entry.credentialId}</span>}
        </p>
      )}

      {entry.credentialUrl && (
        <a
          href={entry.credentialUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-2 flex min-w-0 items-center gap-1.5 pl-[26px] text-xs font-medium text-[var(--neu-accent-ink)] hover:underline"
        >
          <HugeiconsIcon icon={Link01Icon} strokeWidth={1.8} aria-hidden="true" className="size-3.5 shrink-0" />
          <span className="truncate">{entry.credentialUrl}</span>
        </a>
      )}
    </li>
  )
}

export function CertificationsSection({ resume }: { resume: ResumeItem }) {
  const [formOpen, setFormOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<ResumeCertificationEntry | null>(null)

  const ordered = [...resume.certifications].sort((a, b) => a.displayOrder - b.displayOrder)

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
          Add certification
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
              onRemove={() => removeCertification(resume.id, entry.id)}
            />
          ))}
        </ol>
      ) : (
        <div className="flex flex-col items-center gap-1.5 rounded-[var(--neu-radius-control)] border border-dashed border-[color:var(--border)] px-4 py-8 text-center">
          <p className="text-[13px] font-medium text-[var(--foreground)]">No certifications added yet.</p>
          <p className="text-xs text-[var(--muted-foreground)]">
            Credentials that back up the skills above.
          </p>
        </div>
      )}
    </div>
  )
}
