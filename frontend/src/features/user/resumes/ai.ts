import type { ResumeItem } from './data'

/**
 * Local draft generator for "Write with AI" on the summary editor. Seam:
 * replace with `POST /api/ai/resume/summary`, which takes a
 * `ResumeSummaryRequest` built from this same resume record —
 * `targetJobTitle` ← the headline, `workExperiences` ← role/company/detail,
 * `skills` ← the skill list, `educations` ← degree/field/institution — and
 * returns `AiTextResponse{content}`. The function signature stays.
 */
export function canGenerateSummary(resume: ResumeItem): boolean {
  return Boolean(
    resume.personalInfo.headline.trim() || resume.work.length > 0 || resume.skills.length > 0,
  )
}

export function generateSummaryDraft(resume: ResumeItem): string {
  const { personalInfo, work, skills, education } = resume
  const role = personalInfo.headline.trim() || work[0]?.role || ''
  const companies = work.map((entry) => entry.company).filter(Boolean)
  const topSkills = skills.slice(0, 4)
  const degree = education[0]
    ? education[0].fieldOfStudy
      ? `${education[0].degree} in ${education[0].fieldOfStudy}`
      : education[0].degree
    : ''

  const sentences: string[] = []

  if (role) {
    sentences.push(
      companies.length > 0
        ? `${role} with hands-on experience at ${companies.slice(0, 2).join(' and ')}.`
        : `${role} ready to contribute from day one.`,
    )
  }

  const latest = work[0]
  if (latest?.detail) {
    sentences.push(`Most recently: ${latest.detail.charAt(0).toLowerCase()}${latest.detail.slice(1)}`)
  }

  if (topSkills.length > 0) {
    sentences.push(`Core strengths span ${topSkills.join(', ')}.`)
  } else if (degree) {
    sentences.push(`Trained through a ${degree}.`)
  }

  if (sentences.length === 0) {
    return ''
  }

  return sentences.join(' ')
}
