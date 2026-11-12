import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatDate, formatDateTime } from './data'
import type { UserAccount } from './data'

/**
 * Account card — the read-only trail the user service records: the
 * account's dates. Status and role live in the Security card; this card
 * only answers "how long has this account been around".
 */
export function AccountFactsCard({ account }: { account: UserAccount }) {
  const rows = [
    { label: 'Member since', value: formatDate(account.createdAt) },
    { label: 'Last signed in', value: formatDateTime(account.lastLoginAt) },
    { label: 'Details updated', value: formatDateTime(account.updatedAt) },
  ]

  return (
    <Card variant="raised" className="gap-0 p-5 md:p-6">
      <h2 className="text-[15px] font-semibold tracking-tight text-[var(--foreground)]">Account</h2>
      <p className="mt-1 text-[13px] text-[var(--muted-foreground)]">
        The trail your account leaves on Hirely.
      </p>

      <Separator className="mt-4" />

      <dl className="mt-4 flex flex-col gap-3">
        {rows.map((row) => (
          <div key={row.label} className="flex items-baseline justify-between gap-4">
            <dt className="text-[13px] text-[var(--muted-foreground)]">{row.label}</dt>
            <dd className="text-right text-sm font-medium tabular-nums text-[var(--foreground)]">{row.value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  )
}
