import * as React from 'react'

/**
 * Stand-in for the resume service (the candidate's own resumes through the
 * gateway): `GET /api/resumes/my-resumes` returns `ResumeResponse` rows,
 * default first. Shapes mirror the backend DTOs:
 * - `template` — `ResumeTemplateType`: Default / Modern / Classic /
 *   Professional
 * - `visibility` — `ResumeVisibility`: Public / Private / Link only
 * - `completionScore` — the backend's 0–100 checklist heuristic
 * - `work` / `skills` — stand-ins for the `WorkExperienceResponse` /
 *   `ResumeSkillResponse` lists the detail view carries
 * The store is the seam: swap it for the endpoints (`POST /api/resumes/
 * create`, `PUT /api/resumes/{id}` for title/template/visibility,
 * `POST /api/resumes/{id}/set-default`, `DELETE /api/resumes/{id}` — soft
 * delete; the newest remaining resume becomes the default) keeping the
 * hook signatures.
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

export interface ResumeItem {
  id: string
  title: string
  template: ResumeTemplateType
  visibility: ResumeVisibility
  isDefault: boolean
  /** `PersonalInfoResponse.headline`. */
  headline: string
  summary: string
  work: ResumeWorkEntry[]
  skills: string[]
  completionScore: number
  /** `Instant` timestamps. */
  createdAt: string
  updatedAt: string
}

let resumes: ResumeItem[] = [
  {
    id: 'resume-frontend',
    title: 'Frontend Developer Resume (2026)',
    template: 'PROFESSIONAL',
    visibility: 'PRIVATE',
    isDefault: true,
    headline: 'Frontend Developer — React & TypeScript',
    summary:
      'Frontend developer with four years of experience building accessible, performant web applications in React and TypeScript.',
    work: [
      {
        role: 'Frontend Developer',
        company: 'Lumen Retail',
        period: '2022 – Present',
        detail:
          'Rebuilt the customer checkout in React, cutting page load time by 38% and raising completed orders.',
      },
      {
        role: 'Web Developer',
        company: 'Bluepeak Agency',
        period: '2020 – 2022',
        detail:
          'Shipped 20+ client sites from a shared TypeScript component library I maintained.',
      },
    ],
    skills: ['JavaScript', 'React', 'TypeScript', 'Playwright', 'CI/CD', 'Git'],
    completionScore: 92,
    createdAt: '2025-01-12T10:00:00Z',
    updatedAt: '2025-11-10T09:15:00Z',
  },
  {
    id: 'resume-marketing',
    title: 'Marketing Resume (2025)',
    template: 'MODERN',
    visibility: 'LINK_ONLY',
    isDefault: false,
    headline: 'Marketing Specialist — Content & Campaigns',
    summary:
      'Marketing specialist focused on content strategy, brand campaigns, and analytics-driven growth.',
    work: [
      {
        role: 'Marketing Specialist',
        company: 'Arcadia Media Group',
        period: '2023 – 2025',
        detail:
          'Ran seasonal campaign programs that lifted newsletter signups 24% year over year.',
      },
      {
        role: 'Marketing Assistant',
        company: 'Fieldstone Studio',
        period: '2021 – 2023',
        detail:
          'Managed social calendars and landing-page copy for six product lines.',
      },
    ],
    skills: ['Canva', 'Zeplin', 'Communication', 'Problem Solving', 'SEO'],
    completionScore: 74,
    createdAt: '2024-06-02T08:00:00Z',
    updatedAt: '2025-09-28T14:30:00Z',
  },
  {
    id: 'resume-analyst',
    title: 'Data Analyst Resume',
    template: 'CLASSIC',
    visibility: 'PRIVATE',
    isDefault: false,
    headline: 'Data Analyst — SQL & Dashboards',
    summary:
      'Data analyst turning operational data into dashboards and decisions leadership can act on.',
    work: [
      {
        role: 'Junior Data Analyst',
        company: 'Fieldstone Studio',
        period: '2024 – Present',
        detail:
          'Automated the weekly sales report in SQL, saving the team half a day every week.',
      },
    ],
    skills: ['SQL', 'Excel', 'Power BI', 'Python'],
    completionScore: 55,
    createdAt: '2025-10-20T11:00:00Z',
    updatedAt: '2025-10-20T11:00:00Z',
  },
]

/** en-US long date — consistent with the applications list. */
export function formatResumeDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

