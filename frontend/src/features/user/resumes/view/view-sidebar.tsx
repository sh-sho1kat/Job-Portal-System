import { HugeiconsIcon } from '@hugeicons/react'
import { File02Icon, ViewIcon } from '@hugeicons/core-free-icons'
import * as React from 'react'

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
import { cn } from '@/lib/utils'
import type { ResumeItem } from '../data'
import { formatResumeDate, formatDateRange } from '../data'
import { SectionContent, SECTIONS, type ResumeSectionId } from './sections'


/**
 * Rail shade — a panel one step darker than the page. Overriding the
 * surface tokens on the rail's own root re-themes everything inside it
 * (menu, chips, footer, buttons) without touching the rest of the page,
 * in both themes.
 */
const RAIL_SHADE_STYLE = {
  '--neu-surface': 'var(--neu-rail-ink)',
  '--neu-surface-soft': 'var(--neu-rail-ink-soft)',
  '--neu-fill-inset': 'var(--neu-rail-ink-fill)',
  '--neu-edge': 'var(--border)',
} as React.CSSProperties

/** The apply flow's preview dialog consumes its own `Resume` shape; this
 *  adapts the list item onto it. */
/** The preview dialog reads {role, company, period, detail}; the stored
 *  entries are the backend's richer `WorkExperienceResponse` shape. */
function toPreviewShape(item: ResumeItem) {
  return {
    id: item.id,
    name: item.title,
    template: item.template,
    isDefault: item.isDefault,
    headline: item.personalInfo.headline,
    summary: item.summary,
    experience: item.work.map((entry) => ({
      role: entry.position,
      company: entry.companyName,
      period: formatDateRange(entry.startDate, entry.endDate, entry.isCurrentJob),
      detail: entry.description,
    })),
    skills: item.skills,
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
    // onto its fixed popup.) The scoped shade style rides both branches:
    // the aside on desktop, the sheet popup on mobile.
    <Sidebar
      side="left"
      collapsible="none"
      mobileTitle={resume.title}
      mobileDescription="Resume sections"
      closeLabel="Close resume view"
      className="md:h-full"
      style={RAIL_SHADE_STYLE}
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
