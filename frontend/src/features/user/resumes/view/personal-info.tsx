import { HugeiconsIcon } from '@hugeicons/react'
import { PencilEdit02Icon } from '@hugeicons/core-free-icons'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectItem } from '@/components/ui/select'
import type {
  ResumeAddress,
  ResumeGender,
  ResumeItem,
  ResumePersonalInfo,
} from '../data'
import {
  GENDER_LABEL,
  formatPersonalDate,
  personalDateFromInput,
  personalDateToInput,
} from '../data'
import { updatePersonalInfo } from '../store'
import { MetaList, MetaRow } from './sections'

/** Backend `RegexPatterns` — kept identical so the local form rejects what
 *  the server would reject. */
const EMAIL_PATTERN = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$/
const PHONE_PATTERN = /^\+?[1-9]\d{1,14}$/
const HTTP_URL_PATTERN = /^https?:\/\/\S+$/

type UrlKey = 'linkedInUrl' | 'githubUrl' | 'portfolioUrl' | 'websiteUrl'

const URL_FIELDS: Array<{ key: UrlKey; label: string }> = [
  { key: 'linkedInUrl', label: 'LinkedIn' },
  { key: 'githubUrl', label: 'GitHub' },
  { key: 'portfolioUrl', label: 'Portfolio' },
  { key: 'websiteUrl', label: 'Website' },
]

function formatAddressLine(value: ResumeAddress): string {
  return [value.address, value.city, value.state, value.country, value.zipCode]
    .filter(Boolean)
    .join(', ')
}

function NotProvided() {
  return <em className="text-[var(--muted-foreground)]">Not provided</em>
}

/** Personal Info — the resume's identity record (`PersonalInfoResponse`).
 *  Read view: name and headline lead, the record follows as divide rows,
 *  links as accent anchors. */
export function PersonalInfoSection({ resume }: { resume: ResumeItem }) {
  const [editing, setEditing] = React.useState(false)
  const info = resume.personalInfo
  const name = [info.firstName, info.middleName, info.lastName].filter(Boolean).join(' ')
  const dateOfBirth = formatPersonalDate(info.dateOfBirth)
  const links = URL_FIELDS.map(({ key, label }) => [label, info[key]] as const).filter(
    ([, url]) => Boolean(url),
  )

  if (editing) {
    return <PersonalInfoForm resume={resume} onDone={() => setEditing(false)} />
  }

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[15px] font-semibold text-[var(--foreground)]">
            {name || <NotProvided />}
          </p>
          <p className="mt-0.5 text-[13px] text-[var(--muted-foreground)]">
            {info.headline || 'No headline yet'}
          </p>
        </div>
        <Button variant="soft" size="sm" onClick={() => setEditing(true)} className="shrink-0">
          <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={2} data-icon="inline-start" />
          Edit
        </Button>
      </div>

      <MetaList>
        <MetaRow label="Gender">{info.gender ? GENDER_LABEL[info.gender] : <NotProvided />}</MetaRow>
        <MetaRow label="Nationality">{info.nationality || <NotProvided />}</MetaRow>
        <MetaRow label="Date of birth">{dateOfBirth ?? <NotProvided />}</MetaRow>
        <MetaRow label="Email">{info.email || <NotProvided />}</MetaRow>
        <MetaRow label="Phone">{info.phone || <NotProvided />}</MetaRow>
        <MetaRow label="Present address">
          {formatAddressLine(info.presentAddress) || <NotProvided />}
        </MetaRow>
        <MetaRow label="Permanent address">
          {formatAddressLine(info.permanentAddress) || <NotProvided />}
        </MetaRow>
        {links.map(([label, url]) => (
          <MetaRow key={label} label={label}>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="truncate text-[var(--neu-accent-ink)] underline-offset-2 hover:underline"
            >
              {url}
            </a>
          </MetaRow>
        ))}
      </MetaList>

      {links.length === 0 && (
        <p className="text-[13px] leading-relaxed text-[var(--muted-foreground)]">
          No profile links on this resume yet — add LinkedIn, GitHub or a portfolio in Edit.
        </p>
      )}
    </div>
  )
}

/** One address (street/city/state/country/zip) — all fields optional on the
 *  backend, size-limited per the `Address` embeddable. */
