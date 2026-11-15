import { HugeiconsIcon } from '@hugeicons/react'
import {
  DraftingCompassIcon,
  File02Icon,
  GraduationCapIcon,
  LicenseIcon,
  PuzzleIcon,
  Settings02Icon,
  StickyNote01Icon,
  TranslateIcon,
  TrophyIcon,
  UserIcon,
  ViewIcon,
  WorkHistoryIcon,
} from '@hugeicons/core-free-icons'
import * as React from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'
import { ResumePreviewDialog } from '@/features/user/jobs/apply/steps/resume-step'
import { ACCOUNT, fullName } from '@/features/user/profile/data'
import { cn } from '@/lib/utils'
import type { ResumeItem } from './data'
import {
  LANGUAGE_PROFICIENCY_LABEL,
  TEMPLATE_LABEL,
  VISIBILITY_LABEL,
  formatResumeDate,
} from './data'

/**
 * View-resume sidebar — the resume's stored sections, one nav rail entry
 * per backend section. The resume service keeps each of these as its own
 * aggregate (PersonalInfoController, WorkExperienceController,
 * EducationController, ResumeSkillController, ProjectController,
 * CertificationController, AwardController, LanguageController) plus the
 * `UpdateResumeRequest` fields under Settings; the section order here is
 * the resume document's reading order. Read-only for now — section editing
 * lands with the backend endpoints.
 */

const SECTIONS = [
  { id: 'personal-info', label: 'Personal Info', icon: UserIcon },
  { id: 'summary', label: 'Summary', icon: StickyNote01Icon },
  { id: 'work', label: 'Work Experience', icon: WorkHistoryIcon },
  { id: 'education', label: 'Education', icon: GraduationCapIcon },
  { id: 'skills', label: 'Skills', icon: PuzzleIcon },
  { id: 'projects', label: 'Projects', icon: DraftingCompassIcon },
  { id: 'certifications', label: 'Certifications', icon: LicenseIcon },
  { id: 'awards', label: 'Awards', icon: TrophyIcon },
  { id: 'languages', label: 'Languages', icon: TranslateIcon },
  { id: 'settings', label: 'Settings', icon: Settings02Icon },
] as const

export type ResumeSectionId = (typeof SECTIONS)[number]['id']

/** Entry counts for the rail — lists only; identity/summary/settings are single. */
function sectionCount(resume: ResumeItem, id: ResumeSectionId): number | null {
  switch (id) {
    case 'work':
      return resume.work.length
    case 'education':
      return resume.education.length
    case 'skills':
      return resume.skills.length
    case 'projects':
      return resume.projects.length
    case 'certifications':
      return resume.certifications.length
    case 'awards':
      return resume.awards.length
    case 'languages':
      return resume.languages.length
    default:
      return null
  }
}

/** Label/value row used across Personal Info and Settings. */
function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid min-w-0 grid-cols-[7rem_minmax(0,1fr)] items-baseline gap-3 py-2 max-[420px]:grid-cols-1 max-[420px]:gap-0.5">
      <dt className="text-[13px] text-[var(--muted-foreground)]">{label}</dt>
      <dd className="min-w-0 text-[13px] font-medium leading-relaxed text-[var(--foreground)]">
        {children}
      </dd>
    </div>
  )
}

function MetaList({ children }: { children: React.ReactNode }) {
  return <dl className="flex min-w-0 flex-col divide-y divide-[color:var(--border)]">{children}</dl>
}

/** Quiet empty panel — the section exists on the backend but has no rows yet. */
function SectionEmpty({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-[var(--neu-radius-control)] border border-dashed border-[color:var(--border)] px-4 py-8 text-center">
      <p className="text-[13px] font-medium text-[var(--foreground)]">{message}</p>
      <p className="text-xs text-[var(--muted-foreground)]">
        Add entries once section editing arrives.
      </p>
    </div>
  )
}

/** The apply flow's preview dialog consumes its own `Resume` shape; this
 *  adapts the list item onto it (same adapter the card grid used). */
function toPreviewShape(item: ResumeItem) {
  return {
    id: item.id,
    name: item.title,
    template: item.template,
    isDefault: item.isDefault,
    headline: item.headline,
    summary: item.summary,
    experience: item.work,
    skills: item.skills,
  }
}

