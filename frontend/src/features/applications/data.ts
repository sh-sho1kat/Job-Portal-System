import * as React from 'react'

import type { Badge } from '@/components/ui/badge'

/**
 * Stand-in for the application service through the gateway — the candidate's
 * own applications (`GET /api/applications/my-applications` when wired). The
 * shapes mirror the backend's `ApplicationResponse` and its summary DTOs:
 * `JobSummaryResponse` (job), `CompanySummaryResponse` (company), and the
 * `ApplicationStatus` enum. The attached resume, cover letter, notes, and
 * screening stay out of the list until a view needs them; withdraw mirrors
 * `POST /api/applications/{id}/withdraw`.
 */

/** The backend's `ApplicationStatus` enum. */
export type ApplicationStatus =
  | 'PENDING'
  | 'REVIEWING'
  | 'SHORTLISTED'
  | 'INTERVIEW_SCHEDULED'
  | 'REJECTED'
  | 'HIRED'
  | 'WITHDRAWN'

export interface ApplicationJobSummary {
  /** The job's id — links the row to /jobs/{id}. */
  id: string
  title: string
  slug: string
  employmentType: string
  workMode: string
}

export interface ApplicationCompanySummary {
  name: string
  logoUrl: string | null
}

export interface Application {
  id: string
  job: ApplicationJobSummary
  company: ApplicationCompanySummary
  /** Bare amount in taka — `TakaMark` renders the ৳ glyph. */
  expectedSalary: number
  /** `LocalDate` — the start date offered in the application. */
  availableFrom: string
  status: ApplicationStatus
  isStarred: boolean
  /** `Instant` — ISO timestamp of submission. */
  appliedAt: string
  /** `Instant` — last status change. */
  updatedAt: string
  /** From `WithdrawalResponse` — set when the application is withdrawn. */
  withdrawnReason?: string
}

/**
 * Demo rows referencing the jobs dataset — applications the demo candidate
 * has submitted across the jobs workspace.
 */
export const APPLICATIONS: Application[] = [
  {
    id: 'app-northwind-frontend',
    job: {
      id: 'northwind-frontend',
      title: 'Frontend Developer',
      slug: 'northwind-frontend',
      employmentType: 'Full-time',
      workMode: 'Remote',
    },
    company: { name: 'Northwind Analytics', logoUrl: null },
    expectedSalary: 960_000,
    availableFrom: '2026-01-05',
    status: 'SHORTLISTED',
    isStarred: true,
    appliedAt: '2025-11-10T09:24:00Z',
    updatedAt: '2025-11-12T10:00:00Z',
  },
  {
    id: 'app-ambertech-qa',
    job: {
      id: 'ambertech-qa',
      title: 'QA Engineer',
      slug: 'ambertech-qa',
      employmentType: 'Full-time',
      workMode: 'On-site',
    },
    company: { name: 'Ambertech Solutions', logoUrl: null },
    expectedSalary: 720_000,
    availableFrom: '2026-01-01',
    status: 'REVIEWING',
    isStarred: false,
    appliedAt: '2025-11-06T14:02:00Z',
    updatedAt: '2025-11-09T08:20:00Z',
  },
  {
    id: 'app-greenfield-analyst',
    job: {
      id: 'greenfield-analyst',
      title: 'Business Analyst',
      slug: 'greenfield-analyst',
      employmentType: 'Full-time',
      workMode: 'Hybrid',
    },
    company: { name: 'Greenfield Consulting', logoUrl: null },
    expectedSalary: 840_000,
    availableFrom: '2025-12-15',
    status: 'INTERVIEW_SCHEDULED',
    isStarred: true,
    appliedAt: '2025-10-28T10:15:00Z',
    updatedAt: '2025-11-11T15:45:00Z',
  },
  {
    id: 'app-zosh-junior-web',
    job: {
      id: 'zosh-junior-web',
      title: 'Junior Web Developer',
      slug: 'zosh-junior-web',
      employmentType: 'Full-time',
      workMode: 'Hybrid',
    },
    company: { name: 'Zosh Technologies Pvt. Ltd.', logoUrl: null },
    expectedSalary: 600_000,
    availableFrom: '2026-01-01',
    status: 'PENDING',
    isStarred: false,
    appliedAt: '2025-11-11T08:41:00Z',
    updatedAt: '2025-11-11T08:41:00Z',
  },
  {
    id: 'app-zosh-brand-manager',
    job: {
      id: 'zosh-brand-manager',
      title: 'Brand Manager',
      slug: 'zosh-brand-manager',
      employmentType: 'Full-time',
      workMode: 'On-site',
    },
    company: { name: 'Zosh Technologies Pvt. Ltd.', logoUrl: null },
    expectedSalary: 1_050_000,
    availableFrom: '2026-01-01',
    status: 'REJECTED',
    isStarred: false,
    appliedAt: '2025-10-14T16:30:00Z',
    updatedAt: '2025-10-30T12:10:00Z',
  },
  {
    id: 'app-zosh-compliance',
    job: {
      id: 'zosh-compliance',
      title: 'Compliance Officer',
      slug: 'zosh-compliance',
      employmentType: 'Part-time',
      workMode: 'Remote',
    },
    company: { name: 'Zosh Technologies Pvt. Ltd.', logoUrl: null },
    expectedSalary: 480_000,
    availableFrom: '2025-12-01',
    status: 'WITHDRAWN',
    isStarred: false,
    appliedAt: '2025-09-22T11:05:00Z',
    updatedAt: '2025-09-25T09:00:00Z',
    withdrawnReason: 'Accepted another offer',
  },
]

