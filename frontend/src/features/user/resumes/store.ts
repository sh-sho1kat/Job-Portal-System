import * as React from 'react'

import { ACCOUNT } from '@/features/user/profile/data'

import type {
  ResumeAwardEntry,
  ResumeCertificationEntry,
  ResumeEducationEntry,
  ResumeLanguageEntry,
  ResumeProjectEntry,
  ResumeSkillEntry,
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
    skills: [
      skillEntry('sk-js', { skillName: 'JavaScript', proficiencyLevel: 'EXPERT', yearsOfExperience: 5, displayOrder: 0 }),
      skillEntry('sk-react', { skillName: 'React', proficiencyLevel: 'EXPERT', yearsOfExperience: 5, displayOrder: 1 }),
      skillEntry('sk-ts', { skillName: 'TypeScript', proficiencyLevel: 'ADVANCED', yearsOfExperience: 4, displayOrder: 2 }),
      skillEntry('sk-playwright', { skillName: 'Playwright', proficiencyLevel: 'ADVANCED', yearsOfExperience: 3, displayOrder: 3 }),
      skillEntry('sk-cicd', { skillName: 'CI/CD', proficiencyLevel: 'INTERMEDIATE', yearsOfExperience: 3, displayOrder: 4 }),
      skillEntry('sk-git', { skillName: 'Git', proficiencyLevel: 'ADVANCED', yearsOfExperience: 6, displayOrder: 5 }),
    ],
    education: [
      educationEntry('edu-iut-bsc', {
        institutionName: 'Islamic University of Technology',
        degree: 'B.Sc. Engineering',
        fieldOfStudy: 'Computer Science & Engineering',
        grade: '3.71',
        startDate: '2016-01-01',
        endDate: '2020-12-31',
        isCurrentlyStudying: false,
        displayOrder: 0,
      }),
      educationEntry('edu-rajuk-hsc', {
        institutionName: 'Rajuk Uttara Model College',
        degree: 'HSC',
        fieldOfStudy: 'Science',
        startDate: '2014-01-01',
        endDate: '2016-12-31',
        isCurrentlyStudying: false,
        displayOrder: 1,
      }),
    ],
    projects: [
      projectEntry('prj-checkout', {
        title: 'Checkout rebuild — Lumen Retail',
        description:
          'Led the React rewrite of the checkout flow around a shared design-system component library.',
        technologies: ['React', 'TypeScript', 'Storybook'],
        startDate: '2024-03-01',
        endDate: '2024-09-30',
        isOngoing: false,
        displayOrder: 0,
      }),
      projectEntry('prj-neu-kit', {
        title: 'Neumorphic UI kit',
        description:
          'Open-source shadcn component kit that later became the design system used across this portal.',
        technologies: ['Tailwind CSS', 'Base UI'],
        projectUrl: 'https://github.com/sahil-hossain/neu-kit',
        startDate: '2023-06-01',
        endDate: null,
        isOngoing: true,
        displayOrder: 1,
      }),
    ],
    certifications: [
      certificationEntry('cert-aws-ccp', {
        name: 'AWS Certified Cloud Practitioner',
        issuingOrganization: 'Amazon Web Services',
        issueDate: '2023-08-01',
        expirationDate: null,
        credentialId: 'AWS-CCP-8842',
        displayOrder: 0,
      }),
    ],
    awards: [
      awardEntry('awd-champion', {
        title: 'Champion — Inter-university programming contest',
        issuer: 'IUT CSE Society',
        dateAwarded: '2019-11-20',
        displayOrder: 0,
      }),
    ],
    languages: [
      languageEntry('lang-bn', { language: 'Bengali', proficiency: 'NATIVE', displayOrder: 0 }),
      languageEntry('lang-en', { language: 'English', proficiency: 'FLUENT', displayOrder: 1 }),
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
    skills: [
      skillEntry('sk-canva', { skillName: 'Canva', proficiencyLevel: 'ADVANCED', yearsOfExperience: 3, displayOrder: 0 }),
      skillEntry('sk-zeplin', { skillName: 'Zeplin', proficiencyLevel: 'INTERMEDIATE', yearsOfExperience: 2, displayOrder: 1 }),
      skillEntry('sk-comm', { skillName: 'Communication', proficiencyLevel: 'ADVANCED', yearsOfExperience: 4, displayOrder: 2 }),
      skillEntry('sk-solving', { skillName: 'Problem Solving', proficiencyLevel: 'ADVANCED', yearsOfExperience: 4, displayOrder: 3 }),
      skillEntry('sk-seo', { skillName: 'SEO', proficiencyLevel: 'BEGINNER', yearsOfExperience: 1, displayOrder: 4 }),
    ],
    education: [
      educationEntry('edu-du-bba', {
        institutionName: 'University of Dhaka',
        degree: 'BBA',
        fieldOfStudy: 'Marketing',
        startDate: '2017-01-01',
        endDate: '2021-12-31',
        isCurrentlyStudying: false,
        displayOrder: 0,
      }),
    ],
    projects: [],
    certifications: [],
    awards: [],
    languages: [
      languageEntry('lang-bn-mkt', { language: 'Bengali', proficiency: 'FLUENT', displayOrder: 0 }),
    ],
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
    skills: [
      skillEntry('sk-sql', { skillName: 'SQL', proficiencyLevel: 'ADVANCED', yearsOfExperience: 3, displayOrder: 0 }),
      skillEntry('sk-excel', { skillName: 'Excel', proficiencyLevel: 'EXPERT', yearsOfExperience: 4, displayOrder: 1 }),
      skillEntry('sk-pbi', { skillName: 'Power BI', proficiencyLevel: 'INTERMEDIATE', yearsOfExperience: 2, displayOrder: 2 }),
      skillEntry('sk-python', { skillName: 'Python', proficiencyLevel: 'INTERMEDIATE', yearsOfExperience: 2, displayOrder: 3 }),
    ],
    education: [
      educationEntry('edu-iut-bsc-data', {
        institutionName: 'Islamic University of Technology',
        degree: 'B.Sc. Engineering',
        fieldOfStudy: 'Computer Science & Engineering',
        grade: '3.58',
        startDate: '2020-01-01',
        endDate: '2024-12-31',
        isCurrentlyStudying: false,
        displayOrder: 0,
      }),
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

/** An education entry as the backend would return it — optional strings
 *  default to '' (the backend's null), ids and stamps filled in. */
function educationEntry(
  id: string,
  fields: Omit<ResumeEducationEntry, 'id' | 'grade' | 'description'> &
    Partial<Pick<ResumeEducationEntry, 'grade' | 'description'>>,
): ResumeEducationEntry {
  return { id, grade: '', description: '', ...fields }
}

/** A skill entry as the backend would return it. */
function skillEntry(
  id: string,
  fields: Pick<ResumeSkillEntry, 'skillName' | 'proficiencyLevel'> &
    Partial<Pick<ResumeSkillEntry, 'yearsOfExperience' | 'displayOrder'>>,
): ResumeSkillEntry {
  return { id, yearsOfExperience: null, displayOrder: 0, ...fields }
}

/** A project entry as the backend would return it — optional strings
 *  default to '' (the backend's null). */
function projectEntry(
  id: string,
  fields: Pick<ResumeProjectEntry, 'title'> &
    Partial<Omit<ResumeProjectEntry, 'id' | 'title'>>,
): ResumeProjectEntry {
  return {
    id,
    description: '',
    technologies: [],
    projectUrl: '',
    sourceCodeUrl: '',
    startDate: '',
    endDate: null,
    isOngoing: false,
    displayOrder: 0,
    ...fields,
  }
}

/** A certification as the backend would return it — optional strings
 *  default to '' (the backend's null). */
function certificationEntry(
  id: string,
  fields: Pick<ResumeCertificationEntry, 'name' | 'issueDate'> &
    Partial<Omit<ResumeCertificationEntry, 'id' | 'name' | 'issueDate'>>,
): ResumeCertificationEntry {
  return {
    id,
    issuingOrganization: '',
    expirationDate: null,
    credentialId: '',
    credentialUrl: '',
    displayOrder: 0,
    ...fields,
  }
}

/** An award as the backend would return it. */
function awardEntry(
  id: string,
  fields: Pick<ResumeAwardEntry, 'title'> &
    Partial<Omit<ResumeAwardEntry, 'id' | 'title'>>,
): ResumeAwardEntry {
  return { id, issuer: '', dateAwarded: '', description: '', displayOrder: 0, ...fields }
}

/** A language as the backend would return it. */
function languageEntry(
  id: string,
  fields: Pick<ResumeLanguageEntry, 'language' | 'proficiency'> &
    Partial<Pick<ResumeLanguageEntry, 'displayOrder'>>,
): ResumeLanguageEntry {
  return { id, displayOrder: 0, ...fields }
}

/** `WorkExperienceRequest` minus the server-side identity — what the
 *  create/update endpoints accept. */
export type WorkExperienceInput = Omit<ResumeWorkEntry, 'id'>

/** `EducationRequest` minus the server-side identity. */
export type EducationInput = Omit<ResumeEducationEntry, 'id'>

/** `ResumeSkillRequest` minus the server-side identity. */
export type SkillInput = Omit<ResumeSkillEntry, 'id'>

/** `ProjectRequest` minus the server-side identity. */
export type ProjectInput = Omit<ResumeProjectEntry, 'id'>

/** `CertificationRequest` minus the server-side identity. */
export type CertificationInput = Omit<ResumeCertificationEntry, 'id'>

/** `AwardRequest` minus the server-side identity. */
export type AwardInput = Omit<ResumeAwardEntry, 'id'>

/** `LanguageProficiencyRequest` minus the server-side identity. */
export type LanguageInput = Omit<ResumeLanguageEntry, 'id'>

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


/** `POST /api/resumes/{id}/educations` — the new entry leads (displayOrder
 *  0, later entries pushed down). Seam: swap for the gateway call (it
 *  returns the created `EducationResponse`). */
export function addEducation(resumeId: string, input: EducationInput): ResumeEducationEntry {
  const created: ResumeEducationEntry = {
    ...input,
    id: `edu-${Date.now().toString(36)}`,
  }
  resumes = resumes.map((item) =>
    item.id === resumeId
      ? {
          ...item,
          education: [
            created,
            ...item.education.map((entry) => ({ ...entry, displayOrder: entry.displayOrder + 1 })),
          ],
          updatedAt: new Date().toISOString(),
        }
      : item,
  )
  emit()
  return created
}

/** `PUT /api/resumes/{id}/educations/{educationId}` — the full record is
 *  sent and validated server-side. Seam: swap for the gateway call (it
 *  returns the updated `EducationResponse`). */
export function updateEducation(resumeId: string, educationId: string, input: EducationInput) {
  resumes = resumes.map((item) =>
    item.id === resumeId
      ? {
          ...item,
          education: item.education.map((entry) =>
            entry.id === educationId ? { ...input, id: educationId } : entry,
          ),
          updatedAt: new Date().toISOString(),
        }
      : item,
  )
  emit()
}

/** `DELETE /api/resumes/{id}/educations/{educationId}` — the backend
 *  soft-deletes; the remaining entries close the displayOrder gap. */
export function removeEducation(resumeId: string, educationId: string) {
  resumes = resumes.map((item) =>
    item.id === resumeId
      ? {
          ...item,
          education: item.education
            .filter((entry) => entry.id !== educationId)
            .map((entry, index) => ({ ...entry, displayOrder: index })),
          updatedAt: new Date().toISOString(),
        }
      : item,
  )
  emit()
}

/** `POST /api/resumes/{id}/skills` — the new skill leads (displayOrder 0,
 *  later entries pushed down). Seam: swap for the gateway call (it
 *  returns the created `ResumeSkillResponse`). */
export function addSkill(resumeId: string, input: SkillInput): ResumeSkillEntry {
  const created: ResumeSkillEntry = {
    ...input,
    id: `sk-${Date.now().toString(36)}`,
  }
  resumes = resumes.map((item) =>
    item.id === resumeId
      ? {
          ...item,
          skills: [
            created,
            ...item.skills.map((entry) => ({ ...entry, displayOrder: entry.displayOrder + 1 })),
          ],
          updatedAt: new Date().toISOString(),
        }
      : item,
  )
  emit()
  return created
}

/** `PUT /api/resumes/{id}/skills/{skillId}` — the full record is sent and
 *  validated server-side. Seam: swap for the gateway call (it returns the
 *  updated `ResumeSkillResponse`). */
export function updateSkill(resumeId: string, skillId: string, input: SkillInput) {
  resumes = resumes.map((item) =>
    item.id === resumeId
      ? {
          ...item,
          skills: item.skills.map((entry) =>
            entry.id === skillId ? { ...input, id: skillId } : entry,
          ),
          updatedAt: new Date().toISOString(),
        }
      : item,
  )
  emit()
}

/** `DELETE /api/resumes/{id}/skills/{skillId}` — the remaining entries
 *  close the displayOrder gap. */
export function removeSkill(resumeId: string, skillId: string) {
  resumes = resumes.map((item) =>
    item.id === resumeId
      ? {
          ...item,
          skills: item.skills
            .filter((entry) => entry.id !== skillId)
            .map((entry, index) => ({ ...entry, displayOrder: index })),
          updatedAt: new Date().toISOString(),
        }
      : item,
  )
  emit()
}

/** `POST /api/resumes/{id}/projects` — the new project leads (displayOrder
 *  0, later entries pushed down). Seam: swap for the gateway call (it
 *  returns the created `ProjectResponse`). */
export function addProject(resumeId: string, input: ProjectInput): ResumeProjectEntry {
  const created: ResumeProjectEntry = {
    ...input,
    // The backend derives `isOngoing` from an omitted end date.
    isOngoing: input.endDate === null,
    id: `prj-${Date.now().toString(36)}`,
  }
  resumes = resumes.map((item) =>
    item.id === resumeId
      ? {
          ...item,
          projects: [
            created,
            ...item.projects.map((entry) => ({ ...entry, displayOrder: entry.displayOrder + 1 })),
          ],
          updatedAt: new Date().toISOString(),
        }
      : item,
  )
  emit()
  return created
}

/** `PUT /api/resumes/{id}/projects/{projectId}` — the full record is sent
 *  and validated server-side. Seam: swap for the gateway call (it returns
 *  the updated `ProjectResponse`). */
export function updateProject(resumeId: string, projectId: string, input: ProjectInput) {
  resumes = resumes.map((item) =>
    item.id === resumeId
      ? {
          ...item,
          projects: item.projects.map((entry) =>
            entry.id === projectId
              ? { ...input, isOngoing: input.endDate === null, id: projectId }
              : entry,
          ),
          updatedAt: new Date().toISOString(),
        }
      : item,
  )
  emit()
}

/** `DELETE /api/resumes/{id}/projects/{projectId}` — the remaining
 *  entries close the displayOrder gap. */
export function removeProject(resumeId: string, projectId: string) {
  resumes = resumes.map((item) =>
    item.id === resumeId
      ? {
          ...item,
          projects: item.projects
            .filter((entry) => entry.id !== projectId)
            .map((entry, index) => ({ ...entry, displayOrder: index })),
          updatedAt: new Date().toISOString(),
        }
      : item,
  )
  emit()
}

/** `POST /api/resumes/{id}/certifications` — the new entry leads
 *  (displayOrder 0, later entries pushed down). Seam: swap for the
 *  gateway call (it returns the created `CertificationResponse`). */
export function addCertification(resumeId: string, input: CertificationInput): ResumeCertificationEntry {
  const created: ResumeCertificationEntry = {
    ...input,
    id: `cert-${Date.now().toString(36)}`,
  }
  resumes = resumes.map((item) =>
    item.id === resumeId
      ? {
          ...item,
          certifications: [
            created,
            ...item.certifications.map((entry) => ({ ...entry, displayOrder: entry.displayOrder + 1 })),
          ],
          updatedAt: new Date().toISOString(),
        }
      : item,
  )
  emit()
  return created
}

/** `PUT /api/resumes/{id}/certifications/{certificationId}` — the full
 *  record is sent and validated server-side. Seam: swap for the gateway
 *  call (it returns the updated `CertificationResponse`). */
export function updateCertification(resumeId: string, certificationId: string, input: CertificationInput) {
  resumes = resumes.map((item) =>
    item.id === resumeId
      ? {
          ...item,
          certifications: item.certifications.map((entry) =>
            entry.id === certificationId ? { ...input, id: certificationId } : entry,
          ),
          updatedAt: new Date().toISOString(),
        }
      : item,
  )
  emit()
}

/** `DELETE /api/resumes/{id}/certifications/{certificationId}` — the
 *  remaining entries close the displayOrder gap. */
export function removeCertification(resumeId: string, certificationId: string) {
  resumes = resumes.map((item) =>
    item.id === resumeId
      ? {
          ...item,
          certifications: item.certifications
            .filter((entry) => entry.id !== certificationId)
            .map((entry, index) => ({ ...entry, displayOrder: index })),
          updatedAt: new Date().toISOString(),
        }
      : item,
  )
  emit()
}

/** `POST /api/resumes/{id}/awards` — the new award leads (displayOrder 0,
 *  later entries pushed down). Seam: swap for the gateway call (it
 *  returns the created `AwardResponse`). */
export function addAward(resumeId: string, input: AwardInput): ResumeAwardEntry {
  const created: ResumeAwardEntry = {
    ...input,
    id: `awd-${Date.now().toString(36)}`,
  }
  resumes = resumes.map((item) =>
    item.id === resumeId
      ? {
          ...item,
          awards: [
            created,
            ...item.awards.map((entry) => ({ ...entry, displayOrder: entry.displayOrder + 1 })),
          ],
          updatedAt: new Date().toISOString(),
        }
      : item,
  )
  emit()
  return created
}

/** `PUT /api/resumes/{id}/awards/{awardId}` — the full record is sent and
 *  validated server-side. Seam: swap for the gateway call (it returns the
 *  updated `AwardResponse`). */
export function updateAward(resumeId: string, awardId: string, input: AwardInput) {
  resumes = resumes.map((item) =>
    item.id === resumeId
      ? {
          ...item,
          awards: item.awards.map((entry) =>
            entry.id === awardId ? { ...input, id: awardId } : entry,
          ),
          updatedAt: new Date().toISOString(),
        }
      : item,
  )
  emit()
}

/** `DELETE /api/resumes/{id}/awards/{awardId}` — the remaining entries
 *  close the displayOrder gap. */
export function removeAward(resumeId: string, awardId: string) {
  resumes = resumes.map((item) =>
    item.id === resumeId
      ? {
          ...item,
          awards: item.awards
            .filter((entry) => entry.id !== awardId)
            .map((entry, index) => ({ ...entry, displayOrder: index })),
          updatedAt: new Date().toISOString(),
        }
      : item,
  )
  emit()
}

/** `POST /api/resumes/{id}/languages` — the new language leads
 *  (displayOrder 0, later entries pushed down). Seam: swap for the
 *  gateway call (it returns the created `LanguageProficiencyResponse`). */
export function addLanguage(resumeId: string, input: LanguageInput): ResumeLanguageEntry {
  const created: ResumeLanguageEntry = {
    ...input,
    id: `lang-${Date.now().toString(36)}`,
  }
  resumes = resumes.map((item) =>
    item.id === resumeId
      ? {
          ...item,
          languages: [
            created,
            ...item.languages.map((entry) => ({ ...entry, displayOrder: entry.displayOrder + 1 })),
          ],
          updatedAt: new Date().toISOString(),
        }
      : item,
  )
  emit()
  return created
}

/** `PUT /api/resumes/{id}/languages/{languageId}` — the full record is
 *  sent and validated server-side. Seam: swap for the gateway call (it
 *  returns the updated `LanguageProficiencyResponse`). */
export function updateLanguage(resumeId: string, languageId: string, input: LanguageInput) {
  resumes = resumes.map((item) =>
    item.id === resumeId
      ? {
          ...item,
          languages: item.languages.map((entry) =>
            entry.id === languageId ? { ...input, id: languageId } : entry,
          ),
          updatedAt: new Date().toISOString(),
        }
      : item,
  )
  emit()
}

/** `DELETE /api/resumes/{id}/languages/{languageId}` — the remaining
 *  entries close the displayOrder gap. */
export function removeLanguage(resumeId: string, languageId: string) {
  resumes = resumes.map((item) =>
    item.id === resumeId
      ? {
          ...item,
          languages: item.languages
            .filter((entry) => entry.id !== languageId)
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
