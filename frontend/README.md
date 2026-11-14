# Hirely — Job Portal System (frontend)

Hirely is the web client of the Job Portal System: a public landing page with
job search, a jobs workspace with filtering, sorting, and AI-search UI, and a
job details page with a local AI skills-gap analysis. Data is currently a
static placeholder set — the service layer behind it is the next integration
step.

## Stack

- **Vite + React 19 + TypeScript**
- **Tailwind CSS v4** (`@theme inline` tokens in [`src/index.css`](src/index.css))
- **shadcn** Base-UI components, styled as a neumorphic **"Graphite · deep · top-left"** theme (`@neumorphism-ui` registry)
- **@hugeicons/react** + `@hugeicons/core-free-icons` for icons
- **Pretendard Variable** via jsDelivr CDN (loaded in [`index.html`](index.html)); monospace fallback is Consolas

## Getting started

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # tsc -b && vite build
npm run lint      # eslint .
npm run preview   # serve the production build
```

The Spring Cloud gateway runs on port **5000** and already allows
`localhost:5173` in CORS; no data is fetched from it yet.

## Pages

Routing is client-side via `react-router-dom` (`src/App.tsx`):

| Route      | Page                                                                                    |
| ---------- | --------------------------------------------------------------------------------------- |
| `/`        | Landing — public entry: hero with job search, featured jobs, About Us carousel, footer   |
| `/jobs`    | Jobs workspace — the post-login destination: results, filters, AI hero                   |
| `/jobs/:id`| Job details — posting content, AI skills-gap analysis, overview/actions, tags, location  |
| `/jobs/:id/apply` | Apply flow — single column: job header card, left-to-right progress, four steps (resume → cover letter with AI draft → details → review with full letter), submit confirmation |
| `/applications` | My applications — one self-contained card per application in the job-card shape (company plate, title, meta row, status badge), so the progress and the facts are visible without a second click: status chips with live counts (backend `ApplicationStatus`), search over job title/company, newest/oldest ordering, and on each card the status timeline (Applied → Reviewing → Shortlisted → Interview → Offer; closed paths noted with the withdrawal reason), applied/salary-in-taka/available-from facts, a star toggle, and Withdraw (live statuses only) with an optional reason that flips the card to Withdrawn — mirroring `POST /api/applications/{id}/withdraw`. Cards are not clickable; the explicit "View job posting" link leads to the job, and a withdrawn card's reason opens in a dialog instead of cluttering the card. Reached from the navbar's "My applications" link |
| `/saved` | Saved jobs — the candidate's bookmarked listings as standard job cards (same card as the jobs workspace, whole card → job detail), with a trash control on each card that pulls the bookmark without touching the job (reversible via the bookmark toggle on the jobs page); count in the header, empty state with a "Browse jobs" link. Reached from the navbar's "Saved jobs" link |
| `/resumes` | My resumes — reference layout: header with a "+ New resume" primary action, an amber "Default resume" banner (names the resume that goes out when none is chosen), and a card grid closing with a dashed new-resume tile ("Pick a template to get started"). Each card: file plate, title, template badge (`ResumeTemplateType`), the backend's completion score as label + bar, updated date + visibility (`ResumeVisibility`) with icons, View (the apply flow's preview dialog) · Edit (title/template/visibility via `PUT /api/resumes/{id}`, `UpdateResumeRequest`) · Delete (confirm dialog stating the backend's soft-delete rule), a full-width "AI Career Feedback" button standing in for `POST /api/ai/resume/career-feedback` (`CareerFeedbackResponse`: profile strength, overall summary, shortlisting issues, prioritized improvements), and a "Default resume"/"Set as default" row (`POST /api/resumes/{id}/set-default`). Create mirrors `POST /api/resumes/create` (`ResumeRequest` — starts empty, completion 0). Reached from the navbar's "My resumes" link |
| `/profile` | Account page — one column of cards, top to bottom: identity (avatar with a LinkedIn-style change-photo option via its dialog, name, role; slightly deeper card shade as the anchor card), Personal details (view mode; "Edit profile" flips the rows to inline fields — no dialog; email locked), Security (role, status, change password collapsed behind its option, with a live rules checklist mirroring `ChangePasswordRequest`), Activity (two bare fact tiles side by side — icon + label above, value below: "Member Since" / "Last Login", "March 2, 2026" dates and "08:10 AM" 12-hour timestamps), Session (sign out + delete account behind a confirm dialog). Dev-only `?role=employer` previews the employer variant. My company page is intentionally deferred until its service is wired |

**Landing search hand-off.** The hero search, popular-search links, and footer
searches navigate to `/jobs?q=<title>&l=<location>`. `job-page.tsx` reads those
params into its query/location state once on mount, so a landing search lands
on pre-filtered results. On a details page the navbar search submits back to
`/jobs` with the same params (new `onSearch` prop on `SiteNavbar`).

**Card → details.** Job cards are fully clickable via a stretched link
(`features/user/jobs/components/job-card.tsx`); the save button keeps its own click
above the overlay. The landing's featured cards link to the same detail pages.

## Structure

```
src/
├─ features/
│  ├─ landing/            # public page: hero, featured jobs, about (carousel), footer, marketing navbar
│  ├─ user/               # candidate workspace (role-scoped feature trees)
│  │  ├─ jobs/            # jobs workspace + job details
│  │  │  ├─ apply/        # multi-step apply flow: page, horizontal stepper, job header card, four steps
│  │  │  ├─ components/   # ai-hero, ai-skill-match, results-toolbar, filters-panel,
│  │  │  │                # salary-range, job-card, results-empty, currency
│  │  │  ├─ data/         # types.ts, jobs.ts + resumes.ts (static data), filters.ts
│  │  │  ├─ job-page.tsx  # results workspace: state owner, filterJobs memo
│  │  │  └─ job-detail-page.tsx
│  │  ├─ applications/    # "My applications": data.ts (DTO mirror) + page
│  │  ├─ saved/           # saved jobs: data.ts (shared bookmark store) + page
│  │  ├─ resumes/         # my resumes: data.ts (ResumeResponse mirror + store) + page
│  │  └─ profile/         # account cards: identity, details, security, activity, session
│  ├─ admin/              # reserved for the admin workspace (empty)
│  ├─ employer/           # reserved for the employer workspace (empty)
│  └─ superAdmin/         # reserved for the super-admin workspace (empty)
├─ components/
│  ├─ layout/             # site-navbar (app bar), marketing-navbar (landing) — both full-bleed
│  ├─ theme-toggle.tsx    # pen-replica light/dark switch ([zoom:0.25] in navbars)
│  └─ ui/                 # shadcn primitives (button, card, badge, input, select,
│                         # textarea, carousel, separator, …)
└─ index.css              # theme tokens (:root / .dark), @theme inline, base layer
```

## Theme notes

- The neumorphic tokens live in `src/index.css` as `:root` / `.dark` blocks —
  surface colors, shadows (light from top-left), radii (14px surfaces,
  8px controls), and a 180ms interaction duration (theme switch: 400ms).
- Deliberate overrides of the pasted theme (commented in `index.css`):
  in light mode the card surface sits clearly **below** the page tone
  (`#AEB6C2` cards on `#e6e8eb` page), which came with re-tuned muted text
  (`#3f4750`) and hover tone (`#b8c0cc`) for contrast.
