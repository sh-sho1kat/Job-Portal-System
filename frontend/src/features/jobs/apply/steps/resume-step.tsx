import * as React from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { EyeIcon } from '@hugeicons/core-free-icons'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'
import type { Job } from '../../data/types'
import type { Resume, ResumeTemplate } from '../../data/resumes'
import { RESUMES, resumeMatchCount, type ApplicationDraft } from '../data'

/** "PROFESSIONAL" → "Professional" — enum value shown in human casing. */
function templateLabel(template: ResumeTemplate): string {
  return template.charAt(0) + template.slice(1).toLowerCase()
}

interface ResumeStepProps {
  job: Job
  draft: ApplicationDraft
  onPatch: (patch: Partial<ApplicationDraft>) => void
}

function ResumeOption({
  resumeId,
  name,
  template,
  isDefault,
  matchCount,
  jobSkills,
  selected,
  onPreview,
}: {
  resumeId: string
  name: string
  template: ResumeTemplate
  isDefault: boolean
  matchCount: number
  jobSkills: Job['skills']
  selected: boolean
  onPreview: (resumeId: string) => void
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
          <span className="flex items-center gap-2">
            {matchCount > 0 && (
              <Badge variant="success" className="rounded-full px-2.5 py-0.5 text-xs tabular-nums">
                {matchCount}/{jobSkills.length} skills match
              </Badge>
            )}
            {/* Preview sits inside the label, so preventDefault keeps the
                click from also selecting this resume. */}
            <Button
              variant="soft"
              size="sm"
              type="button"
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                onPreview(resumeId)
              }}
            >
              <HugeiconsIcon icon={EyeIcon} strokeWidth={1.8} data-icon="inline-start" />
              Preview
            </Button>
          </span>
        </span>
        {/* Resume type and the candidate's default flag — both come off the
            backend's ResumeResponse (template / isDefault) — sit on their own
            line under the name, where the skill chips used to be. */}
        <span className="mt-2 flex flex-wrap gap-1.5">
          <Badge variant="soft" className="rounded-full px-2.5 py-0.5 text-xs">
            {templateLabel(template)}
          </Badge>
          {isDefault && (
            <Badge
              variant="soft"
              className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-[var(--neu-accent-ink)]"
            >
              Default
            </Badge>
          )}
        </span>
      </span>
    </label>
  )
}

function ResumePreviewDialog({
  resume,
  onClose,
}: {
  resume: Resume | undefined
  onClose: () => void
}) {
  if (!resume) return null
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold tracking-tight text-[var(--foreground)]">
            {resume.name}
          </DialogTitle>
          <DialogDescription className="flex flex-wrap items-center gap-2">
            <span>{resume.headline}</span>
            <Badge variant="soft" className="rounded-full px-2.5 py-0.5 text-xs">
              {templateLabel(resume.template)}
            </Badge>
            {resume.isDefault && (
              <Badge
                variant="soft"
                className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-[var(--neu-accent-ink)]"
              >
                Default
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>

        <p className="text-sm leading-relaxed text-[var(--foreground)]">{resume.summary}</p>

        <div className="flex flex-col gap-4">
          <h4 className="text-sm font-bold tracking-tight text-[var(--neu-accent-ink)]">Experience</h4>
          {resume.experience.map((entry) => (
            <div key={entry.role}>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-semibold text-[var(--foreground)]">{entry.role}</p>
                <p className="text-xs tabular-nums text-[var(--muted-foreground)]">{entry.period}</p>
              </div>
              <p className="text-sm text-[var(--muted-foreground)]">{entry.company}</p>
              <p className="mt-1 text-sm leading-relaxed text-[var(--foreground)]">{entry.detail}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <h4 className="text-sm font-bold tracking-tight text-[var(--neu-accent-ink)]">Skills</h4>
          <div className="flex flex-wrap gap-1.5">
            {resume.skills.map((skill) => (
              <Badge key={skill} variant="soft" className="rounded-full px-2.5 py-0.5 text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/** Step 1 — pick which resume goes out. */
export function ResumeStep({ job, draft, onPatch }: ResumeStepProps) {
  const [previewId, setPreviewId] = React.useState<string | null>(null)
  const preview = RESUMES.find((item) => item.id === previewId)

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">Choose a resume</h2>
      <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
        Select the resume you would like to submit with this application. The
        employer will see the resume you choose.
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
            template={resume.template}
            isDefault={resume.isDefault}
            matchCount={resumeMatchCount(job.skills, resume.skills)}
            jobSkills={job.skills}
            selected={draft.resumeId === resume.id}
            onPreview={setPreviewId}
          />
        ))}
      </RadioGroup>

      <ResumePreviewDialog resume={preview} onClose={() => setPreviewId(null)} />
    </div>
  )
}
