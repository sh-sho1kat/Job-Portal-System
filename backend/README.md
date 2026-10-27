# Job Portal System — Backend

AI-powered job portal built as a **multi-module Maven / microservices** backend.
This directory contains the parent POM and all backend modules.

## Tech Stack

| Layer | Technology |
|---|---|
| Language | Java 25 |
| Framework | Spring Boot 4.1.1, Spring Cloud 2025.1.0 |
| Security | Spring Security (stateless JWT via `jjwt` 0.13.0, BCrypt) |
| Persistence | Spring Data JPA / Hibernate 7.4, PostgreSQL |
| Testing | JUnit 5, Mockito, H2 in-memory |
| Build | Maven multi-module, Jib (containerization) |
| Misc | Lombok |

## Modules

```
backend/
├── pom.xml              # parent POM (dependency & plugin management)
├── common-lib/          # job-portal-common — shared DTOs, enums, exceptions
│   └── postman/         # Postman collection for the API
├── cloud/               # job-portal-cloud — Spring Cloud infra
│                       #   (service discovery, config server, API gateway) — scaffolded
└── services/            # job-portal-services — business microservices
    ├── user-service/    # authentication & user management (port 5001)
    ├── company-service/ # company profiles & admin verification (port 5002)
    ├── job-service/     # job postings & admin review (port 5003)
    └── resume-service/  # candidate resume builder (port 5004)
```

| Module | Artifact | Description |
|---|---|---|
| `common-lib` | `job-portal-common` | Shared library: request/response DTOs, `UserRole`/`UserStatus`/`Company*` enums, `ApiException` base |
| `cloud` | `job-portal-cloud` | Spring Cloud infrastructure services (discovery, config server, API gateway) |
| `services/user-service` | `user-service` | User authentication (JWT access + refresh tokens) and user/role management |
| `services/company-service` | `company-service` | Company profiles, offices, and admin verification workflow |
| `services/job-service` | `job-service` | Job postings (search, employer CRUD, admin review) |
| `services/resume-service` | `resume-service` | Candidate resumes (sections, skills, languages, completion score) |

## Requirements

- **JDK 25**
- **Maven 3.8+**
- **PostgreSQL** (user-service database: `user_db`; company-service database: `company_db`; job-service database: `job_db`; resume-service database: `resume_db`)

## Build & Test

From `backend/`:

```bash
# compile + run all tests
mvn -B test

# build all modules
mvn -B package

# build a single service
mvn -B -pl services/user-service -am package
```

Tests run against an in-memory H2 database (`user_service_test`), so no external
services are needed for the build.

## Running the User Service

`user-service` listens on **port 5001** (`application.yaml`).

```bash
cd services/user-service
mvn spring-boot:run
```

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `DB_USERNAME` | yes | PostgreSQL user |
| `DB_PASSWORD` | yes | PostgreSQL password |
| `JWT_SECRET` | yes | Base64-encoded secret, at least 32 bytes (`openssl rand -base64 32`) |
| `DDL_AUTO` | no | Hibernate DDL mode (default `update`; use `validate`/`none` for production) |
| `SHOW_SQL` | no | Log SQL statements (default `true`) |
| `AUTH_RATE_LIMIT_MAX` | no | Max auth requests per client (default `30`) |
| `AUTH_RATE_LIMIT_WINDOW` | no | Rate-limit window in seconds (default `60`) |
| `REFRESH_TOKEN_CLEANUP_CRON` | no | Cron for expired refresh-token cleanup (default `0 0 3 * * *` — daily 03:00) |

### Security configuration

- **Stateless sessions**, CSRF disabled — pure token-based auth.
- **JWT access tokens** (15 min) + persisted **refresh tokens** (7 days), with a
  scheduled cleanup job for expired refresh tokens.
- **Rate limiting** on all `/api/auth/**` endpoints, applied *before* the JWT filter.
- **Method security** — role checks via `@PreAuthorize` (`ADMIN`, `SUPER_ADMIN`).
- Passwords hashed with **BCrypt**.

## API — user-service

### Auth (`/api/auth`)

