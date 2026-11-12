import * as React from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { MailIcon, PencilEditIcon, TelephoneIcon } from '@hugeicons/core-free-icons'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ROLE_LABEL, formatDate, fullName, initials } from './data'
import type { UserAccount } from './data'

/**
 * Identity header — who this user is on Hirely, with the Edit profile
 * action. The button scrolls to the Personal info form and focuses its
 * first field, so editing stays in one place.
 */
export function ProfileHeader({ account }: { account: UserAccount }) {
  const handleEdit = React.useCallback(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document.getElementById('personal')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
    // Focus lands after the scroll settles far enough not to be undone.
    window.setTimeout(() => document.getElementById('personal-first-name')?.focus({ preventScroll: true }), reduced ? 0 : 350)
  }, [])

  return (
    <Card variant="raised" className="gap-0 p-5 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {account.profilePictureUrl ? (
          <img
            src={account.profilePictureUrl}
            alt=""
            className="size-16 shrink-0 rounded-full object-cover shadow-[var(--neu-shadow-raised-sm)]"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex size-16 shrink-0 items-center justify-center rounded-full bg-[var(--neu-surface)] text-lg font-semibold text-[var(--neu-accent-ink)] [background-image:var(--neu-fill-inset)] shadow-[var(--neu-shadow-inset)]"
          >
            {initials(account)}
          </span>
        )}

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-semibold tracking-tight text-[var(--foreground)]">
            {fullName(account)}
          </h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <Badge variant="primary" className="rounded-full px-2.5 py-0.5 text-xs font-semibold">
              {ROLE_LABEL[account.userRole]}
            </Badge>
            {account.status !== 'ACTIVE' && (
              <Badge variant="destructive" className="rounded-full px-2.5 py-0.5 text-xs font-semibold">
                {account.status.charAt(0) + account.status.slice(1).toLowerCase()}
              </Badge>
            )}
            <span className="text-[13px] text-[var(--muted-foreground)]">
              Member since {formatDate(account.createdAt)}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[var(--muted-foreground)]">
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <HugeiconsIcon icon={MailIcon} strokeWidth={1.8} aria-hidden="true" className="size-4 shrink-0" />
              <span className="truncate">{account.email}</span>
            </span>
            {account.phoneNumber && (
              <span className="inline-flex items-center gap-1.5 tabular-nums">
                <HugeiconsIcon icon={TelephoneIcon} strokeWidth={1.8} aria-hidden="true" className="size-4" />
                {account.phoneNumber}
              </span>
            )}
          </div>
        </div>

        <Button variant="soft" onClick={handleEdit} className="shrink-0 self-start sm:self-center">
          <HugeiconsIcon icon={PencilEditIcon} strokeWidth={2} data-icon="inline-start" />
          Edit profile
        </Button>
      </div>
    </Card>
  )
}
