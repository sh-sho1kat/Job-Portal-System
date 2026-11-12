import * as React from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { KeyIcon, LogOutIcon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { ProfileSection } from './profile-personal'
import { PASSWORD_PATTERN, changePassword, signOut } from './data'
import type { ChangePasswordReq } from './data'

/**
 * Account security — change password (`PUT /api/auth/me/password`) and sign
 * out (`POST /api/auth/logout`). The password rules are the backend's own
 * `ChangePasswordRequest` annotations, stated in plain words.
 */
export function SecuritySection() {
  const [form, setForm] = React.useState<ChangePasswordReq>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [saving, setSaving] = React.useState(false)
  const [changed, setChanged] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const patch = (partial: Partial<ChangePasswordReq>) => {
    setForm((current) => ({ ...current, ...partial }))
    setError(null)
    setChanged(false)
  }

  const complete = Boolean(form.currentPassword) && Boolean(form.newPassword) && Boolean(form.confirmPassword)

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (form.newPassword.length < 8 || form.newPassword.length > 64) {
      return setError('New password must be between 8 and 64 characters.')
    }
    if (!PASSWORD_PATTERN.test(form.newPassword)) {
      return setError(
        'New password must contain an uppercase letter, a lowercase letter, a number, and one of @$!%*?&.',
      )
    }
    if (form.newPassword !== form.confirmPassword) {
      return setError('New password and confirm password must match.')
    }
    setSaving(true)
    await changePassword(form)
    setSaving(false)
    setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setChanged(true)
  }

  const handleSignOut = async () => {
    await signOut()
    // The auth wiring will route to the landing page once sessions exist.
  }

  return (
    <ProfileSection
      id="security"
      title="Security"
      description="Change your password or end this session. Password rules are the same ones sign-up enforces."
    >
      <div className="flex min-w-0 flex-col gap-6">
      <form onSubmit={handleSave} className="flex min-w-0 flex-col gap-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field>
            <FieldLabel htmlFor="security-current">Current password</FieldLabel>
            <Input
              id="security-current"
              type="password"
              autoComplete="current-password"
              value={form.currentPassword}
              onChange={(event) => patch({ currentPassword: event.target.value })}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="security-new">New password</FieldLabel>
            <Input
              id="security-new"
              type="password"
              autoComplete="new-password"
              value={form.newPassword}
              onChange={(event) => patch({ newPassword: event.target.value })}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="security-confirm">Confirm new password</FieldLabel>
            <Input
              id="security-confirm"
              type="password"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={(event) => patch({ confirmPassword: event.target.value })}
              required
            />
          </Field>
        </div>

        <div aria-live="polite">
          {error && (
            <p role="alert" className="text-sm font-medium text-[var(--neu-error-text)]">
              {error}
            </p>
          )}
          {!error && changed && (
            <p className="text-sm font-medium text-[color:var(--success)]">Password changed.</p>
          )}
        </div>

        <div>
          <Button
            type="submit"
            disabled={saving || !complete}
            className="[background-image:var(--neu-fill-primary)] text-[var(--primary-foreground)] disabled:text-[var(--muted-foreground)]"
          >
            <HugeiconsIcon icon={KeyIcon} strokeWidth={2} data-icon="inline-start" />
            {saving ? 'Changing…' : 'Change password'}
          </Button>
        </div>
      </form>

      <Separator />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--foreground)]">Sign out</p>
          <p className="text-[13px] text-[var(--muted-foreground)]">
            Ends this session on this device. Other devices stay signed in.
          </p>
        </div>
        <Button variant="soft" type="button" onClick={handleSignOut} className="shrink-0 self-start sm:self-center">
          <HugeiconsIcon icon={LogOutIcon} strokeWidth={2} data-icon="inline-start" />
          Sign out
        </Button>
      </div>
      </div>
    </ProfileSection>
  )
}
