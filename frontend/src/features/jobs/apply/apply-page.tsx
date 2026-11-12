import * as React from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ArrowRight01Icon,
  ChevronLeftIcon,
  SentIcon,
  TickIcon,
} from '@hugeicons/core-free-icons'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SiteNavbar } from '@/components/layout/site-navbar'
import { cn } from '@/lib/utils'
import { JOBS } from '../data/jobs'
import { ApplyJobCard } from './apply-job-card'
import { ApplyStepper, type ApplyStep } from './stepper'
import { CoverLetterStep } from './steps/cover-letter-step'
import { DetailsStep } from './steps/details-step'
import { ResumeStep } from './steps/resume-step'
import { ReviewStep } from './steps/review-step'
import {
  EMPTY_DRAFT,
  defaultResume,
  isAvailableFromValid,
  parseExpectedSalary,
  submitApplication,
  type ApplicationDraft,
} from './data'

const STEPS: ApplyStep[] = [
  { id: 'resume', label: 'Resume' },
  { id: 'cover-letter', label: 'Cover letter' },
  { id: 'details', label: 'Details' },
  { id: 'review', label: 'Review' },
]

/**
 * One gate per step, checked when the candidate tries to move forward.
 * Returns the message to show, or null when the step is complete.
 */
function stepError(index: number, draft: ApplicationDraft): string | null {
  if (index === 0 && !draft.resumeId) {
    return 'Please select a resume to continue.'
  }
  if (index === 1 && draft.coverLetter.length > 5000) {
    return 'The cover letter exceeds the 5,000 character limit.'
  }
  if (index === 2) {
    if (parseExpectedSalary(draft.expectedSalary) === 'invalid') {
      return 'Enter a valid amount in dollars, for example 75,000.'
    }
    if (!isAvailableFromValid(draft.availableFrom)) {
      return 'The available-from date cannot be in the past.'
    }
  }
  return null
}

function ApplySuccess({ jobId }: { jobId: string }) {
  const navigate = useNavigate()
  return (
    <Card variant="raised" className="items-center p-8 text-center md:p-12">
      <span
        aria-hidden="true"
        className="flex size-14 items-center justify-center rounded-full [background-image:var(--neu-fill-primary)] shadow-[var(--neu-shadow-primary)]"
      >
        <HugeiconsIcon icon={TickIcon} strokeWidth={2.5} className="size-6 text-[var(--primary-foreground)]" />
      </span>
      <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)] md:text-3xl">
        Application sent
      </h1>
      <p className="max-w-md text-sm leading-relaxed text-[var(--muted-foreground)] md:text-base">
        Your application has been submitted to the company. They will review
        your submission and contact you regarding the next steps.
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <Button
          variant="primary"
          onClick={() => navigate(`/jobs/${jobId}`)}
          className="[background-image:var(--neu-fill-primary)] text-[var(--primary-foreground)]"
        >
          Back to job posting
        </Button>
        {/* Soft well surface so the secondary action doesn't blend into
            the card the way a ghost button does. */}
        <Button variant="soft" onClick={() => navigate('/jobs')}>
          Browse more jobs
        </Button>
      </div>
    </Card>
  )
}

