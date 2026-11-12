import * as React from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Camera01Icon, TickIcon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ROLE_LABEL, fullName, initials } from './data'
import type { UpdateProfileReq, UserAccount } from './data'
import { updateUserProfile } from './data'

const URL_MAX = 255

/**
 * Identity card — the profile's face: avatar, name, and role. Clicking the
 * avatar opens the photo dialog (LinkedIn's camera-badge pattern — the chip
 * is always visible, so it works on touch too). All other details live in
 * the cards below; nothing is editable in place here.
 */
export function IdentityCard({
  account,
  onSaved,
}: {
  account: UserAccount
  onSaved: (req: UpdateProfileReq) => void
}) {
  const [photoOpen, setPhotoOpen] = React.useState(false)
  const [photoDraft, setPhotoDraft] = React.useState('')
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const openPhoto = () => {
    setPhotoDraft(account.profilePictureUrl ?? '')
    setError(null)
    setPhotoOpen(true)
  }

  const savePhoto = async (profilePictureUrl: string | null) => {
    // The photo rides the same `UpdateUserRequest` seam as the other details;
    // the full request is sent so the backend never sees a partial payload.
    const req: UpdateProfileReq = {
      firstName: account.firstName,
      middleName: account.middleName,
      lastName: account.lastName,
      phoneNumber: account.phoneNumber,
      profilePictureUrl,
    }
    setSaving(true)
    try {
      await updateUserProfile(req)
      onSaved(req)
      setPhotoOpen(false)
    } catch {
      setError('Saving failed. Nothing was lost — try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card variant="raised" className="gap-0 p-6 md:p-7">
      <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={openPhoto}
          aria-label="Change profile photo"
          className="group relative shrink-0 rounded-full outline-hidden focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-4 focus-visible:outline-[color:var(--ring)]"
        >
          {account.profilePictureUrl ? (
            <img
              src={account.profilePictureUrl}
              alt=""
              className="size-20 rounded-full object-cover shadow-[var(--neu-shadow-raised-sm)]"
            />
          ) : (
            <span
              aria-hidden="true"
              className="flex size-20 items-center justify-center rounded-full text-2xl font-semibold text-[var(--primary-foreground)] [background-image:var(--neu-fill-primary)] shadow-[var(--neu-shadow-raised-sm)]"
            >
              {initials(account)}
            </span>
          )}
          {/* Camera chip — always visible (LinkedIn-style), so touch devices
              get the affordance without hover. */}
          <span
            aria-hidden="true"
            className="absolute -right-0.5 -bottom-0.5 flex size-7 items-center justify-center rounded-full border border-[color:var(--neu-edge)] bg-[var(--neu-surface)] text-[var(--neu-accent-ink)] shadow-[var(--neu-shadow-raised-sm)] transition-transform duration-[var(--neu-duration)] group-hover:scale-105 motion-reduce:transition-none"
          >
            <HugeiconsIcon icon={Camera01Icon} strokeWidth={2} className="size-3.5" />
          </span>
        </button>

        <div className="min-w-0">
          <h2 className="truncate text-2xl font-bold tracking-tight text-[var(--foreground)]">
            {fullName(account)}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant="primary" className="rounded-full px-2.5 py-0.5 text-xs font-semibold">
              {ROLE_LABEL[account.userRole]}
            </Badge>
            {account.status !== 'ACTIVE' && (
              <Badge variant="destructive" className="rounded-full px-2.5 py-0.5 text-xs font-semibold">
                {account.status.charAt(0) + account.status.slice(1).toLowerCase()}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <Dialog open={photoOpen} onOpenChange={setPhotoOpen}>
        <DialogContent className="max-w-md">
          <DialogTitle>Profile photo</DialogTitle>
          <DialogDescription>Paste a link to an image hosted anywhere.</DialogDescription>

          <div className="flex items-center gap-4">
            {photoDraft.trim() ? (
              <img
                src={photoDraft.trim()}
                alt=""
                className="size-14 shrink-0 rounded-full object-cover shadow-[var(--neu-shadow-raised-sm)]"
              />
            ) : (
              <span
                aria-hidden="true"
                className="flex size-14 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-[var(--primary-foreground)] [background-image:var(--neu-fill-primary)] shadow-[var(--neu-shadow-raised-sm)]"
              >
                {initials(account)}
              </span>
            )}
            <Field className="min-w-0 flex-1">
              <FieldLabel htmlFor="photo-url">Photo URL</FieldLabel>
              <Input
                id="photo-url"
                type="url"
                value={photoDraft}
                maxLength={URL_MAX}
                onChange={(event) => {
                  setPhotoDraft(event.target.value)
                  setError(null)
                }}
                placeholder="https://…"
              />
              <FieldDescription>The preview updates as you type.</FieldDescription>
            </Field>
          </div>

          {error && (
            <p role="alert" className="text-sm font-medium text-[var(--neu-error-text)]">
              {error}
            </p>
          )}

          <DialogFooter>
            {account.profilePictureUrl && (
              <Button variant="ghost" type="button" onClick={() => savePhoto(null)} disabled={saving}>
                Remove photo
              </Button>
            )}
            <Button variant="soft" type="button" onClick={() => setPhotoOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => savePhoto(photoDraft.trim() || null)}
              disabled={saving || photoDraft.trim() === (account.profilePictureUrl ?? '')}
              className="[background-image:var(--neu-fill-primary)] text-[var(--primary-foreground)]"
            >
              <HugeiconsIcon icon={TickIcon} strokeWidth={2} data-icon="inline-start" />
              {saving ? 'Saving…' : 'Save photo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
