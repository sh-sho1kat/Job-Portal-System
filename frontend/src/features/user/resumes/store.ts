import * as React from 'react'

import { ACCOUNT } from '@/features/user/profile/data'

import type {
  ResumeItem,
  ResumePersonalInfo,
  ResumeTemplateType,
  ResumeVisibility,
  ResumeWorkEntry,
} from './data'

/**
 * The resumes store — the demo rows and every mutation the page performs.
 * Stand-in for the resume service (the candidate's own resumes through the
 * gateway). The store is the seam: swap it for the endpoints (`POST
 * /api/resumes/create`, `PUT /api/resumes/{id}` for title/template/
 * visibility, `PATCH /api/resumes/{id}/personal-info`,
 * `POST /api/resumes/{id}/set-default`, `DELETE /api/resumes/{id}` — soft
 * delete; the newest remaining resume becomes the default) keeping the
 * function signatures.
 */
/** The one signed-in candidate — every resume's personal info starts from
 *  the account identity the backend seeds at registration. Seeds vary only
 *  the headline and profile links per resume. */
const CANDIDATE_INFO_BASE: Omit<ResumePersonalInfo, 'headline'> = {
  firstName: ACCOUNT.firstName,
  middleName: ACCOUNT.middleName ?? '',
  lastName: ACCOUNT.lastName,
  email: ACCOUNT.email,
  phone: ACCOUNT.phoneNumber ?? '',
  gender: 'MALE',
  nationality: 'Bangladeshi',
  dateOfBirth: '08-11-1998',
  presentAddress: {
    address: 'House 12, Road 5, Block C',
    city: 'Dhaka',
    state: 'Dhaka',
    country: 'Bangladesh',
    zipCode: '1213',
  },
  permanentAddress: {
    address: 'Village Singra, Post Office Singra',
    city: 'Natore',
    state: 'Rajshahi',
    country: 'Bangladesh',
    zipCode: '6450',
  },
  linkedInUrl: '',
  githubUrl: '',
  portfolioUrl: '',
  websiteUrl: '',
}

