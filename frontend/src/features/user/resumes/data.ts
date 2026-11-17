/**
 * Resume-service DTO mirror — pure types, labels, and date helpers shared
 * by the resumes page and the view sidebar's section pages. Shapes mirror
 * the backend DTOs:
 * - `template` — `ResumeTemplateType`: Default / Modern / Classic /
 *   Professional
 * - `visibility` — `ResumeVisibility`: Public / Private / Link only
 * - `completionScore` — the backend's 0–100 checklist heuristic
 * - `work` / `skills` — stand-ins for the `WorkExperienceResponse` /
 *   `ResumeSkillResponse` lists the detail view carries
 * - `education` / `projects` / `certifications` / `awards` / `languages` —
 *   mirrors of the per-section entities the resume service keeps
 *   (EducationController, ProjectController, …) shown in the view sidebar
 */
export type ResumeTemplateType = 'DEFAULT' | 'MODERN' | 'CLASSIC' | 'PROFESSIONAL'
export type ResumeVisibility = 'PUBLIC' | 'PRIVATE' | 'LINK_ONLY'

export const TEMPLATE_LABEL: Record<ResumeTemplateType, string> = {
  DEFAULT: 'Default',
  MODERN: 'Modern',
  CLASSIC: 'Classic',
  PROFESSIONAL: 'Professional',
}

export const VISIBILITY_LABEL: Record<ResumeVisibility, string> = {
  PUBLIC: 'Public',
  PRIVATE: 'Private',
  LINK_ONLY: 'Link only',
}

export interface ResumeWorkEntry {
  role: string
  company: string
  period: string
  detail: string
}

/**
 * Section records mirror the resume-service entities one-to-one
 * (`Education`, `Project`, `Certification`, `Award`, `Language`), so the
 * view sidebar can render each section exactly as the backend stores it.
 */
export interface ResumeEducationEntry {
  institutionName: string
  degree: string
  fieldOfStudy: string
  grade: string | null
  period: string
  isCurrentlyStudying: boolean
}

export interface ResumeProjectEntry {
  title: string
  description: string
  technologies: string[]
  projectUrl: string | null
}

export interface ResumeCertificationEntry {
  name: string
  issuingOrganization: string
  /** ISO date */
  issueDate: string
  expirationDate: string | null
  credentialId: string | null
}

export interface ResumeAwardEntry {
  title: string
  issuer: string
  /** ISO date */
  dateAwarded: string
  description: string | null
}

/** `LanguageProficiency`: BASIC / CONVERSATIONAL / FLUENT. */
export type ResumeLanguageProficiency = 'BASIC' | 'CONVERSATIONAL' | 'FLUENT'

export const LANGUAGE_PROFICIENCY_LABEL: Record<ResumeLanguageProficiency, string> = {
  BASIC: 'Basic',
  CONVERSATIONAL: 'Conversational',
  FLUENT: 'Fluent',
}

export interface ResumeLanguageEntry {
  languageName: string
  proficiency: ResumeLanguageProficiency
}

/** `Gender` enum — `PersonalInfoResponse.gender`. */
export type ResumeGender = 'MALE' | 'FEMALE' | 'OTHER'

export const GENDER_LABEL: Record<ResumeGender, string> = {
  MALE: 'Male',
  FEMALE: 'Female',
  OTHER: 'Other',
}

/** `Address` embeddable — `PersonalInfoResponse.presentAddress` and
 *  `permanentAddress`. Every field is optional on the backend. */
export interface ResumeAddress {
  address: string
  city: string
  state: string
  country: string
  zipCode: string
}

/** `PersonalInfoResponse` — the resume's identity record, one per resume.
 *  `dateOfBirth` uses the backend's `MM-dd-yyyy` pattern; URLs stay bare
 *  strings and must be `http(s)` when present. */
export interface ResumePersonalInfo {
  firstName: string
  middleName: string
  lastName: string
  headline: string
  email: string
  phone: string
  gender: ResumeGender | ''
  nationality: string
  dateOfBirth: string
  presentAddress: ResumeAddress
  permanentAddress: ResumeAddress
  linkedInUrl: string
  githubUrl: string
  portfolioUrl: string
  websiteUrl: string
}

export interface ResumeItem {
  id: string
  title: string
  template: ResumeTemplateType
  visibility: ResumeVisibility
  isDefault: boolean
  /** The identity record — `ResumeResponse.personalInfo`. */
  personalInfo: ResumePersonalInfo
  /** `UpdateSummaryRequest` — at most 5000 characters; null clears it. */
  summary: string
  work: ResumeWorkEntry[]
  skills: string[]
  education: ResumeEducationEntry[]
  projects: ResumeProjectEntry[]
  certifications: ResumeCertificationEntry[]
  awards: ResumeAwardEntry[]
  languages: ResumeLanguageEntry[]
  completionScore: number
  /** `Instant` timestamps. */
  createdAt: string
  updatedAt: string
}
/** `UpdateSummaryRequest` — `@Size(max = 5000)` on the backend. */
export const SUMMARY_MAX = 5000

/** en-US long date — consistent with the applications list. */
export function formatResumeDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

/** The personal-info `MM-dd-yyyy` pattern → long date; null when unset or
 *  malformed. */
export function formatPersonalDate(value: string): string | null {
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value)
  if (!match) return null
  const date = new Date(`${match[3]}-${match[1]}-${match[2]}T00:00:00`)
  return Number.isNaN(date.getTime())
    ? null
    : date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

/** Native `<input type="date">` ↔ backend pattern converters. */
export function personalDateToInput(value: string): string {
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value)
  return match ? `${match[3]}-${match[1]}-${match[2]}` : ''
}

export function personalDateFromInput(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  return match ? `${match[2]}-${match[3]}-${match[1]}` : ''
}

/** The personal-info `MM-dd-yyyy` pattern → local Date; null when unset or
 *  malformed (parsed by parts so it can't cross a UTC boundary). */
export function personalDateToDate(value: string): Date | null {
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value)
  if (!match) return null
  const date = new Date(Number(match[3]), Number(match[1]) - 1, Number(match[2]))
  return Number.isNaN(date.getTime()) ? null : date
}

/** Local Date → the personal-info `MM-dd-yyyy` pattern. */
export function personalDateFromDate(value: Date): string {
  return `${String(value.getMonth() + 1).padStart(2, '0')}-${String(
    value.getDate(),
  ).padStart(2, '0')}-${value.getFullYear()}`
}