| Method | Path | Access |
|---|---|---|
| `POST` | `/api/auth/register` | public, rate-limited |
| `POST` | `/api/auth/login` | public, rate-limited |
| `POST` | `/api/auth/refresh` | public, rate-limited |
| `POST` | `/api/auth/logout` | public, rate-limited |
| `PUT` | `/api/auth/me/password` | authenticated (current user) |

### Users (`/api/users`)

| Method | Path | Access |
|---|---|---|
| `GET` | `/api/users/{id}` | self or `ADMIN`/`SUPER_ADMIN` |
| `GET` | `/api/users` | `ADMIN`/`SUPER_ADMIN` |
| `PUT` | `/api/users/{id}` | self or `ADMIN`/`SUPER_ADMIN` |
| `PATCH` | `/api/users/{id}/status` | `ADMIN`/`SUPER_ADMIN` |
| `DELETE` | `/api/users/{id}` | `ADMIN`/`SUPER_ADMIN` |

`GET /` on the service root serves as a lightweight welcome/health endpoint.

A ready-made Postman collection is available at
`common-lib/postman/job-portal-system.postman_collection.json`.

## Running the Company Service

`company-service` listens on **port 5002** (`application.yaml`).

```bash
cd services/company-service
mvn spring-boot:run
```

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `DB_USERNAME` | yes | PostgreSQL user |
| `DB_PASSWORD` | yes | PostgreSQL password |
| `DDL_AUTO` | no | Hibernate DDL mode (default `update`; use `validate`/`none` for production) |
| `SHOW_SQL` | no | Log SQL statements (default `true`) |

### Authentication note

JWT validation is not wired into `company-service` yet (pending the API gateway).
Until then, owner/employer endpoints read a temporary `X-User-Id` header
holding the caller's user-service id; admin endpoints are unsecured for now
(`com.sho1kat.controller.RequesterId` documents this stand-in). Public
catalogue endpoints need no header.

## API — company-service

### Companies (`/api/companies`)

| Method | Path | Access |
|---|---|---|
| `GET` | `/api/companies` | public — filters `name`, `industryType`, `location`, `companySize`, `companyType`; `page`, `size` (max 100) |
| `GET` | `/api/companies/{id}` | public |
| `GET` | `/api/companies/slug/{slug}` | public |
| `POST` | `/api/companies/create` | employer via `X-User-Id` (one company per owner, starts `PENDING_VERIFICATION`) |
| `GET` | `/api/companies/my-company` | employer via `X-User-Id` |
| `PUT` | `/api/companies/{id}` | company owner via `X-User-Id` (renaming regenerates the slug) |
| `DELETE` | `/api/companies/{id}` | company owner via `X-User-Id` (soft delete) |

### Locations (`/api/companies/{companyId}/locations`)

| Method | Path | Access |
|---|---|---|
| `GET` | `/api/companies/{companyId}/locations` | public |
| `POST` | `/api/companies/{companyId}/locations` | company owner via `X-User-Id` |
| `PUT` | `/api/companies/{companyId}/locations/{locationId}` | company owner via `X-User-Id` |
| `DELETE` | `/api/companies/{companyId}/locations/{locationId}` | company owner via `X-User-Id` |

### Admin verification (`/api/admin/companies`)

| Method | Path | Availability |
|---|---|---|
| `GET` | `/api/admin/companies` | paged list, filters `status`, `name`; `page`, `size` |
| `GET` | `/api/admin/companies/{companyId}` | detail view |
| `POST` | `/api/admin/companies/{companyId}/approve` | `PENDING_VERIFICATION → ACTIVE` |
| `POST` | `/api/admin/companies/{companyId}/reject` | `PENDING_VERIFICATION → REJECTED` |
| `POST` | `/api/admin/companies/{companyId}/suspend` | `ACTIVE → SUSPENDED` |
| `POST` | `/api/admin/companies/{companyId}/reactivate` | `SUSPENDED → ACTIVE` |

### Request DTOs

Statuses: `PENDING_VERIFICATION`, `ACTIVE`, `SUSPENDED`, `REJECTED`.
Sizes: `MICRO`–`ENTERPRISE`. Types: `STARTUP`, `PRIVATE`, `GOVERNMENT`, ... .
Industries: `TECHNOLOGY`, `FINANCE_BANKING`, ... (see `com.sho1kat.enums`).

