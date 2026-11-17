import type { ResumeItem } from './data'

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
        issue: resume.work.some((entry) => !/\d/.test(entry.description))
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
