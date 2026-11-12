import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { DatePicker } from '@/components/ui/date-picker'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import type { Job } from '../../data/types'
import type { ApplicationDraft } from '../data'

interface DetailsStepProps {
  job: Job
  draft: ApplicationDraft
  onPatch: (patch: Partial<ApplicationDraft>) => void
}

function beforeToday(date: Date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

/** Step 3 — expected salary and availability. Both optional, both validated. */
export function DetailsStep({ job, draft, onPatch }: DetailsStepProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">The practical details</h2>
        <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
          Both fields are optional. Recruiters see them next to your resume —
          leave out anything you would rather discuss in the call.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="expected-salary">Expected salary</FieldLabel>
          <InputGroup>
            <InputGroupAddon>
              <span aria-hidden="true">$</span>
              <span className="sr-only">US dollars per year</span>
            </InputGroupAddon>
            <InputGroupInput
              id="expected-salary"
              // Text + decimal keypad rather than type="number": the browser
              // strips commas from number inputs, and "75,000" is the format
              // this field's placeholder and error message both promise.
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder={`${Math.round(job.salaryMin / 1000).toLocaleString('en-US')},000`}
              value={draft.expectedSalary}
              onChange={(event) => onPatch({ expectedSalary: event.target.value })}
            />
          </InputGroup>
          <FieldDescription>Yearly, before tax. A range beats a single number.</FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="available-from">Available from</FieldLabel>
          <DatePicker
            label="Available from"
            value={draft.availableFrom}
            onValueChange={(value) => onPatch({ availableFrom: value })}
            disabledDates={beforeToday}
            startMonth={new Date()}
          />
          <FieldDescription>When you could start. Today or later.</FieldDescription>
        </Field>
      </div>
    </div>
  )
}