export function subscribeToResumes(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getResumes(): ResumeItem[] {
  return resumes
}

/** The candidate's resumes, reactive — default first, then newest updated. */
export function useResumes(): ResumeItem[] {
  return React.useSyncExternalStore(subscribeToResumes, getResumes)
}

/** `POST /api/resumes/{id}/set-default` — demotes the previous default. */
export function setDefaultResume(id: string) {
  resumes = resumes.map((item) => ({ ...item, isDefault: item.id === id }))
  emit()
}

/** `PUT /api/resumes/{id}` with `UpdateResumeRequest{title, template,
 *  visibility}` — supplied fields updated, the rest unchanged. */
export function updateResume(
  id: string,
  patch: Pick<ResumeItem, 'title' | 'template' | 'visibility'>,
) {
  resumes = resumes.map((item) =>
    item.id === id ? { ...item, ...patch, updatedAt: new Date().toISOString() } : item,
  )
  emit()
}

/** `POST /api/resumes/create` with `ResumeRequest{title, template,
 *  visibility, isDefault}` — a fresh resume starts empty (completion 0). */
export function createResume(input: {
  title: string
  template: ResumeTemplateType
  visibility: ResumeVisibility
}): ResumeItem {
  const item: ResumeItem = {
    id: `resume-${Date.now().toString(36)}`,
    title: input.title,
    template: input.template,
    visibility: input.visibility,
    isDefault: false,
    headline: '',
    summary: '',
    work: [],
    skills: [],
    completionScore: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  resumes = [item, ...resumes]
  emit()
  return item
}

/** `DELETE /api/resumes/{id}` — soft delete on the backend; the newest
 *  remaining resume becomes the default. */
export function removeResume(id: string) {
  const remaining = resumes.filter((item) => item.id !== id)
  if (remaining.length > 0 && !remaining.some((item) => item.isDefault)) {
    // Mirror the backend rule: newest remaining becomes the default.
    const newest = [...remaining].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )[0]
    resumes = remaining.map((item) => ({ ...item, isDefault: item.id === newest.id }))
  } else {
    resumes = remaining
  }
  emit()
}

/** Mirrors `CareerFeedbackResponse` from the AI service. */
export interface CareerFeedback {
  profileStrength: number
  overallSummary: string
  shortlistingIssues: string[]
  improvements: { area: string; issue: string; action: string; priority: string }[]
}

/**
 * Local stand-in for the resume AI feedback report — the shape mirrors
 * `CareerFeedbackResponse` so the dialog is honest about its content. Seam:
 * replace with `POST /api/ai/resume/career-feedback`
 * (`CareerFeedbackRequest{resumeContent, targetJobTitle}`); the resume
 * content this page would send is assembled in the dialog.
 */
export function careerFeedback(resume: ResumeItem): CareerFeedback {
  const score = resume.completionScore
  const issues: string[] = []
  if (resume.work.length < 2)
    issues.push('Only one role on record — add at least one more position to show trajectory.')
  if (resume.skills.length < 6)
    issues.push('Thin skills section — recruiters scan for a broader toolset first.')
  if (!resume.summary)
    issues.push('No professional summary — the profile reads as an empty shell.')
  return {
    profileStrength: score,
    overallSummary:
      score >= 80
        ? `${resume.title} is strong and ready to send. Tighten the summary wording and keep the skills section in sync with each target role.`
        : `${resume.title} needs work before it competes for shortlists. Fill the missing sections below — completion drives how this resume ranks against others.`,
    shortlistingIssues: issues.length > 0 ? issues : ['No blocking gaps found in the current content.'],
    improvements: [
      {
        area: 'Summary',
        issue: resume.summary ? 'Summary reads generic.' : 'The summary is empty.',
        action: resume.summary
          ? 'Lead with your specialization and one measurable result in the first two lines.'
          : 'Write 2–3 lines covering who you are, your specialty, and one proof point.',
        priority: score >= 80 ? 'Low' : 'High',
      },
      {
        area: 'Experience',
        issue: resume.work.some((entry) => !/\d/.test(entry.detail))
          ? 'Role descriptions state duties without outcomes.'
          : 'Some roles may lack measurable outcomes.',
        action: 'Rewrite each bullet as "did X, which moved Y by Z%".',
        priority: score >= 80 ? 'Medium' : 'High',
      },
      {
        area: 'Skills',
        issue: `${resume.skills.length} skills listed — target roles filter on 8–12.`,
        action: 'Add the tools and frameworks each target posting repeats.',
        priority: 'Medium',
      },
    ],
  }
}
