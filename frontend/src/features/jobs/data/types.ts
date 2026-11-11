export type EmploymentType =
  | 'Full-time'
  | 'Part-time'
  | 'Contract'
  | 'Internship'
  | 'Freelance'

export type WorkMode = 'Remote' | 'Hybrid' | 'On-site'

export type ExperienceLevel =
  | 'Entry Level'
  | 'Junior'
  | 'Mid Level'
  | 'Senior'
  | 'Lead'
  | 'Executive'

export type CompanySize = 'Small' | 'Medium' | 'Large'

/** Mirrors the backend's SalaryPeriod enum. */
export type SalaryPeriod = 'Hourly' | 'Monthly' | 'Yearly'

export type FilterGroupId = 'jobType' | 'workMode' | 'level'

export interface Job {
  id: string
  title: string
  company: string
  verified: boolean
  industry: string
  companySize: CompanySize
  tagline?: string
  location: string
  employmentType: EmploymentType
  workMode: WorkMode
  level: ExperienceLevel
  /** Category badge on the card, e.g. "Healthcare". */
  category: string
  skills: string[]
  /** Absolute dollars — used by the salary range filter. */
  salaryMin: number
  salaryMax: number
  /** Pre-formatted display string, e.g. "$60,000 – $75,000". */
  salaryLabel: string
  postedLabel: string
  /** Days since posting — drives the "Newest first" sort. */
  postedDaysAgo: number
  applicants: number
  openings: number

  // --- Detail-page content, mirroring the backend's public JobResponse DTO ---
  /** Full posting text. */
  description?: string
  responsibilities?: string[]
  requirements?: string[]
  benefits?: string[]
  /** Structured location, flattened like the DTO's JobLocation. */
  address?: string
  city?: string
  state?: string
  country?: string
  zipCode?: string
  salaryPeriod?: SalaryPeriod
  /** ISO date (yyyy-mm-dd); formatted at render. */
  applicationDeadline?: string
}

export interface FilterOption {
  /** A literal value of the Job field the group filters on. */
  value: string
  label: string
}

export interface FilterGroup {
  id: FilterGroupId
  label: string
  options: FilterOption[]
}

/** groupId → selected option values. */
export type ActiveFilters = Partial<Record<FilterGroupId, string[]>>

/** Salary range in $k, [min, max]. */
export type SalaryRangeValue = [number, number]

export type SortId = 'newest' | 'salary-high' | 'salary-low' | 'most-applied'