function AddressFields({
  idPrefix,
  value,
  onChange,
}: {
  idPrefix: string
  value: ResumeAddress
  onChange: (next: ResumeAddress) => void
}) {
  const set = (key: keyof ResumeAddress, v: string) => onChange({ ...value, [key]: v })
  const text = (
    key: keyof ResumeAddress,
    maxLength: number,
    placeholder: string,
    className?: string,
  ) => (
    <Field className={className}>
      <FieldLabel htmlFor={`${idPrefix}-${key}`}>
        {key === 'address'
          ? 'Street address'
          : key === 'zipCode'
            ? 'Zip code'
            : key[0].toUpperCase() + key.slice(1)}
      </FieldLabel>
      <Input
        id={`${idPrefix}-${key}`}
        value={value[key]}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(event) => set(key, event.target.value)}
      />
    </Field>
  )
  return (
    <div className="flex flex-col gap-4">
      {text('address', 255, 'House 12, Road 5, Block C', 'sm:col-span-2')}
      <div className="grid gap-4 sm:grid-cols-2">
        {text('city', 100, 'Dhaka')}
        {text('state', 100, 'Dhaka')}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {text('country', 100, 'Bangladesh')}
        {text('zipCode', 20, '1213')}
      </div>
    </div>
  )
}

/** Inline edit form — field-for-field `PersonalInfoRequest`: the same
 *  required fields, the same patterns, and a `MM-dd-yyyy` date of birth.
 *  Saves through the store's personal-info seam
 *  (`PATCH /api/resumes/{resumeId}/personal-info`). */
