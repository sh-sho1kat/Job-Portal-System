import * as React from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { BookmarkIcon, DeleteIcon } from '@hugeicons/core-free-icons'
import { Link } from 'react-router'

import { Badge } from '@/components/ui/badge'
import { Button, buttonClassName } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ProfileSection } from './profile-personal'
import { STATUS_LABEL, formatDate, formatDateTime, removeSavedJob } from './data'
import type { SavedJob, UserAccount } from './data'

/**
 * Activity — what the user has done on Hirely that the services record:
 * saved jobs (`GET /api/preferences/saved-jobs`) and the account's own
 * trail (member since, last sign-in). Applications are intentionally not
 * shown here.
 */
export function ActivitySection({
  account,
  savedJobs,
  onRemoved,
}: {
  account: UserAccount
  savedJobs: SavedJob[]
  onRemoved: (savedJobId: number) => void
}) {
  const [removingId, setRemovingId] = React.useState<number | null>(null)

  const handleRemove = async (savedJob: SavedJob) => {
    setRemovingId(savedJob.id)
    await removeSavedJob(savedJob.id)
    setRemovingId(null)
    onRemoved(savedJob.id)
  }

  return (
    <ProfileSection
      id="activity"
      title="Activity"
      description="Jobs you saved and the trail your account leaves."
    >
      <div className="flex min-w-0 flex-col gap-4">
      {savedJobs.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-[var(--neu-radius-surface)] bg-[var(--neu-surface)] [background-image:var(--neu-fill-inset)] px-6 py-10 text-center shadow-[var(--neu-shadow-inset)]">
          <HugeiconsIcon icon={BookmarkIcon} strokeWidth={1.5} aria-hidden="true" className="size-8 text-[var(--muted-foreground)]" />
          <p className="text-sm font-medium text-[var(--foreground)]">Nothing saved yet</p>
          <p className="max-w-xs text-sm text-[var(--muted-foreground)]">
            Save a job from its page and it will be waiting for you here.
          </p>
          <Link to="/jobs" className={buttonClassName({ variant: 'soft', size: 'sm' })}>
            Browse jobs
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col">
          {savedJobs.map((savedJob, index) => (
            <li key={savedJob.id}>
              {index > 0 && <Separator />}
              <div className="flex items-start gap-3 py-3">
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-[var(--neu-radius-control)] bg-[var(--neu-surface)] [background-image:var(--neu-fill-inset)] text-[var(--neu-accent-ink)] shadow-[var(--neu-shadow-inset)]"
                >
                  <HugeiconsIcon icon={BookmarkIcon} strokeWidth={1.8} className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/jobs/${savedJob.jobSlug}`}
                    className="block truncate text-sm font-semibold text-[var(--foreground)] transition-colors duration-[var(--neu-duration)] hover:text-[var(--neu-accent-ink)]"
                  >
                    {savedJob.jobTitle}
                  </Link>
                  <p className="mt-0.5 text-[13px] text-[var(--muted-foreground)]">
                    {savedJob.companyName} · Saved {formatDate(savedJob.savedAt)}
                  </p>
                  {savedJob.notes && (
                    <p className="mt-1 line-clamp-2 text-[13px] text-[var(--muted-foreground)] italic">
                      “{savedJob.notes}”
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  type="button"
                  size="sm"
                  onClick={() => handleRemove(savedJob)}
                  disabled={removingId === savedJob.id}
                  className="shrink-0 text-[var(--muted-foreground)] hover:text-[var(--neu-error-text)]"
                >
                  <HugeiconsIcon icon={DeleteIcon} strokeWidth={2} data-icon="inline-start" />
                  {removingId === savedJob.id ? 'Removing…' : 'Remove'}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Separator />

      <dl className="grid gap-x-8 gap-y-2 sm:grid-cols-3">
        <div>
          <dt className="text-[13px] text-[var(--muted-foreground)]">Member since</dt>
          <dd className="mt-0.5 text-sm font-medium tabular-nums text-[var(--foreground)]">
            {formatDate(account.createdAt)}
          </dd>
        </div>
        <div>
          <dt className="text-[13px] text-[var(--muted-foreground)]">Last signed in</dt>
          <dd className="mt-0.5 text-sm font-medium tabular-nums text-[var(--foreground)]">
            {formatDateTime(account.lastLoginAt)}
          </dd>
        </div>
        <div>
          <dt className="text-[13px] text-[var(--muted-foreground)]">Account status</dt>
          <dd className="mt-0.5">
            <Badge
              variant={account.status === 'ACTIVE' ? 'success' : 'destructive'}
              className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
            >
              {STATUS_LABEL[account.status]}
            </Badge>
          </dd>
        </div>
      </dl>
      </div>
    </ProfileSection>
  )
}
