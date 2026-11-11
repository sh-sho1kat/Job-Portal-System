export interface Resume {
  id: string
  name: string
  /** Skill names as written on the resume — drives the local match score. */
  skills: string[]
}

/**
 * Stand-in for the resume service (ResumeResponse DTOs through the gateway).
 * The skill-match computation runs locally against these until then.
 */
export const RESUMES: Resume[] = [
  {
    id: 'resume-frontend',
    name: 'Frontend Developer Resume (2026)',
    skills: ['JavaScript', 'React', 'TypeScript', 'Playwright', 'CI/CD', 'Git'],
  },
  {
    id: 'resume-marketing',
    name: 'Marketing Resume (2025)',
    skills: ['Canva', 'Zeplin', 'Communication', 'Problem Solving', 'SEO'],
  },
]