- Fixed brand visuals are allowed to ignore tokens: the landing hero uses the
  3D-workspace illustration with fixed ink, and the jobs-page AI band uses a
  navy gradient (`#2e3d72 → #121a38`). Everything around them adapts via tokens.
- Light/dark toggles per theme; the choice is persisted under the
  `job-portal-theme` localStorage key and applied pre-paint by a script in
  `index.html` (no flash of the wrong mode).
- Dev/testing URL parameters: `?theme=light|dark` (any page) forces the theme
  for screenshots; the apply flow additionally accepts `?step=N` (jump to a
  step), `?pick=<resumeId>` (preselect a resume), and `?letter=1` (pre-fill a
  cover letter); the profile accepts `?role=employer` (preview the employer
  variant) — all five are `import.meta.env.DEV`-gated or test-only and
  commented at their read sites.
- Note for automated checks: Tailwind v4 gates `hover:` styles behind
  `@media (hover: hover)` — headless browsers that report no hover-capable
  pointer will not show hover styling even when it is correctly implemented.

## Placeholder seams

All data is client-side and static; these lines are the wiring points:

- `features/user/jobs/data/jobs.ts` — replace `JOBS` with the gateway job-service
  call. Detail-page fields mirror the backend's public `JobResponse` DTO
  (description/responsibilities/requirements/benefits, flattened location,
  salary period, application deadline, vacancies); `views` stands in for
  `viewCount` and tag names for the DTO's `tagIds` until the taxonomy lookup.
- `features/user/jobs/data/resumes.ts` — demo resumes for the AI skills-gap match
  and the apply flow's resume picker (with a Preview dialog). The cards show
  the backend's `ResumeResponse` fields `template` (`ResumeTemplateType`) and
  `isDefault` — the default resume is preselected when the flow opens. The
  preview fields (headline, summary, experience) stand in for the parsed
  resume document; replace everything with the resume service (`ResumeResponse`
  DTOs). The match itself (skill overlap score, matched/missing chips) runs
  locally in `ai-skill-match.tsx` until the analysis endpoint exists.