/** `ApplicationStatus` humanized for display. */
export const STATUS_LABEL: Record<ApplicationStatus, string> = {
  PENDING: 'Pending',
  REVIEWING: 'Reviewing',
  SHORTLISTED: 'Shortlisted',
  INTERVIEW_SCHEDULED: 'Interview scheduled',
  REJECTED: 'Not selected',
  HIRED: 'Hired',
  WITHDRAWN: 'Withdrawn',
}

/** Badge treatment per status — live stages pop, terminal ones stay quiet. */
export const STATUS_VARIANT: Record<
  ApplicationStatus,
  React.ComponentProps<typeof Badge>['variant']
> = {
  PENDING: 'soft',
  REVIEWING: 'primary',
  SHORTLISTED: 'success',
  INTERVIEW_SCHEDULED: 'primary',
  REJECTED: 'destructive',
  HIRED: 'success',
  WITHDRAWN: 'outline',
}

/** Terminal statuses — the process has ended, one way or the other. */
export function isClosed(status: ApplicationStatus): boolean {
  return status === 'REJECTED' || status === 'WITHDRAWN'
}

/** Only live, unreviewed applications can still be withdrawn. */
export function canWithdraw(status: ApplicationStatus): boolean {
  return status === 'PENDING' || status === 'REVIEWING'
}

export interface TimelineStage {
  label: string
  done: boolean
  current: boolean
}

/**
 * The application's journey through the live statuses — Applied → Reviewing
 * → Shortlisted → Interview → Offer — with the stage the status sits at
 * marked current. Closed applications get no current stage; the page notes
 * the outcome separately.
 */
export function statusTimeline(status: ApplicationStatus): TimelineStage[] {
  const live: ApplicationStatus[] = [
    'PENDING',
    'REVIEWING',
    'SHORTLISTED',
    'INTERVIEW_SCHEDULED',
    'HIRED',
  ]
  const index = live.indexOf(status)
  const stages = ['Applied', 'Reviewing', 'Shortlisted', 'Interview', 'Offer']
  return stages.map((label, i) => ({
    label,
    done: index >= i,
    current: index === i,
  }))
}

/** Compact day-first date for the rows — "12 Nov 2025". */
const DATE_FORMAT = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

const DATE_TIME_FORMAT = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'UTC',
})

export function formatAppliedAt(iso: string): string {
  return DATE_FORMAT.format(new Date(iso))
}

export function formatUpdatedAt(iso: string): string {
  return DATE_TIME_FORMAT.format(new Date(iso))
}

/** `LocalDate` (available from) as a plain date — "5 Jan 2026". */
export function formatAvailableFrom(iso: string): string {
  return DATE_FORMAT.format(new Date(`${iso}T00:00:00Z`))
}

/** en-US grouping for the expected salary, e.g. "960,000" — the ৳ glyph
 *  comes from `TakaMark`, same as the job cards. */
export function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-US').format(amount)
}
