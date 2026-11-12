import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'
import type { Job } from '../../data/types'
import { RESUMES, resumeMatchCount, type ApplicationDraft } from '../data'

interface ResumeStepProps {
  job: Job
  draft: ApplicationDraft
  onPatch: (patch: Partial<ApplicationDraft>) => void
}

function ResumeOption({
  resumeId,
  name,
  skills,
  matchCount,
  jobSkills,
  selected,
}: {
  resumeId: string
  name: string
  skills: string[]
  matchCount: number
  jobSkills: Job['skills']
  selected: boolean
}) {
  return (
    <label
      className={cn(
        'flex w-full cursor-pointer items-start gap-3 rounded-[var(--neu-radius-surface)] border border-transparent p-4',
        'bg-[var(--neu-surface)] [background-image:var(--neu-fill-raised)] shadow-[var(--neu-shadow-raised-sm)]',
        'transition-[box-shadow,border-color,background-image] duration-[var(--neu-duration)] motion-reduce:transition-none',
        'hover:shadow-[var(--neu-shadow-hover)]',
        // Selected reads as pressed-in — the neumorphic idiom for "this one
        // is held down" — with the accent border and name ink reinforcing it.
        selected &&
          'border-[var(--neu-selected-border)] [background-image:var(--neu-fill-inset)] shadow-[var(--neu-shadow-inset)] [&_[data-resume-name]]:text-[var(--neu-accent-ink)]',
        'has-[[data-slot=radio-group-item]:focus-visible]:outline-2 has-[[data-slot=radio-group-item]:focus-visible]:outline-solid has-[[data-slot=radio-group-item]:focus-visible]:outline-offset-2 has-[[data-slot=radio-group-item]:focus-visible]:outline-[color:var(--ring)]',
      )}
    >
      <RadioGroupItem value={resumeId} className="mt-0.5" />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center justify-between gap-2">
          <span data-resume-name="" className="text-sm font-semibold text-[var(--foreground)]">{name}</span>
          {matchCount > 0 && (
            <Badge variant="success" className="rounded-full px-2.5 py-0.5 text-xs tabular-nums">
              {matchCount}/{jobSkills.length} skills match
            </Badge>
          )}
        </span>
        <span className="mt-2 flex flex-wrap gap-1.5">
          {skills.slice(0, 4).map((skill) => (
            <Badge key={skill} variant="soft" className="rounded-full px-2.5 py-0.5 text-xs">
              {skill}
            </Badge>
          ))}
          {skills.length > 4 && (
            <Badge variant="soft" className="rounded-full px-2.5 py-0.5 text-xs">
              +{skills.length - 4}
            </Badge>
          )}
        </span>
      </span>
    </label>
  )
}

/** Step 1 — pick which resume goes out. */
export function ResumeStep({ job, draft, onPatch }: ResumeStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">Choose a resume</h2>
      <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
        The company sees the resume you send — pick the one that tells this
        story best. Resumes are managed in your profile.
      </p>

      <RadioGroup
        value={draft.resumeId ?? undefined}
        onValueChange={(value) => onPatch({ resumeId: value })}
        className="flex-col gap-3 items-stretch"
      >
        {RESUMES.map((resume) => (
          <ResumeOption
            key={resume.id}
            resumeId={resume.id}
            name={resume.name}
            skills={resume.skills}
            matchCount={resumeMatchCount(job.skills, resume.skills)}
            jobSkills={job.skills}
            selected={draft.resumeId === resume.id}
          />
        ))}
      </RadioGroup>
    </div>
  )
}
