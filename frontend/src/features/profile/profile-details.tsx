import * as React from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { LockIcon, PencilEditIcon, TickIcon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { fullName } from './data'
import type { UpdateProfileReq, UserAccount } from './data'
import { updateUserProfile } from './data'

interface FormDraft {
  firstName: string
  middleName: string
  lastName: string
  phoneNumber: string
}

const NAME_MAX = 50
const PHONE_PATTERN = /^\+?[0-9]{7,15}$/

/**
 * Personal details — a view card (name, email, phone) whose "Edit profile"
 * flips the rows into inline fields right here in the card. No dialog: the
 * switch happens in place, the way address books do it. Email is locked —
 * the backend's `UpdateUserRequest` doesn't accept it.
 */
export function PersonalDetailsCard({
  account,
  onSaved,
}: {
  account: UserAccount
  onSaved: (req: UpdateProfileReq) => void
}) {
  const [editing, setEditing] = React.useState(false)
  const [draft, setDraft] = React.useState<FormDraft>({
    firstName: account.firstName,
    middleName: account.middleName ?? '',
    lastName: account.lastName,
    phoneNumber: account.phoneNumber ?? '',
  })
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const startEdit = () => {
    setDraft({
      firstName: account.firstName,
      middleName: account.middleName ?? '',
      lastName: account.lastName,
      phoneNumber: account.phoneNumber ?? '',
    })
    setError(null)
    setEditing(true)
  }

  const cancel = () => {
    setEditing(false)
    setError(null)
  }

  const patch = (partial: Partial<FormDraft>) => {
    setDraft((current) => ({ ...current, ...partial }))
    setError(null)
  }

  const req: UpdateProfileReq = {
    firstName: draft.firstName.trim(),
    middleName: draft.middleName.trim() || null,
    lastName: draft.lastName.trim(),
    phoneNumber: draft.phoneNumber.trim() || null,
    profilePictureUrl: account.profilePictureUrl,
  }
  const dirty =
    req.firstName !== account.firstName ||
    req.middleName !== account.middleName ||
    req.lastName !== account.lastName ||
    req.phoneNumber !== account.phoneNumber

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!req.firstName.trim()) return setError('First name is required.')
    if (req.firstName.length > NAME_MAX) return setError('First name must be at most 50 characters.')
    if (!req.lastName.trim()) return setError('Last name is required.')
    if (req.lastName.length > NAME_MAX) return setError('Last name must be at most 50 characters.')
    if (req.middleName && req.middleName.length > NAME_MAX) {
      return setError('Middle name must be at most 50 characters.')
    }
    if (req.phoneNumber && !PHONE_PATTERN.test(req.phoneNumber)) {
      return setError('Phone number is not valid — use 7 to 15 digits, optional leading “+”.')
    }
    setSaving(true)
    try {
      await updateUserProfile(req)
      onSaved(req)
      setEditing(false)
    } catch {
      setError('Saving failed. Your changes are still here — try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card variant="raised" className="gap-0 p-5 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[15px] font-semibold tracking-tight text-[var(--foreground)]">
            Personal details
          </h2>
          <p className="mt-1 text-[13px] text-[var(--muted-foreground)]">
            How your name and contact details appear across Hirely.
          </p>
        </div>
        {!editing && (
          <Button variant="soft" size="sm" onClick={startEdit} className="shrink-0">
            <HugeiconsIcon icon={PencilEditIcon} strokeWidth={2} data-icon="inline-start" />
            Edit profile
          </Button>
        )}
      </div>

      {editing ? (
        <form onSubmit={handleSave} className="mt-5 flex min-w-0 flex-col gap-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field>
              <FieldLabel htmlFor="details-first-name">First name</FieldLabel>
              <Input
                id="details-first-name"
                value={draft.firstName}
                maxLength={NAME_MAX}
                onChange={(event) => patch({ firstName: event.target.value })}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="details-middle-name">Middle name</FieldLabel>
              <Input
                id="details-middle-name"
                value={draft.middleName}
                maxLength={NAME_MAX}
                onChange={(event) => patch({ middleName: event.target.value })}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="details-last-name">Last name</FieldLabel>
              <Input
                id="details-last-name"
                value={draft.lastName}
                maxLength={NAME_MAX}
                onChange={(event) => patch({ lastName: event.target.value })}
                required
              />
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="details-phone">Phone number</FieldLabel>
            <Input
              id="details-phone"
              type="tel"
              value={draft.phoneNumber}
              onChange={(event) => patch({ phoneNumber: event.target.value })}
              placeholder="+8801712345678"
            />
            <FieldDescription>7–15 digits, optional leading “+”.</FieldDescription>
          </Field>

          {error && (
            <p role="alert" className="text-sm font-medium text-[var(--neu-error-text)]">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-3">
            <Button
              type="submit"
              disabled={saving || !dirty}
              className="[background-image:var(--neu-fill-primary)] text-[var(--primary-foreground)]"
            >
              <HugeiconsIcon icon={TickIcon} strokeWidth={2} data-icon="inline-start" />
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
            <Button variant="soft" type="button" onClick={cancel} disabled={saving}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <>
          <Separator className="mt-4" />
          <dl className="mt-4 flex flex-col gap-3">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-[13px] text-[var(--muted-foreground)]">Name</dt>
              <dd className="text-right text-sm font-medium text-[var(--foreground)]">{fullName(account)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-[13px] text-[var(--muted-foreground)]">Email</dt>
              <dd className="flex min-w-0 items-center gap-1.5 text-right text-sm text-[var(--muted-foreground)]">
                <span className="truncate">{account.email}</span>
                <HugeiconsIcon
                  icon={LockIcon}
                  strokeWidth={1.8}
                  aria-hidden="true"
                  className="size-3.5 shrink-0"
                />
                <span className="sr-only">Managed at sign-in — contact support to change it.</span>
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-[13px] text-[var(--muted-foreground)]">Phone number</dt>
              <dd className="text-right text-sm font-medium tabular-nums text-[var(--foreground)]">
                {account.phoneNumber ?? 'Not provided'}
              </dd>
            </div>
          </dl>
        </>
      )}
    </Card>
  )
}