- **Create/Update company**: `name` (required, ≤150), `tagline` (≤255),
  `description` (≤5000), `logoUrl`/`coverImageUrl`/`website` (http(s) URLs ≤500),
  `email` (valid email, ≤255, optional), `phone` (≤20, optional),
  `foundingYear` (1800–2100), `companySize`/`companyType`/`industryType`
  (required), `registrationNumber` (≤100, unique),
  `socialLinks` (≤10, unique platforms: `LINKEDIN`, `TWITTER`, `FACEBOOK`, `GITHUB`,
  `INSTAGRAM`, `YOUTUBE`, `WEBSITE` — update is a full replace).
- **Location**: `label` (≤100), `addressLine` (≤255), `city`/`country`
  (required, ≤100), `state` (≤100), `postalCode` (≤20), `headquarters`
  (setting it demotes the previous one).

## Running the Job Service

`job-service` listens on **port 5003** (`application.yaml`).

```bash
cd services/job-service
mvn spring-boot:run
```

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `DB_USERNAME` | yes | PostgreSQL user |
| `DB_PASSWORD` | yes | PostgreSQL password |
| `DDL_AUTO` | no | Hibernate DDL mode (default `update`; use `validate`/`none` for production) |
| `SHOW_SQL` | no | Log SQL statements (default `true`) |

### Authentication note

Same stand-in as company-service: JWT validation is not wired into
`job-service` yet. Employer endpoints read a temporary `X-User-Id` header
holding the caller's user-service id; admin endpoints are unsecured for now
(`com.sho1kat.controller.RequesterId` documents this). Public search
endpoints need no header. `companyId` is also unverified for now — once the
API gateway forwards identity, job-service will confirm the caller actually
owns the company before accepting postings.

## API — job-service

### Jobs (`/api/jobs`)

| Method | Path | Access |
|---|---|---|
| `GET` | `/api/jobs` | public — filters `keyword` (title/description), `companyId`, `employmentType`, `experienceLevel`, `workMode`, `location`, `salaryPeriod`, `categoryId`, `skillIds`, `tagIds`; `page`, `size` (max 100) |
| `GET` | `/api/jobs/{id}` | public (active, deadline/expiry not passed) |
| `GET` | `/api/jobs/company/{companyId}` | public — active, non-expired jobs of one company |
| `POST` | `/api/jobs/create` | employer via `X-User-Id` (starts `DRAFT`) |
| `GET` | `/api/jobs/my-jobs` | employer via `X-User-Id` |
| `PUT` | `/api/jobs/{id}` | job poster via `X-User-Id` (renaming regenerates the slug; editing a rejected job returns it to `DRAFT`) |
| `POST` | `/api/jobs/{id}/publish` | job poster via `X-User-Id` (`DRAFT → ACTIVE`) |
| `POST` | `/api/jobs/{id}/close` | job poster via `X-User-Id` (`ACTIVE → CLOSED`) |
| `DELETE` | `/api/jobs/{id}` | job poster via `X-User-Id` (soft delete) |

### Admin (`/api/admin/jobs`)

| Method | Path | Availability |
|---|---|---|
| `GET` | `/api/admin/jobs` | paged list, filters `status`, `companyId`, `title`; `page`, `size` |
| `GET` | `/api/admin/jobs/{jobId}` | detail view |
| `POST` | `/api/admin/jobs/{jobId}/suspend` | `ACTIVE → SUSPENDED` |
| `POST` | `/api/admin/jobs/{jobId}/reactivate` | `SUSPENDED → ACTIVE` |

### Job categories (`/api/job-categories`)

| Method | Path | Access |
|---|---|---|
| `GET` | `/api/job-categories` | public — active categories as a tree (parent/children) |
| `GET` | `/api/job-categories/{id}` | public |
| `GET` | `/api/job-categories/all` | authenticated via `X-User-Id` — flat list incl. inactive |
| `POST` | `/api/job-categories` | `X-User-Id` |
| `PUT` | `/api/job-categories/{id}` | `X-User-Id` (re-parenting is cycle-checked) |
| `DELETE` | `/api/job-categories/{id}` | `X-User-Id` (blocked while it has children or any job posting — incl. soft-deleted, whose FK rows persist — still references it) |

