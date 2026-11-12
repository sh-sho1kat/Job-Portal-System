import * as React from 'react'
import { SiteNavbar } from '@/components/layout/site-navbar'
import { AccountFactsCard } from './account-facts'
import { IdentityCard } from './profile-identity'
import { PersonalDetailsCard } from './profile-details'
import { SecurityCard } from './profile-security'
import { SessionCard } from './profile-session'
import { WorkspaceLinksCard } from './profile-links'
import type { UpdateProfileReq } from './data'
import { ACCOUNT } from './data'

/**
 * Profile page — one focused column of cards, top to bottom: identity
 * (avatar with its change-photo option), personal details (inline edit),
 * security (role, status, change password), account facts, the
 * role-aware workspace links (applications/resumes for a job seeker,
 * company for an employer), and sign out + delete account last.
 */
export function ProfilePage() {
  const [query, setQuery] = React.useState('')
  const [location, setLocation] = React.useState('')

  // Dev-only role preview: /profile?role=employer renders the employer
  // variant without auth. Same pattern as the apply flow's ?step/?pick.
  const roleParam = import.meta.env.DEV ? new URLSearchParams(window.location.search).get('role') : null
  const [account, setAccount] = React.useState(() =>
    roleParam === 'employer' ? { ...ACCOUNT, userRole: 'ROLE_EMPLOYER' as const } : ACCOUNT,
  )

  const applyUpdate = React.useCallback((req: UpdateProfileReq) => {
    // Local apply — the gateway PUT /api/users/{id} is the seam.
    setAccount((current) => ({ ...current, ...req, updatedAt: new Date().toISOString() }))
  }, [])

  return (
    <div className="min-h-dvh">
      <SiteNavbar query={query} location={location} onQueryChange={setQuery} onLocationChange={setLocation} />

      <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-8 md:px-6">
        {/* Title zone — a plain page header; the cards below carry the rest. */}
        <header>
          <h1 className="text-[22px] font-bold tracking-tight text-[var(--foreground)]">Profile</h1>
          <p className="mt-1 text-sm leading-relaxed text-[var(--muted-foreground)]">
            How you appear on Hirely, and everything tied to your account.
          </p>
        </header>

        <div className="mt-6 flex flex-col gap-4">
          <IdentityCard account={account} onSaved={applyUpdate} />
          <PersonalDetailsCard account={account} onSaved={applyUpdate} />
          <SecurityCard account={account} />
          <AccountFactsCard account={account} />
          <WorkspaceLinksCard account={account} />
          <SessionCard />
        </div>
      </main>
    </div>
  )
}