/** Multi-step apply flow for one posting — resume, cover letter, details, review. */
export function ApplyPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [query, setQuery] = React.useState('')
  const [location, setLocation] = React.useState('')
  // Dev-only deep link (?step=N) so builds/screenshots can open a step
  // directly; production always starts at the first step.
  const requestedStep = import.meta.env.DEV
    ? Number(new URLSearchParams(window.location.search).get('step')) - 1
    : -1
  const [step, setStep] = React.useState(() =>
    Number.isInteger(requestedStep) && requestedStep >= 0 && requestedStep < STEPS.length ? requestedStep : 0,
  )
  const [reached, setReached] = React.useState(() => step)
  const [draft, setDraft] = React.useState<ApplicationDraft>(() => {
    // Preselect the candidate's default resume (backend's isDefault flag) —
    // an explicit ?pick overrides it in dev.
    const preselected = defaultResume()?.id ?? null
    // Dev-only ?pick=<resumeId> and ?letter=1 pair with ?step= for
    // screenshots/testing of a filled-in draft.
    if (!import.meta.env.DEV) return { ...EMPTY_DRAFT, resumeId: preselected }
    const params = new URLSearchParams(window.location.search)
    const pick = params.get('pick')
    const withLetter = params.get('letter') != null
    return {
      ...EMPTY_DRAFT,
      resumeId: pick ?? preselected,
      coverLetter: withLetter
        ? 'Dear Hiring Team,\n\nI would like to apply for the role described in this posting. Over the past four years I have built customer-facing web features in React and TypeScript, and I care about the small details — load time, keyboard access, and copy that respects the reader.\n\nI would welcome the chance to talk about how I can contribute to the team.\n\nSincerely,'
        : '',
    }
  })
  // The crossfade plays only when the candidate moves between steps — not
  // on the initial page load.
  const [animateStep, setAnimateStep] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [submitting, setSubmitting] = React.useState(false)
  const [submitted, setSubmitted] = React.useState(false)

  const job = JOBS.find((candidate) => candidate.id === id)
  const isLastStep = step === STEPS.length - 1

  const searchJobs = React.useCallback(
    (nextQuery: string, nextLocation: string) => {
      const params = new URLSearchParams()
      if (nextQuery.trim()) params.set('q', nextQuery.trim())
      if (nextLocation.trim()) params.set('l', nextLocation.trim())
      navigate(params.size > 0 ? `/jobs?${params.toString()}` : '/jobs')
    },
    [navigate],
  )

  const patchDraft = React.useCallback((patch: Partial<ApplicationDraft>) => {
    setDraft((current) => ({ ...current, ...patch }))
    setError(null)
  }, [])

  const goToStep = React.useCallback((index: number) => {
    setStep(index)
    setReached((current) => Math.max(current, index))
    setError(null)
    setAnimateStep(true)
    window.scrollTo(0, 0)
  }, [])

  const goNext = React.useCallback(() => {
    const message = stepError(step, draft)
    if (message) {
      setError(message)
      return
    }
    if (isLastStep) {
      setSubmitting(true)
      const salary = parseExpectedSalary(draft.expectedSalary)
      submitApplication({
        jobId: job?.id ?? '',
        companyId: job?.company ?? '',
        resumeId: draft.resumeId ?? '',
        coverLetter: draft.coverLetter.trim(),
        expectedSalary: typeof salary === 'number' ? salary : null,
        availableFrom: draft.availableFrom
          ? `${draft.availableFrom.getFullYear()}-${String(draft.availableFrom.getMonth() + 1).padStart(2, '0')}-${String(draft.availableFrom.getDate()).padStart(2, '0')}`
          : null,
      })
        .then(() => {
          setSubmitted(true)
          window.scrollTo(0, 0)
        })
        .catch(() => {
          // The gateway call can fail (offline, 5xx) — the draft stays intact
          // so the candidate only has to press submit again.
          setError('Sending failed. Your application is still here — try again.')
        })
        .finally(() => setSubmitting(false))
      return
    }
    goToStep(step + 1)
  }, [draft, goToStep, isLastStep, job, step])

  if (!job) {
    return (
      <div className="min-h-dvh">
        <SiteNavbar query={query} location={location} onQueryChange={setQuery} onLocationChange={setLocation} onSearch={searchJobs} />
        <main className="mx-auto w-full max-w-7xl px-4 pb-24 pt-20 text-center md:px-6">
          <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">Job not found</h1>
          <p className="mx-auto mt-2.5 max-w-md text-sm text-[var(--muted-foreground)] md:text-base">
            This posting may have been closed or removed, so there is nothing
            to apply to here.
          </p>
          <Link
            to="/jobs"
            className="mt-5 inline-block text-sm font-semibold text-[var(--neu-accent-ink)] underline underline-offset-4 transition-opacity duration-[var(--neu-duration)] hover:opacity-75"
          >
            Back to all jobs
          </Link>
        </main>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-dvh">
        <SiteNavbar query={query} location={location} onQueryChange={setQuery} onLocationChange={setLocation} onSearch={searchJobs} />
        <main className="mx-auto w-full max-w-2xl px-4 pb-24 pt-16 md:px-6">
          <ApplySuccess jobId={job.id} />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-dvh">
      <SiteNavbar query={query} location={location} onQueryChange={setQuery} onLocationChange={setLocation} onSearch={searchJobs} />

      <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-6 md:px-6">
        <Link
          to={`/jobs/${job.id}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--neu-accent-ink)] transition-opacity duration-[var(--neu-duration)] hover:opacity-75"
        >
          <HugeiconsIcon icon={ChevronLeftIcon} strokeWidth={2} aria-hidden="true" className="size-4" />
          Back to job posting
        </Link>

        {/* Top-down flow: the posting, then the left-to-right progress, then
            the step itself. One column, no competing rails. */}
        <div className="mt-4 flex flex-col gap-4">
          <ApplyJobCard job={job} />

          <Card variant="raised" className="p-4 md:px-5">
            <ApplyStepper steps={STEPS} current={step} reached={reached} onStepSelect={goToStep} />
          </Card>

          <Card variant="raised" className="min-w-0 p-5 md:p-6">
            <form
              onSubmit={(event) => {
                event.preventDefault()
                goNext()
              }}
              className="flex min-w-0 flex-col"
            >
              {/* Keyed on the step so the panel crossfades when the candidate
                  moves — motion that answers their action, nothing ambient. */}
              <div
                key={STEPS[step].id}
                className={cn(
                  animateStep && 'animate-in fade-in slide-in-from-bottom-1 duration-200 motion-reduce:animate-none',
                )}
              >
                {step === 0 && <ResumeStep job={job} draft={draft} onPatch={patchDraft} />}
                {step === 1 && <CoverLetterStep job={job} draft={draft} onPatch={patchDraft} />}
                {step === 2 && <DetailsStep job={job} draft={draft} onPatch={patchDraft} />}
                {step === 3 && <ReviewStep job={job} draft={draft} onEdit={goToStep} />}
              </div>

              <div aria-live="polite">
                {error && (
                  <p role="alert" className="mt-4 text-sm font-medium text-[var(--neu-error-text)]">
                    {error}
                  </p>
                )}
              </div>

              <div className="mt-5 flex items-center justify-between gap-3 border-t border-[color:var(--neu-edge)] pt-4">
                {step > 0 ? (
                  <Button variant="ghost" type="button" onClick={() => goToStep(step - 1)}>
                    <HugeiconsIcon icon={ChevronLeftIcon} strokeWidth={2} data-icon="inline-start" />
                    Back
                  </Button>
                ) : (
                  <span />
                )}
                {/* The one strong element on the page: the brand fill, same
                    treatment as the detail page's Apply now. */}
                <Button
                  type="submit"
                  disabled={submitting}
                  className="min-w-36 [background-image:var(--neu-fill-primary)] text-[var(--primary-foreground)]"
                >
                  {isLastStep ? (
                    <>
                      <HugeiconsIcon icon={SentIcon} strokeWidth={1.8} data-icon="inline-start" />
                      {submitting ? 'Sending…' : 'Submit application'}
                    </>
                  ) : (
                    <>
                      Continue
                      <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} data-icon="inline-end" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </main>
    </div>
  )
}
