import { RESUMES } from '../data/resumes'
import type { Job } from '../data/types'

/**
 * Apply-flow draft state. Field names mirror the backend's
 * ApplicationRequest DTO (jobId, companyId, resumeId, coverLetter,
 * expectedSalary, availableFrom) so submit maps 1:1 when wired.
 */
export interface ApplicationDraft {
  resumeId: string | null
  coverLetter: string
  /** Kept as the raw input string; parsed/validated at the step boundary. */
  expectedSalary: string
  availableFrom: Date | undefined
}

export const EMPTY_DRAFT: ApplicationDraft = {
  resumeId: null,
  coverLetter: '',
  expectedSalary: '',
  availableFrom: undefined,
}

export const COVER_LETTER_MAX = 5000

/** What the submit seam will POST — mirrors ApplicationRequest. */
export interface ApplicationPayload {
  jobId: string
  companyId: string
  resumeId: string
  coverLetter: string
  expectedSalary: number | null
  /** ISO yyyy-mm-dd, or null when the candidate didn't set one. */
  availableFrom: string | null
}

/**
 * Seam: POST /api/applications/create through the gateway (VITE_API_BASE_URL)
 * with the ApplicationRequest body. The static job slug maps to the service's
 * numeric jobId once the job-service lookup exists. Resolves after a beat so
 * the pending state is real, not painted on.
 */
export function submitApplication(payload: ApplicationPayload): Promise<void> {
  void payload
  return new Promise((resolve) => setTimeout(resolve, 900))
}

/**
 * Salary input → BigDecimal-shaped value, or null when left blank.
 * Commas are accepted because the placeholder and error copy both
 * present amounts as "75,000" — paste and typed commas both work.
 */
export function parseExpectedSalary(input: string): number | null | 'invalid' {
  const trimmed = input.trim().replace(/,/g, '')
  if (!trimmed) return null
  if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return 'invalid'
  const value = Number(trimmed)
  return value >= 0 ? value : 'invalid'
}

/**
 * Local draft generator for "Write with AI". Seam: replace with the
 * gateway /ai service call (prompt = job posting + resume skills) when the
 * AI endpoint exists — the signature already takes everything it needs.
 */
export function generateCoverLetter(job: Job, resumeId: string | null): string {
  const resume = RESUMES.find((item) => item.id === resumeId)
  const strengths = resume
    ? resume.skills.slice(0, 3).join(', ')
    : job.skills.slice(0, 3).join(', ')
  const closing = resume
    ? `My background in ${strengths} lines up well with what you are looking for.`
    : `I am eager to grow my ${strengths} skills on your team.`

  return [
    `Dear Hiring Team,`,
    ``,
    `I would like to apply for the ${job.title} position at ${job.company}.`,
    `The role matches what I am looking for: ${job.workMode.toLowerCase()} work in ${job.category.toLowerCase()},` +
      ` with room to take real ownership of my projects.`,
    ``,
    `${closing} In my recent work I have used these skills daily, and I enjoy` +
      ` turning unclear problems into shipped, working features.`,
    ``,
    `I would welcome the chance to discuss how I can contribute to your team.`,
    ``,
    `Sincerely,`,
  ].join('\n')
}

function startOfToday(): Date {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return now
}

/** availableFrom must be today or later (DTO's @FutureOrPresent). */
export function isAvailableFromValid(date: Date | undefined): boolean {
  if (!date) return true
  const time = date.getTime()
  const today = startOfToday().getTime()
  return Number.isNaN(time) || time >= today
}

/** "1,240 / 5,000" counter label for the cover letter. */
export function coverLetterCount(text: string): string {
  return `${text.length.toLocaleString('en-US')} / ${COVER_LETTER_MAX.toLocaleString('en-US')}`
}

/** Overlap between a resume's skills and the posting's — drives the match chip. */
export function resumeMatchCount(jobSkills: string[], resumeSkills: string[]): number {
  const wanted = new Set(jobSkills.map((skill) => skill.toLowerCase()))
  return resumeSkills.filter((skill) => wanted.has(skill.toLowerCase())).length
}

export { RESUMES }
