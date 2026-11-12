import * as React from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { TickIcon, LockIcon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { initials } from './data'
import type { UpdateProfileReq, UserAccount } from './data'
import { updateUserProfile } from './data'

/** Section shell shared by all three cards. */
export function ProfileSection({
  id,
  title,
  description,
  children,
}: {
  id: string
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-24">
      <Card variant="raised" className="gap-0 p-5 md:p-6">
      <h2 id={`${id}-heading`} className="text-base font-semibold tracking-tight text-[var(--foreground)]">
        {title}
      </h2>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">{description}</p>
        <div className="mt-4">{children}</div>
      </Card>
    </section>
  )
}

interface FormDraft {
  firstName: string
  middleName: string
  lastName: string
  phoneNumber: string
  profilePictureUrl: string
}

function draftFromAccount(account: UserAccount): FormDraft {
  return {
    firstName: account.firstName,
    middleName: account.middleName ?? '',
    lastName: account.lastName,
    phoneNumber: account.phoneNumber ?? '',
    profilePictureUrl: account.profilePictureUrl ?? '',
  }
}

function reqFromDraft(draft: FormDraft): UpdateProfileReq {
  return {
    firstName: draft.firstName.trim(),
    middleName: draft.middleName.trim() || null,
    lastName: draft.lastName.trim(),
    phoneNumber: draft.phoneNumber.trim() || null,
    profilePictureUrl: draft.profilePictureUrl.trim() || null,
  }
}

const NAME_MAX = 50
const URL_MAX = 255
const PHONE_PATTERN = /^\+?[0-9]{7,15}$/

/**
 * Personal info — always-visible fields with dirty tracking: Save stays
 * disabled until something changed, Reset puts the draft back. The same
 * rules the backend's `UpdateUserRequest` enforces are checked here first.
 */
export function PersonalInfoSection({
  account,
  onSaved,
}: {
  account: UserAccount
  onSaved: (req: UpdateProfileReq) => void
}) {
  const [draft, setDraft] = React.useState<FormDraft>(() => draftFromAccount(account))
  const [saving, setSaving] = React.useState(false)
  const [savedAt, setSavedAt] = React.useState<number | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const req = reqFromDraft(draft)
  const dirty =
    req.firstName !== account.firstName ||
    req.middleName !== account.middleName ||
    req.lastName !== account.lastName ||
    req.phoneNumber !== account.phoneNumber ||
    req.profilePictureUrl !== account.profilePictureUrl

  const patch = (partial: Partial<FormDraft>) => {
    setDraft((current) => ({ ...current, ...partial }))
    setError(null)
    setSavedAt(null)
  }

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!req.firstName.trim()) return setError('First name is required.')
    if (req.firstName.length > NAME_MAX) return setError('First name must be at most 50 characters.')
    if (!req.lastName.trim()) return setError('Last name is required.')
    if (req.lastName.length > NAME_MAX) return setError('Last name must be at most 50 characters.')
    if (draft.middleName.trim().length > NAME_MAX) {
      return setError('Middle name must be at most 50 characters.')
    }
    if (draft.phoneNumber.trim() && !PHONE_PATTERN.test(draft.phoneNumber.trim())) {
      return setError('Phone number is not valid — use 7 to 15 digits, optional leading “+”.')
    }
    if (draft.profilePictureUrl.trim().length > URL_MAX) {
      return setError('Profile picture URL must be at most 255 characters.')
    }
    setSaving(true)
    await updateUserProfile(req)
    setSaving(false)
    onSaved(req)
    setSavedAt(Date.now())
  }

  return (
    <ProfileSection
      id="personal"
      title="Personal info"
      description="How your name and contact details appear across Hirely."
    >
      <form onSubmit={handleSave} className="flex min-w-0 flex-col gap-5">
        <div className="flex items-center gap-4">
          {draft.profilePictureUrl.trim() ? (
            <img
              src={draft.profilePictureUrl.trim()}
              alt=""
              className="size-12 shrink-0 rounded-full object-cover shadow-[var(--neu-shadow-raised-sm)]"
            />
          ) : (
            <span
              aria-hidden="true"
              className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[var(--neu-surface)] text-sm font-semibold text-[var(--neu-accent-ink)] [background-image:var(--neu-fill-inset)] shadow-[var(--neu-shadow-inset)]"
            >
              {draft.firstName || draft.lastName ? initials({ firstName: draft.firstName, lastName: draft.lastName || '?' }) : '?'}
            </span>
          )}
          <Field className="min-w-0 flex-1">
            <FieldLabel htmlFor="personal-picture">Profile picture URL</FieldLabel>
            <Input
              id="personal-picture"
              type="url"
              value={draft.profilePictureUrl}
              maxLength={URL_MAX}
              onChange={(event) => patch({ profilePictureUrl: event.target.value })}
              placeholder="https://…"
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field>
            <FieldLabel htmlFor="personal-first-name">First name</FieldLabel>
            <Input
              id="personal-first-name"
              value={draft.firstName}
              maxLength={NAME_MAX}
              onChange={(event) => patch({ firstName: event.target.value })}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="personal-middle-name">Middle name</FieldLabel>
            <Input
              id="personal-middle-name"
              value={draft.middleName}
              maxLength={NAME_MAX}
              onChange={(event) => patch({ middleName: event.target.value })}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="personal-last-name">Last name</FieldLabel>
            <Input
              id="personal-last-name"
              value={draft.lastName}
              maxLength={NAME_MAX}
              onChange={(event) => patch({ lastName: event.target.value })}
              required
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="personal-email">Email</FieldLabel>
            <div className="relative">
              <Input
                id="personal-email"
                type="email"
                value={account.email}
                readOnly
                aria-readonly="true"
                className="cursor-default pr-9 text-[var(--muted-foreground)]"
              />
              <HugeiconsIcon
                icon={LockIcon}
                strokeWidth={1.8}
                aria-hidden="true"
                className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[var(--muted-foreground)]"
              />
            </div>
            <FieldDescription>Managed at sign-in — contact support to change it.</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="personal-phone">Phone number</FieldLabel>
            <Input
              id="personal-phone"
              type="tel"
              value={draft.phoneNumber}
              onChange={(event) => patch({ phoneNumber: event.target.value })}
              placeholder="+8801712345678"
            />
            <FieldDescription>7–15 digits, optional leading “+”.</FieldDescription>
          </Field>
        </div>

        <div aria-live="polite">
          {error && (
            <p role="alert" className="text-sm font-medium text-[var(--neu-error-text)]">
              {error}
            </p>
          )}
          {!error && savedAt !== null && (
            <p className="text-sm font-medium text-[color:var(--success)]">Personal info saved.</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saving || !dirty} className="[background-image:var(--neu-fill-primary)] text-[var(--primary-foreground)] disabled:text-[var(--muted-foreground)]">
            <HugeiconsIcon icon={TickIcon} strokeWidth={2} data-icon="inline-start" />
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
          {dirty && !saving && (
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                setDraft(draftFromAccount(account))
                setError(null)
              }}
            >
              Reset
            </Button>
          )}
        </div>
      </form>
    </ProfileSection>
  )
}
