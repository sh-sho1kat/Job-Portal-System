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

**Landing search hand-off.** The hero search, popular-search links, and footer
searches navigate to `/jobs?q=<title>&l=<location>`. `job-page.tsx` reads those
params into its query/location state once on mount, so a landing search lands
on pre-filtered results. On a details page the navbar search submits back to
`/jobs` with the same params (new `onSearch` prop on `SiteNavbar`).

**Card → details.** Job cards are fully clickable via a stretched link
(`features/jobs/components/job-card.tsx`); the save button keeps its own click
above the overlay. The landing's featured cards link to the same detail pages.

## Structure

```
src/
├─ features/
│  ├─ landing/            # public page: hero, featured jobs, about (carousel), footer, marketing navbar
│  └─ jobs/               # jobs workspace + job details
│     ├─ components/      # ai-hero, ai-skill-match, results-toolbar, filters-panel,
│     │                   # salary-range, job-card, results-empty
│     ├─ data/            # types.ts, jobs.ts + resumes.ts (static data), filters.ts
│     ├─ job-page.tsx     # results workspace: state owner, filterJobs memo
│     └─ job-detail-page.tsx
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
- Note for automated checks: Tailwind v4 gates `hover:` styles behind
  `@media (hover: hover)` — headless browsers that report no hover-capable
  pointer will not show hover styling even when it is correctly implemented.

## Placeholder seams

All data is client-side and static; these lines are the wiring points:

- `features/jobs/data/jobs.ts` — replace `JOBS` with the gateway job-service
  call. Detail-page fields mirror the backend's public `JobResponse` DTO
  (description/responsibilities/requirements/benefits, flattened location,
  salary period, application deadline, vacancies); `views` stands in for
  `viewCount` and tag names for the DTO's `tagIds` until the taxonomy lookup.
- `features/jobs/data/resumes.ts` — demo resumes for the AI skills-gap match;
  replace with the resume service (`ResumeResponse` DTOs). The match itself
  (skill overlap score, matched/missing chips) runs locally in
  `ai-skill-match.tsx` until the analysis endpoint exists.
- `features/jobs/job-page.tsx` — filtering/sorting already run through one
  `filterJobs` memo; swap its source for fetched data when available.
- "Search With AI" puts the prompt into the same text query — wire it to the
  gateway `/ai` service when it exists.
- **Apply now** buttons do not submit anywhere yet (the application service
  isn't built); everything else routes somewhere real: sign-in/CTA to `/jobs`,
  card and featured-card actions to `/jobs/:id`.
- "Featured jobs" on the landing is the newest three posts — stands in for a
  featured flag from the service.
