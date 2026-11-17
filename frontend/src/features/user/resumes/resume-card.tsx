import { HugeiconsIcon } from '@hugeicons/react'
import {
  Clock01Icon,
  Delete02Icon,
  EyeIcon,
  File02Icon,
  PencilEdit02Icon,
  PlusSignIcon,
  SparklesIcon,
  StarIcon,
  ViewIcon,
} from '@hugeicons/core-free-icons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { ResumeItem, ResumeTemplateType } from './data'
import { TEMPLATE_LABEL, VISIBILITY_LABEL, formatResumeDate } from './data'
import { setDefaultResume } from './store'

/** Template badge variant — each template reads distinctly but stays inside
 *  the theme's badge set. */
const TEMPLATE_VARIANT: Record<ResumeTemplateType, 'primary' | 'soft' | 'outline'> = {
  PROFESSIONAL: 'primary',
  MODERN: 'soft',
  CLASSIC: 'outline',
  DEFAULT: 'soft',
}

export /** One resume card, in the reference layout: identity + template badge,
 *  completion, visibility meta, actions row, AI feedback, default row. */
function ResumeCard({
  resume,
  onView,
  onEdit,
  onDelete,
  onFeedback,
}: {
  resume: ResumeItem
  onView: (resume: ResumeItem) => void
  onEdit: (resume: ResumeItem) => void
  onDelete: (resume: ResumeItem) => void
  onFeedback: (resume: ResumeItem) => void
}) {
  return (
    <Card variant="raised" className="flex flex-col transition-shadow hover:shadow-[var(--neu-shadow-raised)]">
      <div className="flex flex-1 flex-col gap-3 p-4 md:p-5">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-[var(--neu-surface)] [background-image:var(--neu-fill-inset)] shadow-[var(--neu-shadow-inset)]"
          >
            <HugeiconsIcon icon={File02Icon} strokeWidth={1.8} aria-hidden="true" className="size-4.5 text-[var(--neu-accent-ink)]" />
          </span>
          {/* Quick reveal — the default preview-card delay feels sluggish. */}
          <HoverCard>
            {/* delay lives on the trigger — the root's 600ms default feels
                sluggish. */}
            <HoverCardTrigger
              delay={120}
              closeDelay={80}
              className="min-w-0 flex-1 cursor-default rounded-[var(--neu-radius-small)] outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)]"
            >
              <h3 className="truncate text-[15px] font-semibold tracking-tight text-[var(--foreground)]">
                {resume.title}
              </h3>
            </HoverCardTrigger>
            <HoverCardContent className="w-auto max-w-80">
              <p className="text-sm font-semibold text-[var(--foreground)]">{resume.title}</p>
              <p className="text-[13px] text-[var(--muted-foreground)]">
                {TEMPLATE_LABEL[resume.template]} template · {VISIBILITY_LABEL[resume.visibility]}
              </p>
            </HoverCardContent>
          </HoverCard>
          <Badge variant={TEMPLATE_VARIANT[resume.template]} className="shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold">
            {TEMPLATE_LABEL[resume.template]}
          </Badge>
        </div>

        {/* The backend's 0–100 completion checklist. */}
        <div>
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-medium text-[var(--muted-foreground)]">Completion</span>
            <span className="text-xs font-semibold tabular-nums text-[var(--foreground)]">{resume.completionScore}%</span>
          </div>
          <div
            role="progressbar"
            aria-label="Completion"
            aria-valuenow={resume.completionScore}
            aria-valuemin={0}
            aria-valuemax={100}
            className="mt-1.5 h-1.5 min-w-0 overflow-hidden rounded-full bg-[var(--neu-surface)] [background-image:var(--neu-fill-inset)] shadow-[var(--neu-shadow-inset)]"
          >
            <div
              className={cn(
                'h-full rounded-full',
                resume.completionScore >= 100
                  ? 'bg-[color:var(--success)]'
                  : '[background-image:var(--neu-fill-primary)]',
              )}
              style={{ width: `${resume.completionScore}%` }}
            />
          </div>
        </div>

        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--muted-foreground)]">
          <li className="inline-flex items-center gap-1.5">
            <HugeiconsIcon icon={Clock01Icon} strokeWidth={1.8} aria-hidden="true" className="size-3.5" />
            {formatResumeDate(resume.updatedAt)}
          </li>
          <li className="inline-flex items-center gap-1.5">
            <HugeiconsIcon icon={EyeIcon} strokeWidth={1.8} aria-hidden="true" className="size-3.5" />
            {VISIBILITY_LABEL[resume.visibility]}
          </li>
        </ul>

        <div className="mt-auto flex flex-col gap-2">
          <div className="flex items-stretch gap-2">
            <Button variant="soft" className="flex-1" onClick={() => onView(resume)}>
              <HugeiconsIcon icon={ViewIcon} strokeWidth={1.8} aria-hidden="true" />
              View
            </Button>
            <Button variant="soft" className="flex-1" onClick={() => onEdit(resume)}>
              <HugeiconsIcon icon={PencilEdit02Icon} strokeWidth={1.8} aria-hidden="true" />
              Edit
            </Button>
            <Button
              variant="soft"
              size="icon"
              aria-label={`Delete ${resume.title}`}
              onClick={() => onDelete(resume)}
              className="text-[var(--neu-error-text)] hover:text-[var(--neu-error-text)]"
            >
              <HugeiconsIcon icon={Delete02Icon} strokeWidth={1.8} aria-hidden="true" />
            </Button>
          </div>
          <Button variant="soft" className="w-full" onClick={() => onFeedback(resume)}>
            <HugeiconsIcon icon={SparklesIcon} strokeWidth={1.8} aria-hidden="true" className="text-[var(--neu-accent-ink)]" />
            AI Career Feedback
          </Button>
        </div>

        <Separator />

        <div className="flex justify-start">
          {resume.isDefault ? (
            <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--neu-accent-ink)]">
              <HugeiconsIcon icon={StarIcon} strokeWidth={2} aria-hidden="true" className="size-4" />
              Default resume
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setDefaultResume(resume.id)}
              className="inline-flex cursor-pointer items-center gap-1.5 text-[13px] text-[var(--muted-foreground)] transition-colors duration-[var(--neu-duration)] hover:text-[var(--foreground)] focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)]"
            >
              <HugeiconsIcon icon={StarIcon} strokeWidth={1.8} aria-hidden="true" className="size-4" />
              Set as default
            </button>
          )}
        </div>
      </div>
    </Card>
  )
}

/** Dashed tail tile — the create affordance lives in the grid, like the
 *  reference layout. */
export function NewResumeTile({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-56 cursor-pointer flex-col items-center justify-center gap-2 rounded-[var(--neu-radius-surface)] border-2 border-dashed border-[color:var(--border)] p-6 text-center transition-colors duration-[var(--neu-duration)] hover:border-[color:var(--neu-selected-border)] focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)]"
    >
      <span
        aria-hidden="true"
        className="flex size-11 items-center justify-center rounded-full bg-[var(--neu-surface)] [background-image:var(--neu-fill-raised)] shadow-[var(--neu-shadow-raised-sm)]"
      >
        <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} aria-hidden="true" className="size-5 text-[var(--neu-accent-ink)]" />
      </span>
      <span className="text-sm font-semibold text-[var(--foreground)]">New resume</span>
      <span className="text-[13px] text-[var(--muted-foreground)]">Pick a template to get started</span>
    </button>
  )
}

/** Shared title/template/visibility fields for the create and edit dialogs. */
