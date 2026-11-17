import { HugeiconsIcon } from '@hugeicons/react'
import {
  PlusSignIcon,
  StarIcon,
} from '@hugeicons/core-free-icons'
import * as React from 'react'

import { SiteNavbar } from '@/components/layout/site-navbar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectItem } from '@/components/ui/select'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { useIsMobile } from '@/hooks/use-mobile'
import { ResumeViewSidebar } from './view/view-sidebar'
import { ResumeViewDetail } from './view/view-detail'
import type { ResumeSectionId } from './view/sections'
import { cn } from '@/lib/utils'
import type { ResumeItem, ResumeTemplateType, ResumeVisibility } from './data'
import { ResumeCard, NewResumeTile } from './resume-card'
import { TEMPLATE_LABEL, VISIBILITY_LABEL } from './data'
import { createResume, removeResume, updateResume, useResumes } from './store'
import { careerFeedback } from './career-feedback'

/** Shared title/template/visibility fields for the create and edit dialogs. */
function ResumeFields({
  title,
  onTitleChange,
  template,
  onTemplateChange,
  visibility,
  onVisibilityChange,
}: {
  title: string
  onTitleChange: (value: string) => void
  template: ResumeTemplateType
  onTemplateChange: (value: ResumeTemplateType) => void
  visibility: ResumeVisibility
  onVisibilityChange: (value: ResumeVisibility) => void
}) {
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <Field>
        <FieldLabel htmlFor="resume-title">Resume title</FieldLabel>
        <Input
          id="resume-title"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          maxLength={150}
          placeholder="e.g. Frontend Developer Resume (2026)"
          autoFocus
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="resume-template">Template</FieldLabel>
          <Select
            id="resume-template"
            value={template}
            onChange={(event) => onTemplateChange(event.target.value as ResumeTemplateType)}
          >
            {(Object.keys(TEMPLATE_LABEL) as ResumeTemplateType[]).map((value) => (
              <SelectItem key={value} value={value}>
                {TEMPLATE_LABEL[value]}
              </SelectItem>
            ))}
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="resume-visibility">Visibility</FieldLabel>
          <Select
            id="resume-visibility"
            value={visibility}
            onChange={(event) => onVisibilityChange(event.target.value as ResumeVisibility)}
          >
            {(Object.keys(VISIBILITY_LABEL) as ResumeVisibility[]).map((value) => (
              <SelectItem key={value} value={value}>
                {VISIBILITY_LABEL[value]}
              </SelectItem>
            ))}
          </Select>
        </Field>
      </div>
    </div>
  )
}

/**
 * My resumes — the reference layout: header with a "New resume" action, a
 * default banner, a card grid (identity + template badge, completion,
 * visibility, View/Edit/Delete, AI career feedback, default row), and the
 * dashed new-resume tile closing the grid. Data mirrors the resume service
 * (`GET /api/resumes/my-resumes`); create/edit mirror `POST /create` and
 * `PUT /{id}`, and AI feedback stands in for
 * `POST /api/ai/resume/career-feedback`. View opens the left section
 * sidebar (resume-view-sidebar, the shared Sidebar primitive). Reached
 * from the navbar's "My resumes" link.
 */