function PersonalInfoForm({ resume, onDone }: { resume: ResumeItem; onDone: () => void }) {
  const [draft, setDraft] = React.useState<ResumePersonalInfo>(resume.personalInfo)
  const [errors, setErrors] = React.useState<Partial<Record<keyof ResumePersonalInfo, string>>>({})

  const set = <K extends keyof ResumePersonalInfo>(key: K, value: ResumePersonalInfo[K]) =>
    setDraft((previous) => ({ ...previous, [key]: value }))

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const next: Partial<Record<keyof ResumePersonalInfo, string>> = {}
    const require = (key: keyof ResumePersonalInfo, label: string, value: string) => {
      if (!value.trim()) next[key] = `${label} is required.`
    }
    require('firstName', 'First name', draft.firstName)
    require('lastName', 'Last name', draft.lastName)
    require('email', 'Email', draft.email)
    require('phone', 'Phone', draft.phone)
    require('nationality', 'Nationality', draft.nationality)
    if (!draft.gender) next.gender = 'Gender is required.'
    if (!draft.dateOfBirth) next.dateOfBirth = 'Date of birth is required.'
    if (draft.email.trim() && !EMAIL_PATTERN.test(draft.email.trim())) {
      next.email = 'Enter a valid email address.'
    }
    if (draft.phone.trim() && !PHONE_PATTERN.test(draft.phone.trim())) {
      next.phone = 'Enter a valid phone number — optional “+”, digits only.'
    }
    for (const { key, label } of URL_FIELDS) {
      const url = draft[key]
      if (url.trim() && !HTTP_URL_PATTERN.test(url.trim())) {
        next[key] = `${label} must be a http(s) URL.`
      }
    }
    setErrors(next)
    if (Object.keys(next).length > 0) return
    updatePersonalInfo(resume.id, {
      ...draft,
      firstName: draft.firstName.trim(),
      lastName: draft.lastName.trim(),
      email: draft.email.trim(),
      phone: draft.phone.trim(),
    })
    onDone()
  }

  const invalid = (key: keyof ResumePersonalInfo) => errors[key] || undefined

  return (
    <form onSubmit={handleSubmit} noValidate className="flex min-w-0 flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field data-invalid={invalid('firstName') ? true : undefined}>
          <FieldLabel htmlFor="pi-first-name">First name</FieldLabel>
          <Input
            id="pi-first-name"
            value={draft.firstName}
            maxLength={100}
            required
            aria-invalid={invalid('firstName') ? true : undefined}
            onChange={(event) => set('firstName', event.target.value)}
          />
          {invalid('firstName') && (
            <p className="text-[13px] font-medium text-[var(--neu-error-text)]">
              {invalid('firstName')}
            </p>
          )}
        </Field>
        <Field>
          <FieldLabel htmlFor="pi-middle-name">Middle name</FieldLabel>
          <Input
            id="pi-middle-name"
            value={draft.middleName}
            maxLength={100}
            onChange={(event) => set('middleName', event.target.value)}
          />
        </Field>
        <Field data-invalid={invalid('lastName') ? true : undefined}>
          <FieldLabel htmlFor="pi-last-name">Last name</FieldLabel>
          <Input
            id="pi-last-name"
            value={draft.lastName}
            maxLength={100}
            required
            aria-invalid={invalid('lastName') ? true : undefined}
            onChange={(event) => set('lastName', event.target.value)}
          />
          {invalid('lastName') && (
            <p className="text-[13px] font-medium text-[var(--neu-error-text)]">
              {invalid('lastName')}
            </p>
          )}
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor="pi-headline">Headline</FieldLabel>
        <Input
          id="pi-headline"
          value={draft.headline}
          maxLength={150}
          placeholder="Frontend Developer — React & TypeScript"
          onChange={(event) => set('headline', event.target.value)}
        />
        <FieldDescription>One line under your name, up to 150 characters.</FieldDescription>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field data-invalid={invalid('email') ? true : undefined}>
          <FieldLabel htmlFor="pi-email">Email</FieldLabel>
          <Input
            id="pi-email"
            type="email"
            value={draft.email}
            maxLength={255}
            required
            aria-invalid={invalid('email') ? true : undefined}
            onChange={(event) => set('email', event.target.value)}
          />
          {invalid('email') && (
            <p className="text-[13px] font-medium text-[var(--neu-error-text)]">
              {invalid('email')}
            </p>
          )}
        </Field>
        <Field data-invalid={invalid('phone') ? true : undefined}>
          <FieldLabel htmlFor="pi-phone">Phone</FieldLabel>
          <Input
            id="pi-phone"
            type="tel"
            value={draft.phone}
            maxLength={20}
            required
            placeholder="+8801712345678"
            aria-invalid={invalid('phone') ? true : undefined}
            onChange={(event) => set('phone', event.target.value)}
          />
          {invalid('phone') && (
            <p className="text-[13px] font-medium text-[var(--neu-error-text)]">
              {invalid('phone')}
            </p>
          )}
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field data-invalid={invalid('gender') ? true : undefined}>
          <FieldLabel htmlFor="pi-gender">Gender</FieldLabel>
          <Select
            id="pi-gender"
            value={draft.gender}
            required
            aria-invalid={invalid('gender') ? true : undefined}
            onChange={(event) => set('gender', event.target.value as ResumeGender)}
          >
            <SelectItem value="" disabled>
              Select…
            </SelectItem>
            {(Object.keys(GENDER_LABEL) as ResumeGender[]).map((value) => (
              <SelectItem key={value} value={value}>
                {GENDER_LABEL[value]}
              </SelectItem>
            ))}
          </Select>
          {invalid('gender') && (
            <p className="text-[13px] font-medium text-[var(--neu-error-text)]">
              {invalid('gender')}
            </p>
          )}
        </Field>
        <Field data-invalid={invalid('nationality') ? true : undefined}>
          <FieldLabel htmlFor="pi-nationality">Nationality</FieldLabel>
          <Input
            id="pi-nationality"
            value={draft.nationality}
            maxLength={100}
            required
            aria-invalid={invalid('nationality') ? true : undefined}
            onChange={(event) => set('nationality', event.target.value)}
          />
          {invalid('nationality') && (
            <p className="text-[13px] font-medium text-[var(--neu-error-text)]">
              {invalid('nationality')}
            </p>
          )}
        </Field>
        <Field data-invalid={invalid('dateOfBirth') ? true : undefined}>
          <FieldLabel htmlFor="pi-dob">Date of birth</FieldLabel>
          <Input
            id="pi-dob"
            type="date"
            value={personalDateToInput(draft.dateOfBirth)}
            required
            aria-invalid={invalid('dateOfBirth') ? true : undefined}
            onChange={(event) => set('dateOfBirth', personalDateFromInput(event.target.value))}
          />
          {invalid('dateOfBirth') && (
            <p className="text-[13px] font-medium text-[var(--neu-error-text)]">
              {invalid('dateOfBirth')}
            </p>
          )}
        </Field>
      </div>

      <div className="flex flex-col gap-4">
        <p className="text-[13px] font-semibold text-[var(--foreground)]">Present address</p>
        <AddressFields
          idPrefix="pi-present"
          value={draft.presentAddress}
          onChange={(next) => set('presentAddress', next)}
        />
      </div>
      <div className="flex flex-col gap-4">
        <p className="text-[13px] font-semibold text-[var(--foreground)]">Permanent address</p>
        <AddressFields
          idPrefix="pi-permanent"
          value={draft.permanentAddress}
          onChange={(next) => set('permanentAddress', next)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {URL_FIELDS.map(({ key, label }) => (
          <Field key={key} data-invalid={invalid(key) ? true : undefined}>
            <FieldLabel htmlFor={`pi-${key}`}>{label}</FieldLabel>
            <Input
              id={`pi-${key}`}
              type="url"
              value={draft[key] as string}
              maxLength={500}
              placeholder="https://…"
              aria-invalid={invalid(key) ? true : undefined}
              onChange={(event) => set(key, event.target.value as ResumePersonalInfo[typeof key])}
            />
            {invalid(key) && (
              <p className="text-[13px] font-medium text-[var(--neu-error-text)]">{invalid(key)}</p>
            )}
          </Field>
        ))}
      </div>

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
