import { HugeiconsIcon } from '@hugeicons/react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { ResumeItem } from '../data'
import { TEMPLATE_LABEL, VISIBILITY_LABEL, formatResumeDate } from '../data'
import { SectionContent, SECTIONS, type ResumeSectionId } from './sections'


/** Desktop: the section detail shown in the main area beside the rail. */
export function ResumeViewDetail({
  resume,
  section,
}: {
  resume: ResumeItem
  section: ResumeSectionId
}) {
  const active = SECTIONS.find(({ id }) => id === section)
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-16 pt-10 md:px-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-[22px] font-bold tracking-tight text-[var(--foreground)]">
          {resume.title}
        </h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Last updated {formatResumeDate(resume.updatedAt)}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="soft" className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold">
            {TEMPLATE_LABEL[resume.template]}
          </Badge>
          <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold">
            {VISIBILITY_LABEL[resume.visibility]}
          </Badge>
          {resume.isDefault && (
            <Badge variant="primary" className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold">
              Default
            </Badge>
          )}
          <span className="text-xs tabular-nums text-[var(--muted-foreground)]">
            {resume.completionScore}% complete
          </span>
        </div>
      </header>

      {/* Orientation row — names the section being read, with the same icon
          language as the rail. */}
      <div className="mt-8 flex items-center gap-3">
        {active && (
          <span
            aria-hidden="true"
            className="flex size-8 shrink-0 items-center justify-center rounded-[var(--neu-radius-control)] bg-[var(--neu-surface)] [background-image:var(--neu-fill-inset)] shadow-[var(--neu-shadow-inset)]"
          >
            <HugeiconsIcon
              icon={active.icon}
              strokeWidth={1.8}
              aria-hidden="true"
              className="size-4 text-[var(--neu-accent-ink)]"
            />
          </span>
        )}
        <h2 className="text-[15px] font-semibold tracking-tight text-[var(--foreground)]">
          {active?.label}
        </h2>
        <Separator className="flex-1" />
      </div>

      <div className="mt-6 min-w-0">
        <SectionContent resume={resume} section={section} />
      </div>
    </div>
  )
}