### Job skills (`/api/job-skills`)

| Method | Path | Access |
|---|---|---|
| `GET` | `/api/job-skills` | public — active skills |
| `GET` | `/api/job-skills/{id}` | public |
| `GET` | `/api/job-skills/all` | authenticated via `X-User-Id` — incl. inactive |
| `POST` | `/api/job-skills` | `X-User-Id` |
| `PUT` | `/api/job-skills/{id}` | `X-User-Id` |
| `DELETE` | `/api/job-skills/{id}` | `X-User-Id` (blocked while any posting references it; delete-protection counts soft-deleted postings too) |

### Job tags (`/api/job-tags`)

| Method | Path | Access |
|---|---|---|
| `GET` | `/api/job-tags` | public |
| `GET` | `/api/job-tags/{id}` | public |
| `POST` | `/api/job-tags` | `X-User-Id` |
| `PUT` | `/api/job-tags/{id}` | `X-User-Id` |
| `DELETE` | `/api/job-tags/{id}` | `X-User-Id` (blocked while any posting references it; delete-protection counts soft-deleted postings too) |

Taxonomy CRUD is open to employers/admins for now via the `X-User-Id`
stand-in; once role enforcement lands, writes should tighten to admins only.

### Seeding sample data & final API smoke test

`services/job-service/seed/` ships two helpers (both use the running service
on port 5003, so they exercise the real HTTP surface and land random JSON in
`job_db`):

```bash
# repeatable random seed: 3 root + 4 child categories, 11 skills, 5 tags,
# 6 randomized postings across companies 1-3 (4 published, 1 closed, 1 draft)
python3 seed/seed.py [base_url] [owner_id]     # defaults: localhost:5003, 1001

# full API smoke suite (lifecycle, filters, admin, guards, error paths);
# logs its created ids and leaves a couple of postings behind
./seed/api-tests.sh                            # owner 2002; PASS/FAIL per check
```

Slugs come from the shared `com.sho1kat.util.SlugUtils` in common-lib
(company-service + job-service), with per-service `-2`, `-3` suffixing for
collisions; slugs of deleted jobs are never recycled.

### Request DTOs

Statuses: `DRAFT`, `ACTIVE`, `REJECTED`, `SUSPENDED`, `CLOSED`, `FILLED`,
`EXPIRED` (jobs are authored as `DRAFT` and published by the employer; `FILLED`
and `EXPIRED` have no automatic transitions yet).
Employment types: `FULL_TIME`, `PART_TIME`, `CONTRACT`, `INTERNSHIP`, `TEMPORARY`,
`FREELANCE`. Experience levels: `ENTRY_LEVEL`, `MID_LEVEL`, `SENIOR_LEVEL`, `LEAD`,
`EXECUTIVE`. Work modes: `ON_SITE`, `HYBRID`, `REMOTE`. Salary periods: `HOURLY`,
`MONTHLY`, `YEARLY`. Skill categories (on skills): `PROGRAMMING_LANGUAGE`, `FRAMEWORK`,
`DATABASE`, `CLOUD_PLATFORM`, `DEVOPS`, `DESIGN`, `SOFT_SKILL`, `TOOL`, `LANGUAGE`, `OTHER`.

- **Create job**: `companyId` (required), `title` (required, ≤150), `description`
  (required, ≤10000), `responsibilities`/`requirements` (≤10000), `benefits` (≤5000),
  `employmentType`/`experienceLevel`/`workMode` (required), location
  `address`/`city`/`state`/`country`/`zipCode` (`city`+`country` required for
  `ON_SITE`/`HYBRID`), `salaryMin`/`salaryMax` (decimal ≥0, min ≤ max,
  `salaryPeriod` required when a salary is set), `salaryCurrency` (ISO 4217 code,
  e.g. `USD`), `categoryId` (required, must be an active category),
  `skillIds`/`tagIds` (≤20 each, must exist), `vacancies` (1–10000),
  `applicationDeadline`/`expiresAt` (today or later on create).
  **Update job**: same fields minus `companyId`; deadline/expiry are not required
  to be future so unrelated edits never get blocked.
