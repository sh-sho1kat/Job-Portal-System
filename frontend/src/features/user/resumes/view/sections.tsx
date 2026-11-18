import type * as React from 'react'

import type { ResumeItem } from '../data'
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
import { WorkExperienceSection } from './work-experience'
import { EducationSection } from './education'
import { SkillsSection } from './skills'
import { ProjectsSection } from './projects'
import { CertificationsSection } from './certifications'
import { AwardsSection } from './awards'
import { LanguagesSection } from './languages'
import { SettingsSection } from './settings-section'

/**
 * The view sidebar's registry, the shared row primitives, and the section
 * dispatcher. The resume service keeps each section as its own aggregate
 * (PersonalInfoController, WorkExperienceController, EducationController,
 * ResumeSkillController, ProjectController, CertificationController,
 * AwardController, LanguageController) plus the `UpdateResumeRequest`
 * fields under Settings; the order here is the resume document's reading
 * order. Every section page is editable and lives in its own file
 * (`personal-info.tsx`, `summary.tsx`, `work-experience.tsx`, …).
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

/** The active section's stored content — shared by the desktop detail and
 *  the mobile sheet. */
export function SectionContent({ resume, section }: { resume: ResumeItem; section: ResumeSectionId }) {
  switch (section) {
    case 'personal-info':
      return <PersonalInfoSection resume={resume} />
    case 'summary':
      return <SummarySection resume={resume} />
    case 'work':
      return <WorkExperienceSection resume={resume} />
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
