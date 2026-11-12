import * as React from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Delete02Icon, LogOutIcon } from '@hugeicons/core-free-icons'
import { useNavigate } from 'react-router'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { deleteAccount, signOut } from './data'

/**
 * Session card — the exit door: sign out, and delete account behind an
 * explicit confirmation. Delete is the one destructive action on the page,
 * so it gets a typed-out consequence, never a surprise.
 */
export function SessionCard() {
  const navigate = useNavigate()
  const [confirming, setConfirming] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)

  const handleSignOut = async () => {
    await signOut()
    // Navigation to the landing page happens when auth wiring lands; the
    // sign-out call itself is the seam (POST /api/auth/logout).
    navigate('/')
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteAccount()
      setConfirming(false)
      // The account is gone server-side; route home once sessions exist.
      navigate('/')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Card variant="raised" className="gap-0 p-5 md:p-6">
      <h2 className="text-[15px] font-semibold tracking-tight text-[var(--foreground)]">Session</h2>
      <p className="mt-1 text-[13px] text-[var(--muted-foreground)]">
        Leave safely, or close the account for good.
      </p>

      <Separator className="mt-4" />

      <div className="mt-4 flex flex-col gap-4">
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

        <Separator />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-[var(--foreground)]">Delete account</p>
            <p className="text-[13px] text-[var(--muted-foreground)]">
              Removes your account and its data permanently.
            </p>
          </div>
          <Button
            variant="ghost"
            type="button"
            onClick={() => setConfirming(true)}
            className="shrink-0 self-start text-[var(--neu-error-text)] hover:text-[var(--neu-error-text)] sm:self-center"
          >
            <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} data-icon="inline-start" />
            Delete account
          </Button>
        </div>
      </div>

      <Dialog open={confirming} onOpenChange={setConfirming}>
        <DialogContent className="max-w-md">
          <DialogTitle>Delete account?</DialogTitle>
          <DialogDescription>
            This removes your account and its data permanently — applications,
            saved jobs, and resumes included. This cannot be undone.
          </DialogDescription>
          <DialogFooter>
            <Button variant="soft" type="button" onClick={() => setConfirming(false)} disabled={deleting}>
              Keep account
            </Button>
            <Button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="border-[color:var(--destructive)] bg-[var(--destructive)] text-white"
            >
              <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} data-icon="inline-start" />
              {deleting ? 'Deleting…' : 'Delete account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