let resumes: ResumeItem[] = [  {
    id: 'resume-frontend',
    title: 'Frontend Developer Resume (2026)',
    template: 'PROFESSIONAL',
    visibility: 'PRIVATE',
    isDefault: true,
    personalInfo: {
      ...CANDIDATE_INFO_BASE,
      headline: 'Frontend Developer — React & TypeScript',
      linkedInUrl: 'https://www.linkedin.com/in/sahil-hossain',
      githubUrl: 'https://github.com/sahil-hossain',
      portfolioUrl: 'https://sahil-hossain.dev',
    },
    summary:
      'Frontend developer with four years of experience building accessible, performant web applications in React and TypeScript.',
    work: [
      workEntry('work-lumen', {
        companyName: 'Lumen Retail',
        position: 'Frontend Developer',
        employmentType: 'FULL_TIME',
        city: 'Dhaka',
        country: 'Bangladesh',
        startDate: '2022-03-01',
        endDate: null,
        isCurrentJob: true,
        description:
          'Rebuilt the customer checkout in React, cutting page load time by 38% and raising completed orders.',
        technologies: ['React', 'TypeScript', 'Playwright'],
        displayOrder: 0,
      }),
      workEntry('work-bluepeak', {
        companyName: 'Bluepeak Agency',
        position: 'Web Developer',
        employmentType: 'FULL_TIME',
        city: 'Dhaka',
        country: 'Bangladesh',
        startDate: '2020-07-01',
        endDate: '2022-02-28',
        isCurrentJob: false,
        description:
          'Shipped 20+ client sites from a shared TypeScript component library I maintained.',
        technologies: ['JavaScript', 'CSS'],
        displayOrder: 1,
      }),
    ],
    skills: ['JavaScript', 'React', 'TypeScript', 'Playwright', 'CI/CD', 'Git'],
    education: [
      {
        institutionName: 'Islamic University of Technology',
        degree: 'B.Sc. Engineering',
        fieldOfStudy: 'Computer Science & Engineering',
        grade: '3.71 CGPA',
        period: '2016 – 2020',
        isCurrentlyStudying: false,
      },
      {
        institutionName: 'Rajuk Uttara Model College',
        degree: 'HSC',
        fieldOfStudy: 'Science',
        grade: null,
        period: '2014 – 2016',
        isCurrentlyStudying: false,
      },
    ],
    projects: [
      {
        title: 'Checkout rebuild — Lumen Retail',
        description:
          'Led the React rewrite of the checkout flow around a shared design-system component library.',
        technologies: ['React', 'TypeScript', 'Storybook'],
        projectUrl: null,
      },
      {
        title: 'Neumorphic UI kit',
        description:
          'Open-source shadcn component kit that later became the design system used across this portal.',
        technologies: ['Tailwind CSS', 'Base UI'],
        projectUrl: 'github.com/sahil-hossain/neu-kit',
      },
    ],
    certifications: [
      {
        name: 'AWS Certified Cloud Practitioner',
        issuingOrganization: 'Amazon Web Services',
        issueDate: '2023-08-01',
        expirationDate: null,
        credentialId: 'AWS-CCP-8842',
      },
    ],
    awards: [
      {
        title: 'Champion — Inter-university programming contest',
        issuer: 'IUT CSE Society',
        dateAwarded: '2019-11-20',
        description: null,
      },
    ],
    languages: [
      { languageName: 'Bengali', proficiency: 'FLUENT' },
      { languageName: 'English', proficiency: 'CONVERSATIONAL' },
    ],
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
    personalInfo: {
      ...CANDIDATE_INFO_BASE,
      headline: 'Marketing Specialist — Content & Campaigns',
      linkedInUrl: 'https://www.linkedin.com/in/sahil-hossain',
      portfolioUrl: 'https://sahil-hossain.dev',
    },
    summary:
      'Marketing specialist focused on content strategy, brand campaigns, and analytics-driven growth.',
    work: [
      workEntry('work-arcadia', {
        companyName: 'Arcadia Media Group',
        position: 'Marketing Specialist',
        employmentType: 'FULL_TIME',
        city: 'Dhaka',
        country: 'Bangladesh',
        startDate: '2023-01-01',
        endDate: '2025-06-30',
        isCurrentJob: false,
        description:
          'Ran seasonal campaign programs that lifted newsletter signups 24% year over year.',
        technologies: ['SEO', 'Content strategy'],
        displayOrder: 0,
      }),
      workEntry('work-fieldstone-mkt', {
        companyName: 'Fieldstone Studio',
        position: 'Marketing Assistant',
        employmentType: 'FULL_TIME',
        city: 'Dhaka',
        country: 'Bangladesh',
        startDate: '2021-02-01',
        endDate: '2022-12-31',
        isCurrentJob: false,
        description:
          'Managed social calendars and landing-page copy for six product lines.',
        technologies: [],
        displayOrder: 1,
      }),
    ],
    skills: ['Canva', 'Zeplin', 'Communication', 'Problem Solving', 'SEO'],
    education: [
      {
        institutionName: 'University of Dhaka',
        degree: 'BBA',
        fieldOfStudy: 'Marketing',
        grade: null,
        period: '2017 – 2021',
        isCurrentlyStudying: false,
      },
    ],
    projects: [],
    certifications: [],
    awards: [],
    languages: [{ languageName: 'Bengali', proficiency: 'FLUENT' }],
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
    personalInfo: {
      ...CANDIDATE_INFO_BASE,
      headline: 'Data Analyst — SQL & Dashboards',
    },
    summary:
      'Data analyst turning operational data into dashboards and decisions leadership can act on.',
    work: [
      workEntry('work-fieldstone-data', {
        companyName: 'Fieldstone Studio',
        position: 'Junior Data Analyst',
        employmentType: 'FULL_TIME',
        city: 'Dhaka',
        country: 'Bangladesh',
        startDate: '2024-05-01',
        endDate: null,
        isCurrentJob: true,
        description:
          'Automated the weekly sales report in SQL, saving the team half a day every week.',
        technologies: ['SQL', 'Power BI'],
        displayOrder: 0,
      }),
    ],
    skills: ['SQL', 'Excel', 'Power BI', 'Python'],
    education: [
      {
        institutionName: 'Islamic University of Technology',
        degree: 'B.Sc. Engineering',
        fieldOfStudy: 'Computer Science & Engineering',
        grade: '3.58 CGPA',
        period: '2020 – 2024',
        isCurrentlyStudying: false,
      },
    ],
    projects: [],
    certifications: [],
    awards: [],
    languages: [],
    completionScore: 55,
    createdAt: '2025-10-20T11:00:00Z',
    updatedAt: '2025-10-20T11:00:00Z',
  },
]

