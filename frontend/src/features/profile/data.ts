/**
 * Profile = the user-service account, plus the two services a user touches
 * from it: auth (password) and job-preference (saved jobs).
 *
 * Types mirror the backend 1:1:
 *  - `UserAccount`    ← `UserResponse`          (GET /api/users/{id})
 *  - `UpdateProfileReq` ← `UpdateUserRequest`   (PUT /api/users/{id})
 *  - `ChangePasswordReq` ← `ChangePasswordRequest` (PUT /api/auth/me/password)
 *  - `SavedJob`       ← `SavedJobResponse`      (GET /api/preferences/saved-jobs)
 *
 * Applications are deliberately not shown here, and CV content (experience,
 * education, projects) belongs to the resume service — not this page.
 */

export type UserRole =
  | 'ROLE_SUPER_ADMIN'
  | 'ROLE_ADMIN'
  | 'ADMIN' // present in the backend enum (likely a legacy value) — handled, not invented
  | 'ROLE_JOB_SEEKER'
  | 'ROLE_EMPLOYER'

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DELETED'

export interface UserAccount {
  id: number
  firstName: string
  middleName: string | null
  lastName: string
  email: string
  phoneNumber: string | null
  userRole: UserRole
  status: UserStatus
  profilePictureUrl: string | null
  /** ISO instant */
  createdAt: string
  updatedAt: string
  lastLoginAt: string | null
}

/** Exactly the fields `UpdateUserRequest` accepts — email is not editable here. */
export interface UpdateProfileReq {
  firstName: string
  middleName: string | null
  lastName: string
  phoneNumber: string | null
  profilePictureUrl: string | null
}

/** Exactly `ChangePasswordRequest` — rules enforced again client-side. */
export interface ChangePasswordReq {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export const PASSWORD_RULE =
  'At least 8 characters, with an uppercase letter, a lowercase letter, a number, and one of @$!%*?&.'

export const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/

/** The backend's password rules, one check per row — consumed by the live
 *  checklist under the new-password field. */
export function passwordChecks(password: string): Array<{ label: string; ok: boolean }> {
  return [
    { label: 'At least 8 characters', ok: password.length >= 8 },
    { label: 'One uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', ok: /[a-z]/.test(password) },
    { label: 'One number', ok: /\d/.test(password) },
    { label: 'One of @$!%*?&', ok: /[@$!%*?&]/.test(password) },
  ]
}

export const ROLE_LABEL: Record<UserRole, string> = {
  ROLE_SUPER_ADMIN: 'Super admin',
  ROLE_ADMIN: 'Admin',
  ADMIN: 'Admin',
  ROLE_JOB_SEEKER: 'Job seeker',
  ROLE_EMPLOYER: 'Employer',
}

export const STATUS_LABEL: Record<UserStatus, string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  SUSPENDED: 'Suspended',
  DELETED: 'Deleted',
}

/**
 * `SavedJobResponse` joined with its job at read time. The backend row is
 * exactly `{ id, candidateId, jobId, companyId, notes, savedAt }` (see
 * `SavedJobResponse.java`); jobSlug/jobTitle/companyName are resolved from
 * job-service/company-service via `jobId`/`companyId` — the composition the
 * gateway (or a future BFF call) owns.
 */
export interface SavedJob {
  id: number
  candidateId: number
  jobId: number
  companyId: number
  jobSlug: string
  jobTitle: string
  companyName: string
  notes: string | null
  /** ISO instant */
  savedAt: string
}

// --- Placeholder data (gateway not wired yet) -------------------------------

export const ACCOUNT: UserAccount = {
  id: 42,
  firstName: 'Sahil',
  middleName: null,
  lastName: 'Hossain',
  email: 'sahil.hossain@example.com',
  phoneNumber: '+8801712345678',
  userRole: 'ROLE_JOB_SEEKER',
  status: 'ACTIVE',
  profilePictureUrl: null,
  createdAt: '2025-03-12T09:24:00Z',
  updatedAt: '2025-11-08T16:02:00Z',
  lastLoginAt: '2025-11-12T08:41:00Z',
}

export const SAVED_JOBS: SavedJob[] = [
  {
    id: 11,
    candidateId: 42,
    jobId: 4,
    companyId: 3,
    jobSlug: 'northwind-frontend',
    jobTitle: 'Frontend React Developer',
    companyName: 'Northwind Analytics',
    notes: 'Matches my React + design-systems experience. Apply after the Zosh interview.',
    savedAt: '2025-11-09T15:20:00Z',
  },
  {
    id: 9,
    candidateId: 42,
    jobId: 6,
    companyId: 5,
    jobSlug: 'ambertech-qa',
    jobTitle: 'QA Automation Engineer',
    companyName: 'Ambertech',
    notes: null,
    savedAt: '2025-10-28T11:02:00Z',
  },
  {
    id: 7,
    candidateId: 42,
    jobId: 5,
    companyId: 6,
    jobSlug: 'greenfield-analyst',
    jobTitle: 'Data Analyst',
    companyName: 'Greenfield Labs',
    notes: 'Hybrid, two days on-site — check the commute before applying.',
    savedAt: '2025-10-15T09:41:00Z',
  },
]

// --- Seams (replace when the gateway is wired) ------------------------------

/** `PUT /api/users/{id}` — email is managed by the auth flow, not this call. */
export async function updateUserProfile(req: UpdateProfileReq): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 700))
  void req
}

/** `PUT /api/auth/me/password`. */
export async function changePassword(req: ChangePasswordReq): Promise<void> {
  void req
  await new Promise((resolve) => setTimeout(resolve, 700))
}

/** `DELETE /api/preferences/saved-jobs/{savedJobId}`. */
export async function removeSavedJob(savedJobId: number): Promise<void> {
  void savedJobId
  await new Promise((resolve) => setTimeout(resolve, 500))
}

/** `POST /api/auth/logout`. */
export async function signOut(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 400))
}

/** `DELETE /api/users/{id}` — removes the account permanently. */
export async function deleteAccount(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 700))
}

// --- Formatting helpers (UTC-pinned so SSR/tests agree) ---------------------

export function fullName(account: Pick<UserAccount, 'firstName' | 'middleName' | 'lastName'>): string {
  return [account.firstName, account.middleName, account.lastName].filter(Boolean).join(' ')
}

export function initials(account: Pick<UserAccount, 'firstName' | 'lastName'>): string {
  const first = account.firstName.trim()[0] ?? ''
  const last = account.lastName.trim()[0] ?? ''
  return (first + last).toUpperCase() || '?'
}

const DATE_FORMAT = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

const DATE_TIME_FORMAT = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'UTC',
})

export function formatDate(iso: string): string {
  return DATE_FORMAT.format(new Date(iso))
}

export function formatDateTime(iso: string | null): string {
  return iso ? DATE_TIME_FORMAT.format(new Date(iso)) : '—'
}
