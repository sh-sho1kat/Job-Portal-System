import * as React from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeftIcon, EyeIcon } from '@hugeicons/core-free-icons'
import { Link } from 'react-router'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { SiteNavbar } from '@/components/layout/site-navbar'
import { RESUMES } from '@/features/jobs/data/resumes'
import { ResumePreviewDialog } from '@/features/jobs/apply/steps/resume-step'
import type { Resume } from '@/features/jobs/data/resumes'

/** `ResumeTemplateType` humanized for display — same labels the apply flow uses. */
const TEMPLATE_LABEL: Record<Resume['template'], string> = {
  DEFAULT: 'Default layout',
  MODERN: 'Modern',
  CLASSIC: 'Classic',
  PROFESSIONAL: 'Professional',
}

/**
 * My resumes — the resumes a candidate can attach to an application,
 * standing in for the resume service (`ResumeResponse`: name, template,
 * isDefault). Preview opens the same dialog the apply flow uses; editing
 * and uploads arrive with that service.
 */
export function ResumesPage() {
  const [query, setQuery] = React.useState('')
  const [location, setLocation] = React.useState('')
  const [previewId, setPreviewId] = React.useState<string | null>(null)
  const preview = RESUMES.find((resume) => resume.id === previewId) ?? null

  return (
    <div className="min-h-dvh">
      <SiteNavbar query={query} location={location} onQueryChange={setQuery} onLocationChange={setLocation} />
      <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-8 md:px-6">
        <header>
          <Link
            to="/profile"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--muted-foreground)] transition-colors duration-[var(--neu-duration)] hover:text-[var(--foreground)]"
          >
            <HugeiconsIcon icon={ArrowLeftIcon} strokeWidth={2} aria-hidden="true" className="size-3.5" />
            Back to profile
          </Link>
          <h1 className="mt-3 text-[22px] font-bold tracking-tight text-[var(--foreground)]">My resumes</h1>
          <p className="mt-1 text-sm leading-relaxed text-[var(--muted-foreground)]">
            The resumes you can attach to an application.
          </p>
        </header>

        <Card variant="raised" className="mt-6 gap-0 p-5 md:p-6">
          <ul className="flex flex-col divide-y divide-[color:var(--neu-edge)]">
            {RESUMES.map((resume) => (
              <li key={resume.id} className="flex items-start gap-3 py-3.5 first:pt-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[var(--foreground)]">{resume.name}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-xs font-medium">
                      {TEMPLATE_LABEL[resume.template]}
                    </Badge>
                    {resume.isDefault && (
                      <Badge variant="primary" className="rounded-full px-2.5 py-0.5 text-xs font-semibold">
                        Default
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="soft"
                  size="sm"
                  type="button"
                  onClick={() => setPreviewId(resume.id)}
                  className="shrink-0"
                >
                  <HugeiconsIcon icon={EyeIcon} strokeWidth={2} data-icon="inline-start" />
                  Preview
                </Button>
              </li>
            ))}
          </ul>
          <Separator className="mt-4" />
          <p className="mt-3 text-[13px] text-[var(--muted-foreground)]">
            Resumes come from the resume service when it is wired; uploading new ones lands there too.
          </p>
        </Card>

        {preview && <ResumePreviewDialog resume={preview} onClose={() => setPreviewId(null)} />}
      </main>
    </div>
  )
}
