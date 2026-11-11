import * as React from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { MagicWand01Icon } from '@hugeicons/core-free-icons'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectItem } from '@/components/ui/select'
import { RESUMES } from '../data/resumes'
import type { Job } from '../data/types'

interface MatchResult {
  score: number
  matched: string[]
  missing: string[]
}

/** Case-insensitive overlap between a resume's skills and the job's skills. */
function analyze(job: Job, resumeSkills: string[]): MatchResult {
  const owned = new Set(resumeSkills.map((skill) => skill.toLowerCase()))
  const matched = job.skills.filter((skill) => owned.has(skill.toLowerCase()))
  const missing = job.skills.filter((skill) => !owned.has(skill.toLowerCase()))
  const score = job.skills.length > 0 ? Math.round((matched.length / job.skills.length) * 100) : 0
  return { score, matched, missing }
}

/**
 * AI skills-gap band under the job header: pick a resume, run the local
 * skill match against the posting's requirements, see what carries over
 * and what's missing. Real computation on static data until the resume
 * service is wired.
 */
export function AiSkillMatch({ job }: { job: Job }) {
  const [resumeId, setResumeId] = React.useState('')
  const [result, setResult] = React.useState<MatchResult>()

  const pickResume = (id: string) => {
    setResumeId(id)
    setResult(undefined)
  }

  const runAnalysis = () => {
    const resume = RESUMES.find((candidate) => candidate.id === resumeId)
    if (resume) setResult(analyze(job, resume.skills))
  }

  return (
    <section
      aria-label="AI skills gap analysis"
      className="rounded-[var(--neu-radius-surface)] border border-transparent bg-[color-mix(in_srgb,var(--primary)_7%,var(--card))] p-5 text-[var(--card-foreground)] shadow-[var(--neu-shadow-raised-sm)] md:p-6"
    >
      <div className="flex items-start gap-3.5">
        <span
          aria-hidden="true"
          className="flex size-10 shrink-0 items-center justify-center rounded-full [background-image:var(--neu-fill-primary)]"
        >
          <HugeiconsIcon
            icon={MagicWand01Icon}
            strokeWidth={1.8}
            aria-hidden="true"
            className="size-4.5 text-[var(--primary-foreground)]"
          />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-semibold tracking-tight text-[var(--foreground)]">
            AI Skills Gap Analysis
          </h2>
          <p className="mt-0.5 text-[13px] leading-relaxed text-[var(--muted-foreground)]">
            Select a resume to see how your skills line up with this role.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <Select
            value={resumeId}
            onChange={(event) => pickResume(event.target.value)}
            aria-label="Select a resume to analyze"
          >
            <SelectItem value="" disabled>
              Select a resume…
            </SelectItem>
            {RESUMES.map((resume) => (
              <SelectItem key={resume.id} value={resume.id}>
                {resume.name}
              </SelectItem>
            ))}
          </Select>
        </div>
        <Button
          variant="primary"
          disabled={!resumeId}
          onClick={runAnalysis}
          className="shrink-0 [background-image:var(--neu-fill-primary)] text-[var(--primary-foreground)]"
        >
          <HugeiconsIcon icon={MagicWand01Icon} strokeWidth={1.8} aria-hidden="true" className="size-4.5" />
          Analyze
        </Button>
      </div>

      {result && (
        <div className="mt-5 border-t border-[color:var(--neu-edge)] pt-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium text-[var(--muted-foreground)]">Skill match</span>
            <span className="text-lg font-bold tabular-nums text-[var(--foreground)]" aria-live="polite">
              {result.score}%
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={result.score}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Skill match score"
            className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--neu-surface)] shadow-[var(--neu-shadow-inset)] [background-image:var(--neu-fill-inset)]"
          >
            <div
              className="h-full rounded-full transition-[width] duration-500 [background-image:var(--neu-fill-primary)]"
              style={{ width: `${result.score}%` }}
            />
          </div>

          {result.matched.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-[var(--muted-foreground)]">Matched skills</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {result.matched.map((skill) => (
                  <Badge key={skill} variant="success" className="rounded-full px-3 py-1">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {result.missing.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-[var(--muted-foreground)]">
                Not on this resume — worth learning for the role
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {result.missing.map((skill) => (
                  <Badge key={skill} variant="soft" className="rounded-full px-3 py-1">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
