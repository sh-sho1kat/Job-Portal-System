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
        <h2 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">Application details</h2>
        <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">
          Both fields are optional and will be shared with the employer
          alongside your resume.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="expected-salary">Expected salary</FieldLabel>
          <InputGroup>
            <InputGroupAddon>
              <span aria-hidden="true">৳</span>
              <span className="sr-only">Bangladeshi taka per year</span>
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
          <FieldDescription>Annual gross salary, before tax.</FieldDescription>
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
          <FieldDescription>Your earliest available start date.</FieldDescription>
        </Field>
      </div>
    </div>
  )
}
