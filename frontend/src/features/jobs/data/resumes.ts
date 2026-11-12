export interface ResumeExperience {
  role: string
  company: string
  period: string
  detail: string
}

/** Template types from the backend's `ResumeTemplateType` enum. */
export type ResumeTemplate = 'DEFAULT' | 'MODERN' | 'CLASSIC' | 'PROFESSIONAL'

export interface Resume {
  id: string
  name: string
  /** Resume type — the backend's `ResumeTemplateType`. */
  template: ResumeTemplate
  /** The candidate's designated default resume (backend's `isDefault`). */
  isDefault: boolean
  /** Professional headline shown at the top of the preview. */
  headline: string
  /** Profile paragraph shown in the preview. */
  summary: string
  experience: ResumeExperience[]
  /** Skill names as written on the resume — drives the local match score. */
  skills: string[]
}

/**
 * Stand-in for the resume service (ResumeResponse DTOs through the gateway).
 * The preview fields (headline, summary, experience) stand in for the parsed
 * resume document; the skill-match computation runs locally against these
 * until then.
 */
export const RESUMES: Resume[] = [
  {
    id: 'resume-frontend',
    name: 'Frontend Developer Resume (2026)',
    template: 'PROFESSIONAL',
    isDefault: true,
    headline: 'Frontend Developer — React & TypeScript',
    summary:
      'Frontend developer with four years of experience building accessible, performant web applications in React and TypeScript.',
    experience: [
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
  },
  {
    id: 'resume-marketing',
    name: 'Marketing Resume (2025)',
    template: 'MODERN',
    isDefault: false,
    headline: 'Marketing Specialist — Content & Campaigns',
    summary:
      'Marketing specialist focused on content strategy, brand campaigns, and analytics-driven growth.',
    experience: [
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
  },
]