- **Job category**: `name` (required, ≤100; slug derived), `description` (≤1000),
  `iconUrl` (http(s) URL, ≤500), `parentId` (optional, for sub-categories),
  `active` (update: `null` keeps current).
- **Job skill**: `name` (required), `category` (`SkillCategory`, required), `active`.
- **Job tag**: `name` (required).
- The public catalogue hides drafts/rejected/closed/deleted postings and
  expired deadlines; admin views show everything not deleted. `CompanySummaryResponse`
  fields come denormalised onto job cards, but until the company-service
  integration only `id` is populated.
- `DetailedJobResponse` carries real `viewCount`/`applicationCount` counters:
  views increment atomically on every public `GET /api/jobs/{id}`, application
  count is an integration point for the application flow (`incrementApplicationCount`,
  active postings only).

## Running the Resume Service

`resume-service` listens on **port 5004** (`application.yaml`).

```bash
cd services/resume-service
mvn spring-boot:run
```

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `DB_USERNAME` | yes | PostgreSQL user |
| `DB_PASSWORD` | yes | PostgreSQL password |
| `DDL_AUTO` | no | Hibernate DDL mode (default `update`; use `validate`/`none` for production) |
| `SHOW_SQL` | no | Log SQL statements (default `true`) |

### Authentication note

Same stand-in as company-service/job-service: JWT validation is not wired
into `resume-service` yet. Every endpoint — reads included, because resume
data is personal — requires the temporary `X-User-Id` header holding the
caller's user-service id
(`com.sho1kat.controller.RequesterId` documents this). The candidate id
carried by that header must own the resume addressed in the path, otherwise
the service answers `404`/`403` exactly as it will once real identity
forwarding exists.

### Data model

A candidate owns any number of resumes; `resumes` carries the shell (title,
`ResumeTemplateType template`, `ResumeVisibility visibility`, apply-with
`is_default` flag, embedded `personal_info`, `summary`,
`completion_score`, soft-delete `deleted_at`). Sub-sections are separate
tables keyed by `resume_id`: `work_experiences` (embedded `JobLocation`,
`EmploymentType`, technologies), `educations`, `resume_skills`
(`ProficiencyLevel`, years of experience), `resume_languages`
(`LanguageProficiency`), `projects` (technologies), `certifications` and
`awards`. Every sub-section row has `display_order` plus create/update
timestamps. Deletes of the resume root are soft; the newest surviving
resume is promoted to default.

- **Completion score** — 10 checklist parts, 10 points each:
  personal name present, email present, summary present, and at least one
  each of work experience, education, skill, project, certification, award
  and language. Recalculated on every section change.
- **Default handling** — the first resume of a candidate automatically
  becomes the apply-with default; creating one with `isDefault: true`
  (or `set-default`) demotes every other; after a delete promotion falls to
  the newest survivor.
- **Duplicate guards** — resume titles are unique per candidate
  (case-insensitive); likewise skill and language names within one resume.
- **Date rules** — work experience / education require `endDate` unless
  marked current (then a supplied end date is cleared); certificate
  `expirationDate` must not precede `issueDate`; `dateAwarded` cannot lie
  in the future; end dates must not precede start dates.

## API — resume-service

### Resumes (`/api/resumes`)

