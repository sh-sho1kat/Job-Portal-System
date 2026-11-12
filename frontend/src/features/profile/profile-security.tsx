import * as React from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { EyeClosedIcon, EyeIcon, TickIcon } from '@hugeicons/core-free-icons'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { ROLE_LABEL, STATUS_LABEL, changePassword, passwordChecks } from './data'
import type { UserAccount } from './data'

/** Password entry with a show/hide toggle — standard for auth forms, so
 *  people can verify what they typed before submitting. */
function PasswordInput({
  id,
  autoComplete,
  value,
  onChange,
  required,
}: {
  id: string
  autoComplete: 'current-password' | 'new-password'
  value: string
  onChange: (value: string) => void
  required?: boolean
}) {
  const [shown, setShown] = React.useState(false)
  return (
    <div className="relative">
      <Input
        id={id}
        type={shown ? 'text' : 'password'}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="pr-11"
        required={required}
      />
      <button
        type="button"
        onClick={() => setShown((current) => !current)}
        aria-label={shown ? 'Hide password' : 'Show password'}
        aria-pressed={shown}
        className="absolute right-2.5 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-[var(--muted-foreground)] transition-colors duration-[var(--neu-duration)] hover:text-[var(--foreground)] focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)]"
      >
        <HugeiconsIcon icon={shown ? EyeClosedIcon : EyeIcon} strokeWidth={1.8} aria-hidden="true" className="size-4" />
      </button>
    </div>
  )
}

/** The backend's password rules, ticked live as the new password is typed.
 *  The match row only appears once a confirmation has been entered, so the
 *  list never asks about a field the user hasn't reached yet. */
function PasswordChecklist({ password, confirm }: { password: string; confirm: string }) {
  const checks = passwordChecks(password)
  const showMatch = confirm.length > 0
  const itemClass = 'flex items-center gap-2 text-[13px]'
  return (
    <ul className="grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
      {checks.map((check) => (
        <li key={check.label} className={itemClass}>
          {check.ok ? (
            <HugeiconsIcon
              icon={TickIcon}
              strokeWidth={2.4}
              aria-hidden="true"
              className="size-3.5 shrink-0 text-[color:var(--success)]"
            />
          ) : (
            <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-[var(--muted-foreground)] opacity-50" />
          )}
          <span className={cn(check.ok ? 'font-medium text-[var(--foreground)]' : 'text-[var(--muted-foreground)]')}>
            {check.label}
          </span>
        </li>
      ))}
      {showMatch && (
        <li className={cn(itemClass, 'sm:col-span-2')}>
          {password === confirm ? (
            <HugeiconsIcon
              icon={TickIcon}
              strokeWidth={2.4}
              aria-hidden="true"
              className="size-3.5 shrink-0 text-[color:var(--success)]"
            />
          ) : (
            <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-[var(--muted-foreground)] opacity-50" />
          )}
          <span className={cn(password === confirm ? 'font-medium text-[var(--foreground)]' : 'text-[var(--muted-foreground)]')}>
            Both passwords match
          </span>
        </li>
      )}
    </ul>
  )
}

/**
 * Security card — the account's role and status at a glance, plus the
 * change-password option. The password form stays collapsed until
 * "Change password" is clicked, so the card reads as three quiet rows
 * until the user asks for the form. Rules mirror the backend's
 * `ChangePasswordRequest`.
 */
export function SecurityCard({ account }: { account: UserAccount }) {
  const [changing, setChanging] = React.useState(false)
  const [form, setForm] = React.useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [changed, setChanged] = React.useState(false)

  const patch = (partial: Partial<typeof form>) => {
    setForm((current) => ({ ...current, ...partial }))
    setError(null)
    setChanged(false)
  }

  const complete =
    Boolean(form.currentPassword) && Boolean(form.newPassword) && Boolean(form.confirmPassword)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (form.newPassword.length < 8 || form.newPassword.length > 64) {
      return setError('New password must be between 8 and 64 characters.')
    }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/.test(form.newPassword)) {
      return setError('New password needs an uppercase letter, a lowercase letter, a number, and one of @$!%*?&.')
    }
    if (form.newPassword !== form.confirmPassword) {
      return setError('New password and confirm password must match.')
    }
    setSaving(true)
    try {
      await changePassword(form)
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setChanged(true)
      setChanging(false)
    } catch {
      setError('Changing the password failed. Nothing was lost — try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card variant="raised" className="gap-0 p-5 md:p-6">
      <h2 className="text-[15px] font-semibold tracking-tight text-[var(--foreground)]">Security</h2>
      <p className="mt-1 text-[13px] text-[var(--muted-foreground)]">
        Your access level and sign-in protection.
      </p>

      <Separator className="mt-4" />

      <dl className="mt-4 flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-[13px] text-[var(--muted-foreground)]">Role</dt>
          <dd className="text-right text-sm font-medium text-[var(--foreground)]">{ROLE_LABEL[account.userRole]}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-[13px] text-[var(--muted-foreground)]">Status</dt>
          <dd>
            <Badge
              variant={account.status === 'ACTIVE' ? 'success' : 'destructive'}
              className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
            >
              {STATUS_LABEL[account.status]}
            </Badge>
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-[13px] text-[var(--muted-foreground)]">Password</dt>
          <dd>
            {!changing && (
              <Button variant="soft" size="sm" type="button" onClick={() => setChanging(true)}>
                Change password
              </Button>
            )}
          </dd>
        </div>
      </dl>

      {changing && (
        <form onSubmit={handleSubmit} className="mt-5 flex min-w-0 flex-col gap-5 border-t border-[color:var(--neu-edge)] pt-5">
          <Field>
            <FieldLabel htmlFor="security-current">Current password</FieldLabel>
            <PasswordInput
              id="security-current"
              autoComplete="current-password"
              value={form.currentPassword}
              onChange={(value) => patch({ currentPassword: value })}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="security-new">New password</FieldLabel>
            <PasswordInput
              id="security-new"
              autoComplete="new-password"
              value={form.newPassword}
              onChange={(value) => patch({ newPassword: value })}
              required
            />
            <PasswordChecklist password={form.newPassword} confirm={form.confirmPassword} />
          </Field>
          <Field>
            <FieldLabel htmlFor="security-confirm">Confirm new password</FieldLabel>
            <PasswordInput
              id="security-confirm"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={(value) => patch({ confirmPassword: value })}
              required
            />
          </Field>

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

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              disabled={saving || !complete}
              className="[background-image:var(--neu-fill-primary)] text-[var(--primary-foreground)]"
            >
              <HugeiconsIcon icon={TickIcon} strokeWidth={2} data-icon="inline-start" />
              {saving ? 'Changing…' : 'Change password'}
            </Button>
            <Button
              variant="soft"
              type="button"
              onClick={() => {
                setChanging(false)
                setError(null)
                setChanged(false)
              }}
              disabled={saving}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {!changing && changed && (
        <p aria-live="polite" className="mt-4 text-sm font-medium text-[color:var(--success)]">
          Password changed.
        </p>
      )}
    </Card>
  )
}
