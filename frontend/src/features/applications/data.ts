import * as React from 'react'

import type { Badge } from '@/components/ui/badge'

/**
 * Stand-in for the application service through the gateway — the candidate's
 * own applications (`GET /api/applications?candidateId=…` when wired). The
 * shapes mirror the backend's `ApplicationResponse` and its summary DTOs:
 * `JobSummaryResponse` (job), `CompanySummaryResponse` (company),
 * `ResumeSummaryResponse` (resume, by title), and the `ApplicationStatus`
 * enum. Fields the candidate list doesn't need (coverLetter, notes,
 * screening, withdrawal) are left out until a detail view asks for them.
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

export interface ApplicationResumeSummary {
  /** The resume title that was attached, from `ResumeSummaryResponse`. */
  title: string
}

export interface Application {
  id: string
  job: ApplicationJobSummary
  company: ApplicationCompanySummary
  resume: ApplicationResumeSummary
  /** Bare amount in taka — `TakaMark` renders the ৳ glyph. */
  expectedSalary: number
  status: ApplicationStatus
  isStarred: boolean
  /** `Instant` — ISO timestamp of submission. */
  appliedAt: string
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
    resume: { title: 'Frontend Developer Resume (2026)' },
    expectedSalary: 960_000,
    status: 'SHORTLISTED',
    isStarred: true,
    appliedAt: '2025-11-10T09:24:00Z',
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
    resume: { title: 'Frontend Developer Resume (2026)' },
    expectedSalary: 720_000,
    status: 'REVIEWING',
    isStarred: false,
    appliedAt: '2025-11-06T14:02:00Z',
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
    resume: { title: 'Frontend Developer Resume (2026)' },
    expectedSalary: 840_000,
    status: 'INTERVIEW_SCHEDULED',
    isStarred: true,
    appliedAt: '2025-10-28T10:15:00Z',
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
    resume: { title: 'Frontend Developer Resume (2026)' },
    expectedSalary: 600_000,
    status: 'PENDING',
    isStarred: false,
    appliedAt: '2025-11-11T08:41:00Z',
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
    resume: { title: 'Frontend Developer Resume (2026)' },
    expectedSalary: 1_050_000,
    status: 'REJECTED',
    isStarred: false,
    appliedAt: '2025-10-14T16:30:00Z',
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
    resume: { title: 'Frontend Developer Resume (2026)' },
    expectedSalary: 480_000,
    status: 'WITHDRAWN',
    isStarred: false,
    appliedAt: '2025-09-22T11:05:00Z',
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

/** Compact day-first date for the rows — "12 Nov 2025". */
const DATE_FORMAT = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

export function formatAppliedAt(iso: string): string {
  return DATE_FORMAT.format(new Date(iso))
}

/** en-US grouping for the expected salary, e.g. "960,000" — the ৳ glyph
 *  comes from `TakaMark`, same as the job cards. */
export function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-US').format(amount)
}