/** A work entry as the backend would return it — optional strings default
 *  to '' (the backend's null), ids and stamps filled in. */
function workEntry(
  id: string,
  fields: Omit<ResumeWorkEntry, 'id' | 'address' | 'state' | 'companyLogoUrl' | 'zipCode'> &
    Partial<Pick<ResumeWorkEntry, 'address' | 'state' | 'companyLogoUrl' | 'zipCode'>>,
): ResumeWorkEntry {
  return { id, address: '', state: '', companyLogoUrl: '', zipCode: '', ...fields }
}

/** `WorkExperienceRequest` minus the server-side identity — what the
 *  create/update endpoints accept. */
export type WorkExperienceInput = Omit<ResumeWorkEntry, 'id'>

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

/** `PATCH /api/resumes/{id}/personal-info` with `PersonalInfoRequest` —
 *  the full identity record is sent and validated server-side; the
 *  response is the updated resume. Seam: swap the local update for the
 *  gateway call (it returns `ResumeResponse`). */
export function updatePersonalInfo(id: string, info: ResumePersonalInfo) {
  resumes = resumes.map((item) =>
    item.id === id ? { ...item, personalInfo: info, updatedAt: new Date().toISOString() } : item,
  )
  emit()
}

/** `PATCH /api/resumes/{id}/summary` with `UpdateSummaryRequest{summary}` —
 *  replaces the summary (the backend clears it with a null); the empty
 *  string stands in for that here. Seam: swap the local update for the
 *  gateway call (it returns `ResumeResponse`). */
export function updateSummary(id: string, summary: string) {
  resumes = resumes.map((item) =>
    item.id === id ? { ...item, summary, updatedAt: new Date().toISOString() } : item,
  )
  emit()
}


/** `POST /api/resumes/{id}/work-experiences` — the new role leads
 *  (displayOrder 0, later roles pushed down). Seam: swap for the gateway
 *  call (it returns the created `WorkExperienceResponse`). */
export function addWorkExperience(resumeId: string, input: WorkExperienceInput): ResumeWorkEntry {
  const created: ResumeWorkEntry = {
    ...input,
    id: `work-${Date.now().toString(36)}`,
  }
  resumes = resumes.map((item) =>
    item.id === resumeId
      ? {
          ...item,
          work: [
            created,
            ...item.work.map((entry) => ({ ...entry, displayOrder: entry.displayOrder + 1 })),
          ],
          updatedAt: new Date().toISOString(),
        }
      : item,
  )
  emit()
  return created
}

/** `PUT /api/resumes/{id}/work-experiences/{workExperienceId}` — the full
 *  record is sent and validated server-side. Seam: swap for the gateway
 *  call (it returns the updated `WorkExperienceResponse`). */
export function updateWorkExperience(resumeId: string, workId: string, input: WorkExperienceInput) {
  resumes = resumes.map((item) =>
    item.id === resumeId
      ? {
          ...item,
          work: item.work.map((entry) => (entry.id === workId ? { ...input, id: workId } : entry)),
          updatedAt: new Date().toISOString(),
        }
      : item,
  )
  emit()
}

/** `DELETE /api/resumes/{id}/work-experiences/{workExperienceId}` — the
 *  backend soft-deletes; the remaining roles close the displayOrder gap. */
export function removeWorkExperience(resumeId: string, workId: string) {
  resumes = resumes.map((item) =>
    item.id === resumeId
      ? {
          ...item,
          work: item.work
            .filter((entry) => entry.id !== workId)
            .map((entry, index) => ({ ...entry, displayOrder: index })),
          updatedAt: new Date().toISOString(),
        }
      : item,
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
    // The backend shells carry the candidate's identity from registration;
    // the headline and links start empty until personal info is filled in.
    personalInfo: {
      ...CANDIDATE_INFO_BASE,
      headline: '',
    },
    summary: '',
    work: [],
    skills: [],
    education: [],
    projects: [],
    certifications: [],
    awards: [],
    languages: [],
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
