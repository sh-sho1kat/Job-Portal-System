import { HugeiconsIcon } from '@hugeicons/react'
import { Calendar01Icon, Clock01Icon } from '@hugeicons/core-free-icons'

import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatDate, formatDateTime } from './data'
import type { UserAccount } from './data'

/**
 * Activity card — the read-only trail the user service records, as
 * side-by-side fact tiles (icon + label above, value below, no fill —
 * the same bare look as the rows in the other cards). Dates read
 * "March 2, 2026", timestamps "Apr 27, 2026, 08:10 AM".
 */
export function AccountFactsCard({ account }: { account: UserAccount }) {
  const rows = [
    {
      icon: Calendar01Icon,
      label: 'Member Since',
      value: formatDate(account.createdAt),
    },
    {
      icon: Clock01Icon,
      label: 'Last Login',
      value: formatDateTime(account.lastLoginAt),
    },
  ]

  return (
    <Card variant="raised" className="gap-0 p-5 md:p-6">
      <h2 className="text-[15px] font-semibold tracking-tight text-[var(--foreground)]">Activity</h2>
      <p className="mt-1 text-[13px] text-[var(--muted-foreground)]">
        The trail your account leaves on Hirely.
      </p>

      <Separator className="mt-4" />

      {/* Side-by-side fact tiles — label with its icon above, value below. */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label} className="flex min-w-0 flex-col gap-1">
            <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--muted-foreground)]">
              <HugeiconsIcon icon={row.icon} strokeWidth={1.8} aria-hidden="true" className="size-3.5 text-[var(--neu-accent-ink)]" />
              {row.label}
            </span>
            <span className="truncate text-sm font-semibold tabular-nums text-[var(--foreground)]">{row.value}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
