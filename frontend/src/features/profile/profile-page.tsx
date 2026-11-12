import * as React from 'react'
import { SiteNavbar } from '@/components/layout/site-navbar'
import { ProfileHeader } from './profile-header'
import { PersonalInfoSection } from './profile-personal'
import { SecuritySection } from './profile-security'
import { ActivitySection } from './profile-activity'
import type { UpdateProfileReq } from './data'
import { ACCOUNT, SAVED_JOBS } from './data'

const SECTIONS = [
  { id: 'personal', label: 'Personal info' },
  { id: 'security', label: 'Security' },
  { id: 'activity', label: 'Activity' },
] as const

/**
 * Account page — the user-service record plus the two services a user
 * touches from it: auth (password, sign-out) and job-preference (saved
 * jobs). Section nav on the left at desktop width; sections stack on
 * mobile. Applications and CV content intentionally live elsewhere.
 */
export function ProfilePage() {
  const [query, setQuery] = React.useState('')
  const [location, setLocation] = React.useState('')
  const [account, setAccount] = React.useState(ACCOUNT)
  const [savedJobs, setSavedJobs] = React.useState(SAVED_JOBS)

  const applyUpdate = React.useCallback((req: UpdateProfileReq) => {
    // Local apply — the gateway PUT /api/users/{id} is the seam.
    setAccount((current) => ({ ...current, ...req, updatedAt: new Date().toISOString() }))
  }, [])

  const removeSaved = React.useCallback((savedJobId: number) => {
    setSavedJobs((current) => current.filter((savedJob) => savedJob.id !== savedJobId))
  }, [])

  return (
    <div className="min-h-dvh">
      <SiteNavbar query={query} location={location} onQueryChange={setQuery} onLocationChange={setLocation} />

      <main className="mx-auto w-full max-w-5xl px-4 pb-16 pt-6 md:px-6">
        <ProfileHeader account={account} />

        <div className="mt-6 flex gap-8">
          {/* Section nav — sticky, desktop only. */}
          <nav aria-label="Profile sections" className="hidden w-44 shrink-0 lg:block">
            <div className="sticky top-24 flex flex-col gap-1">
              <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Settings
              </p>
              {SECTIONS.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="rounded-[var(--neu-radius-control)] px-3 py-2 text-sm font-medium text-[var(--muted-foreground)] transition-colors duration-[var(--neu-duration)] hover:bg-[var(--neu-surface-soft)] hover:text-[var(--foreground)]"
                >
                  {section.label}
                </a>
              ))}
            </div>
          </nav>

          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <PersonalInfoSection key={account.updatedAt} account={account} onSaved={applyUpdate} />
            <SecuritySection />
            <ActivitySection account={account} savedJobs={savedJobs} onRemoved={removeSaved} />
          </div>
        </div>
      </main>
    </div>
  )
}
