# Hirely — Job Portal System (frontend)

Hirely is the web client of the Job Portal System: a public landing page with
job search, and a jobs workspace with filtering, sorting, and AI-search UI.
Data is currently a static placeholder set — the service layer behind it is
the next integration step.

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

| Route  | Page                                                        |
| ------ | ----------------------------------------------------------- |
| `/`    | Landing — public entry: hero with job search, featured jobs, footer |
| `/jobs`| Jobs workspace — the post-login destination: results, filters, AI hero |

**Landing search hand-off.** The hero search, popular-search links, and footer
searches navigate to `/jobs?q=<title>&l=<location>`. `job-page.tsx` reads those
params into its query/location state once on mount, so a landing search lands
on pre-filtered results.

## Structure

```
src/
├─ features/
│  ├─ landing/            # public page: hero, featured jobs, footer, marketing navbar
│  └─ jobs/               # jobs workspace
│     ├─ components/      # ai-hero, results-toolbar, filters-panel, salary-range,
│     │                   # job-card, results-empty
│     └─ data/            # types.ts, jobs.ts (static data), filters.ts
├─ components/
│  ├─ layout/             # site-navbar (app bar), marketing-navbar (landing)
│  ├─ theme-toggle.tsx    # pen-replica light/dark switch ([zoom:0.35] in navbars)
│  └─ ui/                 # shadcn primitives (button, card, badge, input, …)
└─ index.css              # theme tokens (:root / .dark), @theme inline, base layer
```

## Theme notes

- The neumorphic tokens live in `src/index.css` as `:root` / `.dark` blocks —
  surface colors, shadows (light from top-left), radii (14px surfaces,
  8px controls), and a 180ms interaction duration.
- Fixed brand visuals are allowed to ignore tokens: the landing hero uses the
  3D-workspace illustration with fixed ink, and the jobs-page AI band uses a
  navy gradient (`#2e3d72 → #121a38`). Everything around them adapts via tokens.
- Light/dark toggles per theme; the choice is persisted under the
  `job-portal-theme` localStorage key and applied pre-paint by a script in
  `index.html` (no flash of the wrong mode).

## Placeholder seams

All data is client-side and static; these lines are the wiring points:

- `features/jobs/data/jobs.ts` — replace `JOBS` with the gateway job-service call.
- `features/jobs/job-page.tsx` — filtering/sorting already run through one
  `filterJobs` memo; swap its source for fetched data when available.
- "Search With AI" puts the prompt into the same text query — wire it to the
  gateway `/ai` service when it exists.
- **Sign in / Get Started / Apply now / View details** all route to `/jobs`
  until the auth flow and job-detail pages exist.
- "Featured jobs" on the landing is the newest three posts — stands in for a
  featured flag from the service.
