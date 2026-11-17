import type * as React from 'react'

import type { ResumeItem } from '../data'
import {
  LANGUAGE_PROFICIENCY_LABEL,
  TEMPLATE_LABEL,
  VISIBILITY_LABEL,
  formatResumeDate,
} from '../data'
import {
  DraftingCompassIcon,
  GraduationCapIcon,
  LicenseIcon,
  PuzzleIcon,
  Settings02Icon,
  StickyNote01Icon,
  TranslateIcon,
  TrophyIcon,
  UserIcon,
  WorkHistoryIcon,
} from '@hugeicons/core-free-icons'
import { PersonalInfoSection } from './personal-info'
import { SummarySection } from './summary'

/**
 * The view sidebar's sections — the registry, the shared row primitives,
 * and the read-only section pages in one file. The resume service keeps
 * each section as its own aggregate (PersonalInfoController,
 * WorkExperienceController, EducationController, ResumeSkillController,
 * ProjectController, CertificationController, AwardController,
 * LanguageController) plus the `UpdateResumeRequest` fields under
 * Settings; the order here is the resume document's reading order.
 * Personal Info is editable and lives in its own file
 * (`personal-info.tsx`), as is Summary (`summary.tsx`); the rest stay
 * read-only until their endpoints land and graduate to their own files
 * when they do.
 */

// eslint-disable-next-line react-refresh/only-export-components -- the section registry is data, not a component; moving it would fragment the file set
export const SECTIONS = [
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

/** Label/value row used across the section pages (Personal Info,
 *  Settings). */
export function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid min-w-0 grid-cols-[7rem_minmax(0,1fr)] items-baseline gap-3 py-2 max-sm:grid-cols-1 max-sm:gap-0.5">
      <dt className="text-[13px] text-[var(--muted-foreground)]">{label}</dt>
      <dd className="min-w-0 text-[13px] font-medium leading-relaxed text-[var(--foreground)]">
        {children}
      </dd>
    </div>
  )
}

export function MetaList({ children }: { children: React.ReactNode }) {
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

/** Work experience — the resume service's `WorkExperienceResponse` list. */
function WorkSection({ resume }: { resume: ResumeItem }) {
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
}

/** Education — the resume service's `EducationResponse` list. */
function EducationSection({ resume }: { resume: ResumeItem }) {
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
}

/** Skills — the resume service's `ResumeSkillResponse` list. */
function SkillsSection({ resume }: { resume: ResumeItem }) {
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
}

/** Projects — the resume service's `ProjectResponse` list. */
function ProjectsSection({ resume }: { resume: ResumeItem }) {
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
}

/** Certifications — the resume service's `CertificationResponse` list. */
function CertificationsSection({ resume }: { resume: ResumeItem }) {
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
}

/** Awards — the resume service's `AwardResponse` list. */
function AwardsSection({ resume }: { resume: ResumeItem }) {
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
}

/** Languages — the resume service's `LanguageProficiencyResponse` list. */
function LanguagesSection({ resume }: { resume: ResumeItem }) {
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
}

/** Settings — the resume shell's own fields (`UpdateResumeRequest`) plus
 *  the backend's timestamps; editing happens through the page's Edit
 *  dialog. */
function SettingsSection({ resume }: { resume: ResumeItem }) {
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

/** The active section's stored content — shared by the desktop detail and
 *  the mobile sheet. */
export function SectionContent({ resume, section }: { resume: ResumeItem; section: ResumeSectionId }) {
  switch (section) {
    case 'personal-info':
      return <PersonalInfoSection resume={resume} />
    case 'summary':
      return <SummarySection resume={resume} />
    case 'work':
      return <WorkSection resume={resume} />
    case 'education':
      return <EducationSection resume={resume} />
    case 'skills':
      return <SkillsSection resume={resume} />
    case 'projects':
      return <ProjectsSection resume={resume} />
    case 'certifications':
      return <CertificationsSection resume={resume} />
    case 'awards':
      return <AwardsSection resume={resume} />
    case 'languages':
      return <LanguagesSection resume={resume} />
    case 'settings':
      return <SettingsSection resume={resume} />
  }
}
