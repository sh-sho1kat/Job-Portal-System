import { HugeiconsIcon } from '@hugeicons/react'
import { Delete02Icon, File02Icon, ViewIcon } from '@hugeicons/core-free-icons'
import * as React from 'react'

import { SiteNavbar } from '@/components/layout/site-navbar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog'
import { ResumePreviewDialog } from '@/features/user/jobs/apply/steps/resume-step'
import { cn } from '@/lib/utils'
import type { ResumeItem } from './data'
import {
  TEMPLATE_LABEL,
  VISIBILITY_LABEL,
  formatResumeDate,
  removeResume,
  setDefaultResume,
  useResumes,
} from './data'

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

/** One resume card, in the same quiet shape as the application cards:
 *  identity row, completion bar, one meta line, actions. */
function ResumeCard({
  resume,
  onPreview,
  onDelete,
}: {
  resume: ResumeItem
  onPreview: (resume: ResumeItem) => void
  onDelete: (resume: ResumeItem) => void
}) {
  return (
    <Card variant="raised" className="transition-shadow hover:shadow-[var(--neu-shadow-raised)]">
      <div className="flex flex-col gap-4 p-5 md:p-6">
        <div className="flex items-center gap-3.5">
          <span
            aria-hidden="true"
            className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[var(--neu-surface)] [background-image:var(--neu-fill-inset)] shadow-[var(--neu-shadow-inset)]"
          >
            <HugeiconsIcon icon={File02Icon} strokeWidth={1.8} aria-hidden="true" className="size-5 text-[var(--neu-accent-ink)]" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-[15px] font-semibold tracking-tight text-[var(--foreground)]">
              {resume.title}
            </h3>
            <p className="mt-0.5 text-[13px] text-[var(--muted-foreground)]">
              {TEMPLATE_LABEL[resume.template]} template · {VISIBILITY_LABEL[resume.visibility]}
            </p>
          </div>
          {resume.isDefault && (
            <Badge
              variant="soft"
              className="shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold text-[var(--neu-accent-ink)]"
            >
              Default
            </Badge>
          )}
        </div>

        {/* The backend's 0–100 completion checklist, as a quiet bar. */}
        <div className="flex items-center gap-3 px-1">
          <div
            role="progressbar"
            aria-label="Completion"
            aria-valuenow={resume.completionScore}
            aria-valuemin={0}
            aria-valuemax={100}
            className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-[var(--neu-surface)] [background-image:var(--neu-fill-inset)] shadow-[var(--neu-shadow-inset)]"
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
          <span className="shrink-0 text-xs tabular-nums text-[var(--muted-foreground)]">
            {resume.completionScore}% complete
          </span>
        </div>

        <p className="text-[13px] text-[var(--muted-foreground)]">
          Updated {formatResumeDate(resume.updatedAt)} · {resume.work.length}{' '}
          {resume.work.length === 1 ? 'role' : 'roles'} · {resume.skills.length} skills
        </p>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button variant="ghost" type="button" onClick={() => onPreview(resume)}>
            <HugeiconsIcon icon={ViewIcon} strokeWidth={1.8} aria-hidden="true" />
            Preview
          </Button>
          {!resume.isDefault && (
            <Button variant="soft" type="button" onClick={() => setDefaultResume(resume.id)}>
              Set as default
            </Button>
          )}
          <Button
            variant="ghost"
            type="button"
            onClick={() => onDelete(resume)}
            className="text-[var(--neu-error-text)] hover:text-[var(--neu-error-text)]"
            aria-label={`Delete ${resume.title}`}
          >
            <HugeiconsIcon icon={Delete02Icon} strokeWidth={1.8} aria-hidden="true" />
            Delete
          </Button>
        </div>
      </div>
    </Card>
  )
}

/**
 * My resumes — the candidate's resumes with what the resume service knows
 * about each: template, visibility, completion score, and the apply-with
 * default. Actions mirror the backend: preview, set-default, delete (soft;
 * the newest remaining resume becomes the default). Reached from the
 * navbar's "My resumes" link.
 */
export function ResumesPage() {
  const [query, setQuery] = React.useState('')
  const [location, setLocation] = React.useState('')
  const resumes = useResumes()
  const [previewId, setPreviewId] = React.useState<string | null>(null)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)

  const preview = resumes.find((item) => item.id === previewId)
  const deleting = resumes.find((item) => item.id === deletingId) ?? null

  return (
    <div className="min-h-dvh">
      <SiteNavbar query={query} location={location} onQueryChange={setQuery} onLocationChange={setLocation} />

      <main className="mx-auto w-full max-w-4xl px-4 pb-16 pt-8 md:px-6">
        <header>
          <h1 className="text-[22px] font-bold tracking-tight text-[var(--foreground)]">My resumes</h1>
          <p className="mt-1 text-sm leading-relaxed text-[var(--muted-foreground)]">
            {resumes.length > 0
              ? `${resumes.length} resume${resumes.length === 1 ? '' : 's'}. The default one goes out with your applications.`
              : 'The resume you apply with lives here.'}
          </p>
        </header>

        {resumes.length > 0 ? (
          <div className="mt-6 flex flex-col gap-4">
            {resumes.map((resume) => (
              <ResumeCard
                key={resume.id}
                resume={resume}
                onPreview={(item) => setPreviewId(item.id)}
                onDelete={(item) => setDeletingId(item.id)}
              />
            ))}
          </div>
        ) : (
          <Card variant="raised" className="mt-6 items-center gap-2 px-6 py-12 text-center">
            <HugeiconsIcon
              icon={File02Icon}
              strokeWidth={1.5}
              aria-hidden="true"
              className="size-8 text-[var(--muted-foreground)]"
            />
            <p className="text-sm font-medium text-[var(--foreground)]">No resumes yet</p>
            <p className="max-w-xs text-sm text-[var(--muted-foreground)]">
              Resumes are created with the application flow and managed here.
            </p>
          </Card>
        )}
      </main>

      {/* Preview — the same dialog the apply flow uses, fed from the list
          item's sections. */}
      <ResumePreviewDialog resume={preview ? toPreviewShape(preview) : undefined} onClose={() => setPreviewId(null)} />

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