All endpoints are owner-scoped via `X-User-Id` (see authentication note).

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/resumes/create` | create shell (`201`; first resume auto-default) |
| `GET` | `/api/resumes/my-resumes` | list view, default first (sections empty) |
| `GET` | `/api/resumes/{resumeId}` | detailed view incl. all sections; touches `lastViewedAt` |
| `PUT` | `/api/resumes/{resumeId}` | update title/template/visibility (`null` keeps current) |
| `PATCH` | `/api/resumes/{resumeId}/personal-info` | patch-style personal info (only supplied fields change) |
| `PATCH` | `/api/resumes/{resumeId}/summary` | replace summary (`null` clears) |
| `POST` | `/api/resumes/{resumeId}/set-default` | make this the apply-with default |
| `DELETE` | `/api/resumes/{resumeId}` | soft delete, promotes newest survivor |

### Sub-sections (`/api/resumes/{resumeId}/…`)

Every group exposes `GET` (list, `display_order` then id ascending),
`POST` (add, `201`), `PUT /{id}` (full replace of that entry) and
`DELETE /{id}` (`204`), all owner-scoped:

| Path segment | Section |
|---|---|
| `/work-experiences` | employment history (`WorkExperienceRequest`) |
| `/educations` | education |
| `/skills` | `ResumeSkillRequest` |
| `/languages` | `LanguageProficiencyRequest` |
| `/projects` | `ProjectRequest` |
| `/certifications` | `CertificationRequest` |
| `/awards` | `AwardRequest` |

### Request DTOs

Template: `DEFAULT`, `MODERN`, `CLASSIC`, `PROFESSIONAL`. Visibility:
`PUBLIC`, `PRIVATE`, `LINK_ONLY`. Skill proficiency: `BEGINNER`,
`INTERMEDIATE`, `ADVANCED`, `EXPERT`. Language proficiency: `BASIC`,
`CONVERSATIONAL`, `FLUENT`, `NATIVE`. Employment type re-uses the common
`EmploymentType` enum; experience locations use the shared `JobLocation`
fields (`address`, `city`, `state`, `country`, `zipCode`).

- **Create resume**: `title` (required, ≤150, unique per candidate),
  `template`/`visibility` (optional, defaulted), `isDefault` (optional).
- **Personal info** (all optional, patch semantics): `firstName`/`lastName`
  (≤100), `headline` (≤150), `email` (validated), `phone` (validated, ≤20),
  `city`/`country` (≤100), `linkedInUrl`/`githubUrl`/`portfolioUrl`/
  `websiteUrl` (http(s) URLs ≤500). Supplying a field replaces it; `null`
  keeps it.
- **Work experience**: `companyName` (≤150), `companyLogoUrl` (http(s)
  ≤500), `position` (≤150), `employmentType`, location fields, `startDate`
  (required), `endDate` (required unless `isCurrentJob`), `description`
  (≤10000), `technologies` (≤30 × ≤100), `displayOrder`.
- **Education**: `institutionName` (≤150), `degree` (≤100),
  `fieldOfStudy`/`grade` (≤100), `startDate` (required), `endDate`
  (required unless `isCurrentlyStudying`), `description` (≤5000),
  `displayOrder`.
- **Skill**: `skillName` (≤100, unique per resume),
  `proficiencyLevel` (`ProficiencyLevel`), `yearsOfExperience` (0–50),
  `displayOrder`.
- **Language**: `languageName` (≤100, unique per resume), `proficiency`
  (`LanguageProficiency`), `displayOrder`.
- **Project**: `title` (≤150), `description` (≤10000), `technologies`
  (≤30), `projectUrl`/`sourceCodeUrl` (http(s) ≤500), `startDate`,
  `endDate` (absent ⇒ `isOngoing`), `displayOrder`.
- **Certification**: `name` (≤200), `issuingOrganization` (≤150),
  `issueDate` (required), `expirationDate` (absent ⇒ never expires,
  must not precede `issueDate`), `credentialId` (≤255),
  `credentialUrl` (http(s) ≤500), `displayOrder`.
- **Award**: `title` (≤200), `issuer` (≤150), `dateAwarded` (not in the
  future), `description` (≤5000), `displayOrder`.

Responses mirror these exactly (`ResumeResponse` nests
`PersonalInfoResponse` plus one list per section; the detailed
`GET /{resumeId}` also returns `lastViewedAt` and `completionScore`).

## Roadmap

- [x] User service (auth, user management)
- [x] Company service (profiles, locations, admin verification)
- [x] Job service (postings, taxonomy categories/skills/tags, employer publishing)
- [x] Resume service (resume builder, sections, skills/languages, completion score)
- [ ] Spring Cloud infrastructure in `cloud/` (service discovery, config server, API gateway)
- [ ] JWT enforcement in company-service / job-service / gateway identity forwarding
- [ ] Additional business services (applications, notifications)
- [ ] AI-powered features (matching, recommendations)
- [ ] Container images via Jib for each service