export function ResumesPage() {
  const [query, setQuery] = React.useState('')
  const [location, setLocation] = React.useState('')
  const resumes = useResumes()
  const isMobile = useIsMobile()

  const [viewingId, setViewingId] = React.useState<string | null>(null)
  const [viewSection, setViewSection] = React.useState<ResumeSectionId>('personal-info')
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const [feedbackId, setFeedbackId] = React.useState<string | null>(null)
  const [creating, setCreating] = React.useState(false)

  // Dialog form state (title/template/visibility for create and edit).
  const [title, setTitle] = React.useState('')
  const [template, setTemplate] = React.useState<ResumeTemplateType>('DEFAULT')
  const [visibility, setVisibility] = React.useState<ResumeVisibility>('PRIVATE')

  const editing = (resumes.find((item) => item.id === editingId) ?? null) as ResumeItem | null
  const deleting = (resumes.find((item) => item.id === deletingId) ?? null) as ResumeItem | null
  const feedback = (resumes.find((item) => item.id === feedbackId) ?? null) as ResumeItem | null
  const viewing = (resumes.find((item) => item.id === viewingId) ?? null) as ResumeItem | null
  const defaultResume = resumes.find((item) => item.isDefault) ?? null

  const openCreate = () => {
    setTitle('')
    setTemplate('DEFAULT')
    setVisibility('PRIVATE')
    setCreating(true)
  }

  const openEdit = (item: ResumeItem) => {
    setTitle(item.title)
    setTemplate(item.template)
    setVisibility(item.visibility)
    setEditingId(item.id)
  }

  // View opens the left section rail; every open starts at the top of the
  // document.
  const openView = (item: ResumeItem) => {
    setViewingId(item.id)
    setViewSection('personal-info')
  }

  const submitEdit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed || !editing) return
    updateResume(editing.id, { title: trimmed, template, visibility })
    setEditingId(null)
  }

  const submitCreate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    createResume({ title: trimmed, template, visibility })
    setCreating(false)
  }

  return (
    <div className={cn('flex flex-col', viewing ? 'h-dvh overflow-hidden' : 'min-h-dvh')}>
      <SiteNavbar query={query} location={location} onQueryChange={setQuery} onLocationChange={setLocation} />

      <SidebarProvider
        open={viewing !== null}
        onOpenChange={(open) => {
          // The sidebar's own shortcut (Ctrl/Cmd+B) while viewing closes it.
          if (!open) setViewingId(null)
        }}
        className={viewing ? 'flex-1' : undefined}
      >
        {/* The left section rail — the resume service's stored sections
            (personal info, summary, work, education, skills, projects,
            certifications, awards, languages, settings). On desktop the
            section content renders in the main area beside it; on mobile
            the rail is a left sheet carrying menu + content. The navbar
            stays above the shell, so the rail starts beneath it. */}
        {viewing && (
          <ResumeViewSidebar
            key={viewing.id}
            resume={viewing}
            section={viewSection}
            onSectionChange={setViewSection}
            onClose={() => setViewingId(null)}
          />
        )}
        <SidebarInset className={viewing ? 'md:overflow-y-auto' : undefined}>

          {viewing && !isMobile ? (
            <ResumeViewDetail resume={viewing} section={viewSection} />
          ) : (
          <main className="mx-auto w-full max-w-5xl px-4 pb-16 pt-8 md:px-6">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-[22px] font-bold tracking-tight text-[var(--foreground)]">My resumes</h1>
            <p className="mt-1 text-sm leading-relaxed text-[var(--muted-foreground)]">
              Create and manage multiple resume versions using our built-in templates.
            </p>
          </div>
          <Button
            variant="primary"
            className="[background-image:var(--neu-fill-primary)] text-[var(--primary-foreground)]"
            onClick={openCreate}
          >
            <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} aria-hidden="true" />
            New resume
          </Button>
        </header>

        {/* Default banner — the resume that goes out when none is chosen. */}
        {defaultResume && (
          <div className="mt-5 flex items-start gap-3 rounded-[var(--neu-radius-surface)] border border-[color:var(--neu-selected-border)] bg-[var(--neu-surface)] px-4 py-3.5 [background-image:var(--neu-fill-inset)] shadow-[var(--neu-shadow-inset-sm)]">
            <HugeiconsIcon icon={StarIcon} strokeWidth={2} aria-hidden="true" className="mt-0.5 size-4.5 shrink-0 text-[var(--neu-accent-ink)]" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--foreground)]">Default resume</p>
              <p className="mt-0.5 text-[13px] leading-relaxed text-[var(--muted-foreground)]">
                “{defaultResume.title}” will be used when you apply without choosing a version.
              </p>
            </div>
          </div>
        )}

        <div className="mt-5 grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume) => (
            <ResumeCard
              key={resume.id}
              resume={resume}
              onView={openView}
              onEdit={openEdit}
              onDelete={(item) => setDeletingId(item.id)}
              onFeedback={(item) => setFeedbackId(item.id)}
            />
          ))}
          <NewResumeTile onClick={openCreate} />
        </div>
      </main>
          )}
        </SidebarInset>
      </SidebarProvider>

      {/* AI career feedback — stands in for POST /api/ai/resume/career-feedback
          (CareerFeedbackResponse): profile strength, summary, shortlisting
          issues, and prioritized improvements. */}
      <Dialog open={feedback !== null} onOpenChange={(open) => !open && setFeedbackId(null)}>
        <DialogContent className="max-w-lg">
          {feedback && (() => {
            const report = careerFeedback(feedback)
            return (
              <div className="flex min-w-0 flex-col gap-4">
                <DialogTitle>AI career feedback</DialogTitle>
                <DialogDescription>
                  {feedback.title} — assembled from the resume content. Seam:
                  POST /api/ai/resume/career-feedback.
                </DialogDescription>

                <div className="flex items-center gap-4 rounded-[var(--neu-radius-control)] bg-[var(--neu-surface)] px-4 py-3.5 [background-image:var(--neu-fill-inset)] shadow-[var(--neu-shadow-inset)]">
                  <span className="text-2xl font-bold tabular-nums text-[var(--foreground)]">
                    {report.profileStrength}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--foreground)]">Profile strength</p>
                    <p className="text-[13px] leading-relaxed text-[var(--muted-foreground)]">{report.overallSummary}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-[13px] font-semibold text-[var(--foreground)]">Shortlisting issues</h4>
                  <ul className="mt-1.5 flex flex-col gap-1.5">
                    {report.shortlistingIssues.map((issue) => (
                      <li key={issue} className="flex gap-2 text-[13px] leading-relaxed text-[var(--muted-foreground)]">
                        <span aria-hidden="true" className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[var(--muted-foreground)] opacity-50" />
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-[13px] font-semibold text-[var(--foreground)]">Improvements</h4>
                  <ul className="mt-1.5 flex flex-col gap-2.5">
                    {report.improvements.map((improvement) => (
                      <li key={improvement.area} className="rounded-[var(--neu-radius-control)] bg-[var(--neu-surface)] px-3.5 py-2.5 [background-image:var(--neu-fill-inset)] shadow-[var(--neu-shadow-inset-sm)]">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[13px] font-semibold text-[var(--foreground)]">{improvement.area}</p>
                          <Badge
                            variant={improvement.priority === 'High' ? 'destructive' : 'soft'}
                            className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
                          >
                            {improvement.priority}
                          </Badge>
                        </div>
                        <p className="mt-1 text-[13px] leading-relaxed text-[var(--muted-foreground)]">{improvement.action}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })()}
        </DialogContent>
      </Dialog>

      {/* Create — `POST /api/resumes/create` (ResumeRequest). A fresh resume
          starts empty; the apply flow and this page fill it in. */}
      <Dialog open={creating} onOpenChange={(open) => !open && setCreating(false)}>
        <DialogContent className="max-w-md">
          <form onSubmit={submitCreate} className="flex min-w-0 flex-col gap-5">
            <DialogTitle>New resume</DialogTitle>
            <DialogDescription>Pick a template to get started — sections can be filled in later.</DialogDescription>
            <ResumeFields
              title={title}
              onTitleChange={setTitle}
              template={template}
              onTemplateChange={setTemplate}
              visibility={visibility}
              onVisibilityChange={setVisibility}
            />
            <DialogFooter>
              <Button variant="soft" type="button" onClick={() => setCreating(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!title.trim()}>
                Create resume
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit — `PUT /api/resumes/{id}` (UpdateResumeRequest{title, template,
          visibility}); sections are edited in the dedicated view later. */}
      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditingId(null)}>
        <DialogContent className="max-w-md">
          {editing && (
            <form onSubmit={submitEdit} className="flex min-w-0 flex-col gap-5">
              <DialogTitle>Edit resume</DialogTitle>
              <DialogDescription>Update the title, template, or visibility of “{editing.title}”.</DialogDescription>
              <ResumeFields
                title={title}
                onTitleChange={setTitle}
                template={template}
                onTemplateChange={setTemplate}
                visibility={visibility}
                onVisibilityChange={setVisibility}
              />
              <DialogFooter>
                <Button variant="soft" type="button" onClick={() => setEditingId(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!title.trim()}>
                  Save changes
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete — soft delete on the backend; say the consequence plainly:
          the newest remaining resume becomes the default. */}
      <Dialog open={deleting !== null} onOpenChange={(open) => !open && setDeletingId(null)}>
        <DialogContent className="max-w-md">
          {deleting && (
            <div className="flex min-w-0 flex-col gap-5">
              <DialogTitle>Delete resume?</DialogTitle>
              <DialogDescription>
                “{deleting.title}” will be deleted. This cannot be undone.
                {deleting.isDefault && ' Your newest remaining resume becomes the default.'}
              </DialogDescription>
              <DialogFooter>
                <Button variant="soft" type="button" onClick={() => setDeletingId(null)}>
                  Keep resume
                </Button>
                <Button
                  type="button"
                  className="border-[color:var(--destructive)] bg-[var(--destructive)] text-white"
                  onClick={() => {
                    removeResume(deleting.id)
                    setDeletingId(null)
                  }}
                >
                  Delete
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