- `features/user/applications/data.ts` — the "My applications" list stands in for
  the application service: wire `GET /api/applications/my-applications` (the
  gateway's composition of the application, job, and company services).
  Rows mirror `ApplicationResponse`'s candidate-relevant fields —
  `job` (`JobSummaryResponse`), `company` (`CompanySummaryResponse`),
  `expectedSalary`, `availableFrom`,
  `status` (`ApplicationStatus`: Pending → Withdrawn), `isStarred`,
  `appliedAt`, `updatedAt`, and `withdrawnReason` (from
  `WithdrawalResponse`). The page's withdraw is the seam for `POST /api/
  applications/{id}/withdraw` (`WithdrawApplicationRequest`): it flips the
  card's status to `WITHDRAWN` and records the reason — the backend keeps
  the record. The attached resume, cover letter, notes, and screening are
  omitted from the card list until a dedicated view asks for them.
- `features/user/resumes/data.ts` — the "My resumes" list mirrors the resume
  service's `ResumeResponse` (`title`, `template` from
  `ResumeTemplateType`, `visibility` from `ResumeVisibility`, `isDefault`,
  `personalInfo.headline`, `summary`, the 0–100 `completionScore`,
  `createdAt`/`updatedAt`, and stand-in work/skill sections). Store actions
  are the seams for `POST /api/resumes/create` (`createResume`),
  `PUT /api/resumes/{id}` (title/template/visibility via
  `UpdateResumeRequest`, `updateResume`),
  `POST /api/resumes/{id}/set-default`, and `DELETE /api/resumes/{id}`
  (soft delete; newest remaining becomes default — mirrored locally).
  `careerFeedback` stands in for the AI service's
  `POST /api/ai/resume/career-feedback` (`CareerFeedbackResponse` shape).
- `features/user/profile/data.ts` — the account is a placeholder mirroring `UserResponse`
  (first/middle/last name, email, phone, role, status, profilePictureUrl,
  createdAt/lastLoginAt). Wire `GET /api/users/{id}` (own id only — the
  endpoint rejects other ids without an admin role) and `PUT /api/users/{id}`
  for Personal info (`UpdateUserRequest` fields only — email is not
  editable); `updateUserProfile` is the seam the identity card's photo
  dialog and the inline details edit call. Seams ready for
  `PUT /api/auth/me/password` (`ChangePasswordRequest`),
  `POST /api/auth/logout`, `DELETE /api/users/{id}` (delete account), and
  `GET`/`DELETE /api/preferences/saved-jobs` (`SavedJobResponse` — the
  backend row is `{ id, candidateId, jobId, companyId, notes, savedAt }`;
  the linked pages resolve `jobSlug`/`jobTitle`/`companyName` from
  job-service/company-service by `jobId`/`companyId`, the composition the
  gateway owns). The saved-jobs bookmark list lives in
  `features/user/saved/data.ts` (shared store behind `useSavedJobIds` /
  `toggleSavedJob` / `removeSavedJob`, seeded with two demo bookmarks) —
  swap the module store for that endpoint when it lands.
  The navbar account icon routes to `/profile`.
  `/profile?role=employer` (dev only) previews the employer variant (role
  badge + Security row). The My applications / My resumes / My company
  destinations were removed from the profile until their pages are built —
  My applications and My resumes now exist at `/applications` and
  `/resumes` (navbar links); the My company page is still deferred, and
  the profile card that linked there comes back with it.
- `features/user/jobs/job-page.tsx` — filtering/sorting already run through one
  `filterJobs` memo; swap its source for fetched data when available.
- "Search With AI" puts the prompt into the same text query — wire it to the
  gateway `/ai` service when it exists.
- **Apply now** routes to `/jobs/:id/apply` — the multi-step flow collects
  a resume (with a preview dialog), an optional cover letter (with a local
  "Write with AI" draft generator plus Copy/Clear actions), expected salary
  (free-form text in the "75,000" format the copy promises), and
  availability, mirroring the application-service `ApplicationRequest` DTO.
  `submitApplication` and `generateCoverLetter` in
  `features/user/jobs/apply/data.ts` are the seams: swap the stubs for the
  gateway `POST /api/applications/create` and `/ai` calls (job slug →
  numeric `jobId` mapping noted there). Card and featured-card actions
  still go to `/jobs/:id`.
- "Featured jobs" on the landing is the newest three posts — stands in for a
  featured flag from the service.