function SectionContent({ resume, section }: { resume: ResumeItem; section: ResumeSectionId }) {
  switch (section) {
    case 'personal-info': {
      // Same candidate as everywhere else in the portal — identity fields
      // come from the account store; the headline is resume-level.
      const personalInfo: Array<[string, React.ReactNode]> = [
        ['Full name', fullName(ACCOUNT)],
        ['Headline', resume.headline || <em key="h">Not added yet</em>],
        ['Email', ACCOUNT.email],
        ['Phone', ACCOUNT.phoneNumber ?? <em key="p">Not added yet</em>],
      ]
      return (
        <div className="flex min-w-0 flex-col gap-3">
          <MetaList>
            {personalInfo.map(([label, value]) => (
              <MetaRow key={label} label={label}>
                {value}
              </MetaRow>
            ))}
          </MetaList>
          <p className="text-[13px] leading-relaxed text-[var(--muted-foreground)]">
            City, country and profile links (LinkedIn, GitHub, portfolio, website) live in the
            backend's personal-info record — they appear here once section editing arrives.
          </p>
        </div>
      )
    }

    case 'summary':
      return resume.summary ? (
        <p className="max-w-prose text-sm leading-relaxed text-[var(--foreground)]">
          {resume.summary}
        </p>
      ) : (
        <SectionEmpty message="No summary written yet." />
      )

    case 'work':
      return resume.work.length > 0 ? (
        <ol className="flex min-w-0 flex-col gap-3">
          {resume.work.map((entry, index) => (
            <li
              key={`${entry.company}-${index}`}
              className="rounded-[var(--neu-radius-control)] bg-[var(--neu-surface)] px-4 py-3.5 [background-image:var(--neu-fill-inset)] shadow-[var(--neu-shadow-inset-sm)]"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  {entry.role} · {entry.company}
                </p>
                <span className="text-xs tabular-nums text-[var(--muted-foreground)]">
                  {entry.period}
                </span>
              </div>
              <p className="mt-1 text-[13px] leading-relaxed text-[var(--muted-foreground)]">
                {entry.detail}
              </p>
            </li>
          ))}
        </ol>
      ) : (
        <SectionEmpty message="No work experience added yet." />
      )

    case 'education':
      return resume.education.length > 0 ? (
        <ol className="flex min-w-0 flex-col gap-3">
          {resume.education.map((entry, index) => (
            <li
              key={`${entry.institutionName}-${index}`}
              className="rounded-[var(--neu-radius-control)] bg-[var(--neu-surface)] px-4 py-3.5 [background-image:var(--neu-fill-inset)] shadow-[var(--neu-shadow-inset-sm)]"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  {entry.degree} · {entry.fieldOfStudy}
                </p>
                <span className="text-xs tabular-nums text-[var(--muted-foreground)]">
                  {entry.period}
                </span>
              </div>
              <p className="mt-1 text-[13px] text-[var(--muted-foreground)]">
                {entry.institutionName}
                {entry.grade ? ` · ${entry.grade}` : ''}
              </p>
            </li>
          ))}
        </ol>
      ) : (
        <SectionEmpty message="No education added yet." />
      )

    case 'skills':
      return resume.skills.length > 0 ? (
        <ul className="flex min-w-0 flex-wrap gap-2">
          {resume.skills.map((skill) => (
            <li
              key={skill}
              className="rounded-full bg-[var(--neu-surface)] px-3 py-1 text-[13px] font-medium text-[var(--foreground)] [background-image:var(--neu-fill-inset)] shadow-[var(--neu-shadow-inset-sm)]"
            >
              {skill}
            </li>
          ))}
        </ul>
      ) : (
        <SectionEmpty message="No skills listed yet." />
      )

    case 'projects':
      return resume.projects.length > 0 ? (
        <ol className="flex min-w-0 flex-col gap-3">
          {resume.projects.map((entry, index) => (
            <li
              key={`${entry.title}-${index}`}
              className="rounded-[var(--neu-radius-control)] bg-[var(--neu-surface)] px-4 py-3.5 [background-image:var(--neu-fill-inset)] shadow-[var(--neu-shadow-inset-sm)]"
            >
              <p className="text-sm font-semibold text-[var(--foreground)]">{entry.title}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-[var(--muted-foreground)]">
                {entry.description}
              </p>
              {entry.technologies.length > 0 && (
                <ul className="mt-2 flex min-w-0 flex-wrap gap-1.5">
                  {entry.technologies.map((tech) => (
                    <li
                      key={tech}
                      className="rounded-full bg-[var(--neu-surface)] px-2.5 py-0.5 text-xs font-medium text-[var(--muted-foreground)] [background-image:var(--neu-fill-raised)] shadow-[var(--neu-shadow-raised-sm)]"
                    >
                      {tech}
                    </li>
                  ))}
                </ul>
              )}
              {entry.projectUrl && (
                <p className="mt-2 truncate text-xs text-[var(--neu-accent-ink)]">
                  {entry.projectUrl}
                </p>
              )}
            </li>
          ))}
        </ol>
      ) : (
        <SectionEmpty message="No projects added yet." />
      )

    case 'certifications':
      return resume.certifications.length > 0 ? (
        <ol className="flex min-w-0 flex-col gap-3">
          {resume.certifications.map((entry, index) => (
            <li
              key={`${entry.name}-${index}`}
              className="rounded-[var(--neu-radius-control)] bg-[var(--neu-surface)] px-4 py-3.5 [background-image:var(--neu-fill-inset)] shadow-[var(--neu-shadow-inset-sm)]"
            >
              <p className="text-sm font-semibold text-[var(--foreground)]">{entry.name}</p>
              <p className="mt-1 text-[13px] text-[var(--muted-foreground)]">
                {entry.issuingOrganization} · Issued {formatResumeDate(entry.issueDate)}
              </p>
              {entry.credentialId && (
                <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                  Credential ID {entry.credentialId}
                </p>
              )}
            </li>
          ))}
        </ol>
      ) : (
        <SectionEmpty message="No certifications added yet." />
      )

    case 'awards':
      return resume.awards.length > 0 ? (
        <ol className="flex min-w-0 flex-col gap-3">
          {resume.awards.map((entry, index) => (
            <li
              key={`${entry.title}-${index}`}
              className="rounded-[var(--neu-radius-control)] bg-[var(--neu-surface)] px-4 py-3.5 [background-image:var(--neu-fill-inset)] shadow-[var(--neu-shadow-inset-sm)]"
            >
              <p className="text-sm font-semibold text-[var(--foreground)]">{entry.title}</p>
              <p className="mt-1 text-[13px] text-[var(--muted-foreground)]">
                {entry.issuer} · {formatResumeDate(entry.dateAwarded)}
              </p>
            </li>
          ))}
        </ol>
      ) : (
        <SectionEmpty message="No awards added yet." />
      )

    case 'languages':
      return resume.languages.length > 0 ? (
        <ol className="flex min-w-0 flex-col gap-3">
          {resume.languages.map((entry, index) => (
            <li
              key={`${entry.languageName}-${index}`}
              className="flex items-center justify-between gap-3 rounded-[var(--neu-radius-control)] bg-[var(--neu-surface)] px-4 py-3 [background-image:var(--neu-fill-inset)] shadow-[var(--neu-shadow-inset-sm)]"
            >
              <p className="text-sm font-semibold text-[var(--foreground)]">{entry.languageName}</p>
              <span className="text-xs font-medium text-[var(--muted-foreground)]">
                {LANGUAGE_PROFICIENCY_LABEL[entry.proficiency]}
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <SectionEmpty message="No languages added yet." />
      )

    case 'settings':
      return (
        <div className="flex min-w-0 flex-col gap-3">
          <MetaList>
            <MetaRow label="Template">{TEMPLATE_LABEL[resume.template]}</MetaRow>
            <MetaRow label="Visibility">{VISIBILITY_LABEL[resume.visibility]}</MetaRow>
            <MetaRow label="Default">{resume.isDefault ? 'Yes' : 'No'}</MetaRow>
            <MetaRow label="Completion">{resume.completionScore}%</MetaRow>
            <MetaRow label="Created">{formatResumeDate(resume.createdAt)}</MetaRow>
            <MetaRow label="Last updated">{formatResumeDate(resume.updatedAt)}</MetaRow>
          </MetaList>
          <p className="text-[13px] leading-relaxed text-[var(--muted-foreground)]">
            Title, template and visibility are edited from the Edit dialog; per-section editing
            arrives with the backend endpoints.
          </p>
        </div>
      )
  }
}

/**
 * One resume's section view. Remounted per resume (via `key` upstream) so
 * every open starts at the top of the document — no reset effect needed.
 */
function ResumeViewPane({ resume }: { resume: ResumeItem }) {
  const [section, setSection] = React.useState<ResumeSectionId>('personal-info')
  const [docPreview, setDocPreview] = React.useState(false)

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col">
        <header className="flex flex-col gap-2.5">
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-[var(--neu-surface)] [background-image:var(--neu-fill-inset)] shadow-[var(--neu-shadow-inset)]"
            >
              <HugeiconsIcon
                icon={File02Icon}
                strokeWidth={1.8}
                aria-hidden="true"
                className="size-4 text-[var(--neu-accent-ink)]"
              />
            </span>
            <div className="min-w-0 pr-8">
              <SheetTitle className="text-base leading-snug">{resume.title}</SheetTitle>
              <SheetDescription className="mt-0.5 text-[13px]">
                Last updated {formatResumeDate(resume.updatedAt)}
              </SheetDescription>
            </div>
          </div>
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
            <Button
              variant="soft"
              size="sm"
              className="ml-auto"
              onClick={() => setDocPreview(true)}
            >
              <HugeiconsIcon icon={ViewIcon} strokeWidth={1.8} aria-hidden="true" />
              Document preview
            </Button>
          </div>
        </header>

        {/* Rail + content. The rail sticks while the content scrolls
            with the sheet on desktop; chips wrap on mobile. */}
        <div className="mt-5 flex min-w-0 flex-1 flex-col gap-4 md:grid md:grid-cols-[10.5rem_minmax(0,1fr)] md:gap-5">
          <nav
            aria-label="Resume sections"
            className="flex min-w-0 flex-wrap gap-1.5 md:sticky md:top-0 md:self-start md:flex-col"
          >
            {SECTIONS.map(({ id, label, icon }) => {
              const count = sectionCount(resume, id)
              const active = id === section
              return (
                <button
                  key={id}
                  type="button"
                  aria-current={active ? 'true' : undefined}
                  onClick={() => setSection(id)}
                  className={cn(
                    'flex min-w-0 cursor-pointer items-center gap-2 rounded-[var(--neu-radius-control)] px-3 py-2 text-left text-[13px] font-medium transition-[background-color,box-shadow,color] duration-[var(--neu-duration)] outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-[color:var(--ring)]',
                    active
                      ? 'border border-[color:var(--neu-selected-border)] bg-[var(--neu-surface)] [background-image:var(--neu-fill-selected)] shadow-[var(--neu-shadow-inset-sm)] text-[var(--foreground)]'
                      : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]',
                  )}
                >
                  <HugeiconsIcon
                    icon={icon}
                    strokeWidth={1.8}
                    aria-hidden="true"
                    className={cn('size-4 shrink-0', active && 'text-[var(--neu-accent-ink)]')}
                  />
                  <span className="min-w-0 flex-1 truncate">{label}</span>
                  {count !== null && (
                    <span
                      className={cn(
                        'shrink-0 rounded-full px-1.5 text-[11px] font-semibold tabular-nums',
                        active
                          ? 'text-[var(--neu-accent-ink)]'
                          : 'text-[var(--muted-foreground)] opacity-70',
                      )}
                    >
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>

          <div className="min-w-0 md:max-h-[calc(100dvh-18rem)] md:overflow-y-auto md:pr-1">
            <SectionContent resume={resume} section={section} />
          </div>
        </div>
      </div>

      {/* The rendered document, kept one click away from the section view. */}
      <ResumePreviewDialog
        resume={docPreview ? toPreviewShape(resume) : undefined}
        onClose={() => setDocPreview(false)}
      />
    </>
  )
}

/**
 * The View sidebar for one resume: header (title + template/visibility
 * meta), a section rail matching the backend's resume sections, and the
 * active section's stored content.
 */
export function ResumeViewSheet({
  resume,
  onClose,
}: {
  resume: ResumeItem | null
  onClose: () => void
}) {
  return (
    <Sheet open={resume !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        closeLabel="Close resume view"
        className="w-[min(46rem,calc(100vw-1rem))]!"
      >
        {resume && <ResumeViewPane key={resume.id} resume={resume} />}
      </SheetContent>
    </Sheet>
  )
}
