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
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { ResumePreviewDialog } from '@/features/user/jobs/apply/steps/resume-step'
import { ACCOUNT, fullName } from '@/features/user/profile/data'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { ResumeItem } from './data'
import {
  LANGUAGE_PROFICIENCY_LABEL,
  TEMPLATE_LABEL,
  VISIBILITY_LABEL,
  formatResumeDate,
} from './data'

/**
 * View-resume sidebar — the resume's stored sections, one rail entry per
 * backend section. The resume service keeps each of these as its own
 * aggregate (PersonalInfoController, WorkExperienceController,
 * EducationController, ResumeSkillController, ProjectController,
 * CertificationController, AwardController, LanguageController) plus the
 * `UpdateResumeRequest` fields under Settings; the section order here is
 * the resume document's reading order. Rendered with the shared Sidebar
 * primitive: a left rail on desktop (section menu + detail in the main
 * area), a left sheet with menu + content stacked on mobile. Read-only
 * for now — section editing lands with the backend endpoints.
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

/** Label/value row used across Personal Info and Settings. */
function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid min-w-0 grid-cols-[7rem_minmax(0,1fr)] items-baseline gap-3 py-2 max-sm:grid-cols-1 max-sm:gap-0.5">
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
 *  adapts the list item onto it. */
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

/** The active section's stored content — shared by the desktop detail and
 *  the mobile sheet. */
export function SectionContent({ resume, section }: { resume: ResumeItem; section: ResumeSectionId }) {
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
            City, country and profile links aren't on this resume yet — they appear here once
            section editing arrives.
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
            Title, template and visibility are edited from the Edit dialog — per-section editing
            arrives with the backend endpoints.
          </p>
        </div>
      )
  }
}

/** The rail's identity block: file plate, title, updated date, and (desktop
 *  only) the close control — the mobile sheet has the sheet's own close. */
function ViewHeader({ resume, onClose }: { resume: ResumeItem; onClose: () => void }) {
  const { isMobile } = useSidebar()
  return (
    <SidebarHeader>
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
      <div className={cn('min-w-0 flex-1', isMobile && 'pr-8')}>
        <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-[var(--foreground)]">
          {resume.title}
        </p>
        <p className="mt-0.5 text-[11px] text-[var(--muted-foreground)]">
          Updated {formatResumeDate(resume.updatedAt)}
        </p>
      </div>
      {!isMobile && (
        <Button
          variant="ghost"
          size="icon"
          aria-label="Close resume view"
          onClick={onClose}
          className="size-8 shrink-0"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-4">
            <path d="m6 6 12 12M6 18 18 6" />
          </svg>
        </Button>
      )}
    </SidebarHeader>
  )
}

/** Completion meter + document preview in the rail footer. */
function ViewFooter({ resume }: { resume: ResumeItem }) {
  const [docPreview, setDocPreview] = React.useState(false)
  return (
    <SidebarFooter>
      <div>
        <div className="flex items-baseline justify-between px-1">
          <span className="text-[11px] font-medium text-[var(--muted-foreground)]">Completion</span>
          <span className="text-[11px] font-semibold tabular-nums text-[var(--foreground)]">
            {resume.completionScore}%
          </span>
        </div>
        <div
          role="progressbar"
          aria-label="Completion"
          aria-valuenow={resume.completionScore}
          aria-valuemin={0}
          aria-valuemax={100}
          className="mt-1 h-1.5 min-w-0 overflow-hidden rounded-full bg-[var(--neu-surface)] [background-image:var(--neu-fill-inset)] shadow-[var(--neu-shadow-inset)]"
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
      <Button variant="soft" className="w-full" onClick={() => setDocPreview(true)}>
        <HugeiconsIcon icon={ViewIcon} strokeWidth={1.8} aria-hidden="true" />
        Document preview
      </Button>

      {/* The rendered document, kept one click away from the section view. */}
      <ResumePreviewDialog
        resume={docPreview ? toPreviewShape(resume) : undefined}
        onClose={() => setDocPreview(false)}
      />
    </SidebarFooter>
  )
}

/**
 * The left sidebar for one resume. On desktop it is a persistent rail
 * (section menu; the section content renders in the main area next to it);
 * on mobile the Sidebar primitive renders it as a left sheet with the
 * content stacked under the menu. Remounted per resume via `key`, so every
 * open starts at the top of the document.
 */
export function ResumeViewSidebar({
  resume,
  section,
  onSectionChange,
  onClose,
}: {
  resume: ResumeItem
  section: ResumeSectionId
  onSectionChange: (section: ResumeSectionId) => void
  onClose: () => void
}) {
  const { isMobile, openMobile, setOpenMobile } = useSidebar()

  // On mobile the rail renders as a left sheet driven by the sidebar
  // context: open it when the view mounts, and when the sheet is dismissed
  // (its own close button or Escape) mirror that back into the page's view
  // state so the two never disagree. The `everOpen` ref keeps the dismissal
  // sync from firing before the sheet has actually opened — including
  // through StrictMode's double effect run.
  const everOpenRef = React.useRef(false)
  const onCloseRef = React.useRef(onClose)
  React.useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])
  React.useEffect(() => {
    if (isMobile && openMobile) everOpenRef.current = true
  }, [isMobile, openMobile])
  React.useEffect(() => {
    if (!isMobile) return
    setOpenMobile(true)
  }, [isMobile, setOpenMobile])
  React.useEffect(() => {
    if (isMobile && everOpenRef.current && !openMobile) onCloseRef.current()
  }, [isMobile, openMobile])

  return (
    // Desktop: the shell row is viewport-minus-navbar, so the rail fills it
    // exactly. (Mobile renders as a sheet — height classes must not leak
    // onto its fixed popup.)
    <Sidebar
      side="left"
      collapsible="none"
      mobileTitle={resume.title}
      mobileDescription="Resume sections"
      closeLabel="Close resume view"
      className="md:h-full"
    >
      <ViewHeader resume={resume} onClose={onClose} />
      <SidebarContent className="p-2">
        <SidebarGroup className="py-1">
          <SidebarGroupLabel>Sections</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {SECTIONS.map(({ id, label, icon }) => {
                const active = id === section
                return (
                  <SidebarMenuItem key={id}>
                    <SidebarMenuButton
                      isActive={active}
                      aria-current={active ? 'true' : undefined}
                      onClick={() => onSectionChange(id)}
                      className={cn(
                        'border border-transparent',
                        active &&
                          'border-[color:var(--neu-selected-border)] [background-image:var(--neu-fill-inset)]',
                      )}
                    >
                      <HugeiconsIcon
                        icon={icon}
                        strokeWidth={1.8}
                        aria-hidden="true"
                        className={cn('size-4 shrink-0', !active && 'text-[var(--muted-foreground)]')}
                      />
                      <span className="min-w-0 flex-1 truncate">{label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Mobile: the sheet carries the section content itself, stacked
            under the menu. */}
        {isMobile && (
          <SidebarGroup className="min-w-0 py-1">
            <SidebarGroupContent className="min-w-0">
              <SectionContent resume={resume} section={section} />
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <ViewFooter resume={resume} />
    </Sidebar>
  )
}

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
