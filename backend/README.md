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
├── cloud/               # job-portal-cloud — Spring Cloud infrastructure
│   ├── eureka-server/   # service discovery (port 8761)
│   ├── config-server/   # externalized config (port 8888, serves config-repo/ from GitHub)
│   └── api-gateway/     # the public front door: JWT validation, role gates, identity forwarding (port 5000)
└── services/            # job-portal-services — business microservices
    ├── user-service/    # authentication & user management (port 5001)
    ├── company-service/ # company profiles & admin verification (port 5002)
    ├── job-service/     # job postings & admin review (port 5003)
    ├── resume-service/  # candidate resume builder (port 5004)
    ├── application-service/ # candidate applications & employer review inbox (port 5005)
    ├── job-preference-service/ # candidate saved jobs / bookmarks (port 5006)
    └── ai-service/      # AI-powered generation (resume, jobs, applications, search) (port 5007)
```

| Module | Artifact | Description |
|---|---|---|
| `common-lib` | `job-portal-common` | Shared library: request/response DTOs, `UserRole`/`UserStatus`/`Company*` enums, `ApiException` base |
| `cloud/eureka-server` | `eureka-server` | Service discovery registry (dashboard: `http://localhost:8761`) |
| `cloud/config-server` | `config-server` | Central configuration, backed by the repo's `config-repo/` folder on GitHub |
| `cloud/api-gateway` | `api-gateway` | Single entry point for all clients: verifies JWTs, enforces the role-based access matrix, forwards the verified identity downstream |
| `services/user-service` | `user-service` | User authentication (JWT access + refresh tokens) and user/role management |
| `services/company-service` | `company-service` | Company profiles, offices, and admin verification workflow |
| `services/job-service` | `job-service` | Job postings (search, employer CRUD, admin review) |
| `services/resume-service` | `resume-service` | Candidate resumes (sections, skills, languages, completion score) |
| `services/application-service` | `application-service` | Candidate applications, employer review inbox, internal notes |
| `services/job-preference-service` | `job-preference-service` | Candidate saved jobs (bookmarks) with personal notes |
| `services/ai-service` | `ai-service` | AI content generation: resume optimization, job auto-generation, cover letters & screening, natural-language search |

## Requirements

- **JDK 25**
- **Maven 3.8+**
- **PostgreSQL** (user-service database: `user_db`; company-service database: `company_db`; job-service database: `job_db`; resume-service database: `resume_db`; application-service database: `application_db`; job-preference-service database: `job_preference_db`; *ai-service is database-less*)
- **One shared `JWT_SECRET`** (`openssl rand -base64 32`) — must be given to `user-service` *and* `api-gateway`, since the gateway verifies the tokens user-service signs
- **`GEMINI_API_KEY` (Google AI Studio) and/or `GROQ_API_KEY` (groq.com) for ai-service** — at least one; Gemini is preferred, Groq is the automatic fallback

### Ports

| Service | Port |
|---|---|
| eureka-server | 8761 |
| config-server | 8888 |
| **api-gateway (public entry point)** | **5000** |
| user-service | 5001 |
| company-service | 5002 |
| job-service | 5003 |
| resume-service | 5004 |
| application-service | 5005 |
| job-preference-service | 5006 |
| ai-service | 5007 |

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

Tests run against an in-memory H2 database (`*_test`), so no external services
are needed for the build. The test configs (`services/*/src/test/resources/application.yaml`)
disable the config client and discovery — the Spring Cloud starters come in
transitively and their import check would otherwise demand a config server.

## Spring Cloud infrastructure

Startup order (later steps look up earlier ones; each step is a separate terminal):

```bash
cd cloud/eureka-server && mvn spring-boot:run     # 1. discovery  → http://localhost:8761
cd cloud/config-server && mvn spring-boot:run     # 2. config     → http://localhost:8888 (serves config-repo/)
cd services/user-service && mvn spring-boot:run   # 3. services   (any subset; need DB_USERNAME/DB_PASSWORD/JWT_SECRET, ai-service needs an AI key)
cd cloud/api-gateway && mvn spring-boot:run       # 4. gateway    → http://localhost:5000 (needs JWT_SECRET)
```

Services take most of their settings from the config server, which serves the
`config-repo/*.yaml` files at the root of this repository. `JWT_SECRET` is never
stored there — it is referenced as `${JWT_SECRET}` and must be exported in the
shell that runs each service.

## Running the API Gateway

`api-gateway` listens on **port 5000** (`config-repo/api-gateway.yaml`) and is
**the only URL clients should use**:

```bash
cd cloud/api-gateway
JWT_SECRET=$(openssl rand -base64 32) mvn spring-boot:run
```

Every HTTP request goes to the gateway (`http://localhost:5000/api/...`); it
looks the destination up in Eureka by service name and proxies the response.
The routing table (`com.sho1kat.config.RouteConfig`) covers all eight services'
API prefixes.

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `JWT_SECRET` | yes | Same base64 secret as user-service — the gateway verifies every access token against it |
| `JWT_ISSUER` | no | Issuer claim to require (default `job-portal-user-service`) |
| `EUREKA_URI` | no | Discovery server URL (default `http://localhost:8761/eureka/`) |
| `SERVER_PORT` | no | Gateway port (default `5000`) |
| `APP_CORS_ALLOWEDORIGINS` | no | Comma-separated origins the browser frontend may call from (default `http://localhost:5173,http://localhost:3000`) |

The `config-server` import is `optional:` — when it is offline the gateway still
boots with the fallbacks above (`config-repo/api-gateway.yaml` overrides them
when the config server runs).

### What the gateway does on every request

1. **Verifies the token** (`com.sho1kat.security.JwtService`) — signature, issuer
   `job-portal-user-service` and expiry. Invalid/missing tokens simply leave the
   request unauthenticated.
2. **Decides who may call it** (`com.sho1kat.config.SecurityConfig`) — the access
   matrix below, checked **top to bottom, first match wins**.
3. **Forwards verified identity** (`com.sho1kat.filter.UserHeaderFilter`) — any
   `X-User-Id` / `X-User-Email` / `X-User-Role` headers the client sent are
   **always removed first**, then re-set from the verified token claims (so they
   can never be faked). The raw `Authorization` header is forwarded too.

Downstream services read `X-User-Id` as the caller's id (the exact header the
stand-in code already used) — **through the gateway Postman never has to send
`X-User-*` manually**.

### How authentication works (the big picture)

```
 1. Client ──POST /api/auth/register | login──▶ gateway ──▶ user-service
    Client ◀────── accessToken (JWT, 15 min) + refreshToken (7 days) ──────

 2. Every other call:
    Client ──Authorization: Bearer <accessToken>──▶ gateway
            │ verifies JWT signature → issuer → expiry
            │ role claim → authority (e.g. "role": "ROLE_EMPLOYER")
            │ access matrix → allow / 401 / 403
            │ strips client X-User-*, sets X-User-Id|Email|Role
            ▼
       service ← Authorization + X-User-*   (does the fine-grained work:
            │                                owns the record? status legal?
            ▼                                method-level @PreAuthorize?)
    Client ◀──────── service response
```

**Public vs protected — the rule of thumb:**
reading the catalog is public; writing data or touching your own account needs a
token; running the business workflows needs the matching *role*:

| Roles (from `common-lib` `UserRole`) | Who | Named examples |
|---|---|---|
| `ROLE_JOB_SEEKER` | candidates | register + apply for jobs, resumes, bookmarks |
| `ROLE_EMPLOYER` | companies | create company, publish jobs, review applications |
| `ROLE_ADMIN` / `ROLE_SUPER_ADMIN` | platform staff | verification, suspensions, taxonomy CRUD, user management |

### Access matrix (`SecurityConfig`, first match wins)

| Request | Who may call it |
|---|---|
| `POST /api/auth/register` · `/api/auth/login` · `/api/auth/refresh` · `/api/auth/logout` | **public** (user-service rate-limits these) |
| `GET /api/jobs/**`, `GET /api/companies/**`, `GET /api/job-categories/**`, `GET /api/job-skills/**`, `GET /api/job-tags/**` | **public** — catalog browsing |
| `GET /api/job-categories/all`, `GET /api/job-skills/all`, `GET /api/job-tags/all` | any logged-in user (inactive entries included) |
| `POST/PUT/DELETE /api/job-categories/**`, `/api/job-skills/**`, `/api/job-tags/**` | `ADMIN`, `SUPER_ADMIN` — taxonomy CRUD |
| `/api/admin/**` | `ADMIN`, `SUPER_ADMIN` — verification & moderation |
| any write on `/api/jobs/**` (create, publish, close, delete) | `EMPLOYER`, `ADMIN`, `SUPER_ADMIN` |
| any write on `/api/companies/**` (create, update, locations, delete) | `EMPLOYER`, `ADMIN`, `SUPER_ADMIN` |
| `/api/companies/{id}/applications/**` (employer inbox, notes, status moves) | `EMPLOYER`, `ADMIN`, `SUPER_ADMIN` |
| `/api/resumes/**`, `/api/preferences/**` | `JOB_SEEKER`, `ADMIN`, `SUPER_ADMIN` — candidate-only features |
| `PUT /api/auth/me/password`, `/api/users/**`, `/api/applications/**` | any logged-in user — the *service* then decides self vs admin (`@PreAuthorize`) or per-record ownership |
| everything else | any logged-in user (fail closed) |

Gate rejections answer JSON:

- **401** — `{"success": false, "message": "Authentication required: missing, invalid or expired bearer token"}`
- **403** — `{"success": false, "message": "Forbidden: your role cannot call this endpoint"}`

Application errors coming from the services keep the documented
`{ status, error, message, details, timestamp }` shape.

### Production notice

In production **only the gateway port is public** (firewall / Docker network /
L7 load balancer in front). The service ports are internal, because they trust
the gateway-injected `X-User-*` headers. Never expose 5001-5007 directly.
A hardening follow-up is re-verifying the forwarded JWT inside each service;
then the header trust becomes a secondary guard rather than the only one.

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
`common-lib/postman/job-portal-system.postman_collection.json` — every request
in it targets the gateway (`http://localhost:5000`) by default.

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

`company-service` trusts the `X-User-Id` header as the caller's identity. When
requests come **through the API gateway** that header is set from the verified
JWT (gateway strips anything the client sent), and the gateway additionally
gates writes/admin areas to `EMPLOYER`/`ADMIN` roles. When you hit port 5002
directly in **local development**, you supply the header yourself — exactly the
stand-in behaviour (`com.sho1kat.controller.RequesterId` documents it). Public
catalogue endpoints need no header either way.

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

Same pattern as company-service: `job-service` trusts the `X-User-Id` header as
the caller's identity. Through the API gateway the header arrives verified (and
the gateway only lets `EMPLOYER`/`ADMIN` calls reach the write endpoints),
while direct local calls to port 5003 supply it manually
(`com.sho1kat.controller.RequesterId` documents the stand-in). Public search
endpoints need no header. `companyId` is still only supplied in the payload —
cross-checking that the caller actually owns the company before accepting
postings (by matching `X-User-Id` against company-service data) remains a
pending integration.

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

Taxonomy CRUD now requires `ADMIN`/`SUPER_ADMIN` at the gateway; the service
itself still trusts `X-User-Id` (as documented above) and can be hit directly in
local development.

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

Same pattern as the other services: `resume-service` trusts the `X-User-Id`
header as the caller's identity. Every endpoint — reads included, because
resume data is personal — requires it. Through the API gateway the header is
set from the verified JWT (and the gateway only admits `JOB_SEEKER`/`ADMIN`
calls here), while direct local calls to port 5004 supply it manually
(`com.sho1kat.controller.RequesterId` documents the stand-in). The candidate id
carried by that header must own the resume addressed in the path, otherwise
the service answers `404`/`403`.

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

### Seeding sample data

`services/resume-service/seed/seed.py` fills a running service (port 5004)
with three candidates' resume sets — a power user (personal info, summary,
every sub-section, default flip + delete-promotion flow), one minimal shell
and one medium resume:

```bash
python3 seed/seed.py [base_url] [main_candidate] [random_seed]
# defaults: localhost:5004, 3001, 2026 — the other candidates are main+1 / main+2
```

Re-runs remain idempotent: the per-candidate duplicate-title guards are
treated as "already exists" and the ids are recovered from the list
endpoint; the ids summary at the end plugs straight into the Postman
variables (`resumeId`, section ids). To grow more distinct data run new
batches with fresh candidates/seeds, e.g. `seed.py localhost:5004 4001 42`
— each batch adds a power user, a minimal shell and a medium resume per
candidate. All data goes through the real API surface and lands in
`resume_db`.

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

## Running the Application Service

`application-service` listens on **port 5005** (`application.yaml`).

```bash
cd services/application-service
mvn spring-boot:run
```

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `DB_USERNAME` | yes | PostgreSQL user (`application_db`) |
| `DB_PASSWORD` | yes | PostgreSQL password |
| `DDL_AUTO` | no | Hibernate DDL mode (default `update`) |
| `SHOW_SQL` | no | Log SQL statements (default `true`) |

### Authentication note

Same pattern as the other services: `application-service` trusts the
`X-User-Id` header as the caller's identity. Through the API gateway the header
comes from the verified JWT (candidate endpoints gated to any logged-in user,
the company inbox to `EMPLOYER`/`ADMIN`); direct local calls to port 5005
supply it manually. Candidates act only on their own applications; note writes
identify the author through `X-User-Id` and only the author may delete their
own note. Payloads carry the caller's identity, so per-record ownership checks
stay the service's job. `JobSummaryResponse` / `candidate` / `company` /
`employerId` payloads still carry ids only until cross-service lookup exists.

## API — application-service

### Applications (`/api/applications`) — candidate

| Method | Path | Access |
|---|---|---|
| `POST` | `/api/applications/create` | candidate via `X-User-Id` (`201`; PENDING) |
| `GET` | `/api/applications/my-applications` | candidate via `X-User-Id`; `page`, `size` |
| `GET` | `/api/applications/{applicationId}` | candidate via `X-User-Id` (404 otherwise) |
| `POST` | `/api/applications/{applicationId}/withdraw` | candidate via `X-User-Id` (empty body = no reason) |

Candidate views never carry the internal notes, and the list view is the
lightweight shape.

### Company inbox (`/api/companies/{companyId}/applications`) — employer

| Method | Path | Availability |
|---|---|---|
| `GET` | `/api/companies/{companyId}/applications` | paged list; filters `job`, `status`, `isStarred`, `aiShortListStatus`, `minAiScore`; `sortBy` = `appliedAt` (default) / `starred` (starred first, best score) / `aiScore` = `aiScoreDesc` (strongest first, unscreened last) / `aiScoreAsc` (weakest first, unscreened last); unknown keys fall back to the default; `page`, `size` (max 100) |
| `GET` | `/api/companies/{companyId}/applications/{applicationId}` | detail view incl. notes |
| `POST` | `/api/companies/{companyId}/applications/{applicationId}/star` | bookmark |
| `POST` | `/api/companies/{companyId}/applications/{applicationId}/unstar` | remove bookmark |
| `POST` | `/api/companies/{companyId}/applications/{applicationId}/status?status=…` | employer status move |

Statuses: `PENDING`, `REVIEWING`, `SHORTLISTED`, `INTERVIEW_SCHEDULED`,
`REJECTED`, `HIRED`, `WITHDRAWN`. Allowed employer moves — `REJECTED`,
`HIRED` and `WITHDRAWN` are terminal, illegal jumps answer `409`:

| From | May move to |
|---|---|
| `PENDING` | `REVIEWING`, `SHORTLISTED`, `INTERVIEW_SCHEDULED`, `REJECTED` |
| `REVIEWING` | `SHORTLISTED`, `INTERVIEW_SCHEDULED`, `REJECTED` |
| `SHORTLISTED` | `INTERVIEW_SCHEDULED`, `HIRED`, `REJECTED` |
| `INTERVIEW_SCHEDULED` | `HIRED`, `REJECTED` |

Candidates withdraw (`WITHDRAWN`) from any reviewing status themselves;
withdrawn/rejected applications stay in the inbox history.

### Notes (`/api/applications/{applicationId}/notes`) — employer

| Method | Path | Availability |
|---|---|---|
| `GET` | `/api/applications/{applicationId}/notes` | all notes, oldest first |
| `POST` | `/api/applications/{applicationId}/notes` | `201`; author = `X-User-Id` |
| `GET` | `/api/applications/{applicationId}/notes/{noteId}` | single note |
| `DELETE` | `/api/applications/{applicationId}/notes/{noteId}` | `204`; author-only (`403` otherwise) |

### Request DTOs

- **Apply** — `jobId`/`companyId` (required, copied from the job card),
  `resumeId` (required), `coverLetter` (optional, ≤5000), `expectedSalary`
  (decimal ≥0, ≤2 fraction digits), `availableFrom` (today or later).
  One live application per candidate and job (`409`); only withdrawn
  applications may be re-applied for (history rows are kept).
- **Filter** (`CompanyApplicationFilterRequest`) — `job`, `status`,
  `isStarred`, `aiShortListStatus` (`NOT_SCREENED`, `AUTO_SHORTLISTED`,
  `REVIEW_RECOMMENDED`, `PENDING_REVIEW`, `LOW_MATCH`), `minAiScore`
  (0–100, excludes unscreened rows), `sortBy` (see above).
- **Withdraw** — `withdrawnReason` (optional, blank clears).
- **Note** — `content` (required, ≤2000).

Screening (`aiShortListStatus`, `aiScore`) is read-only plumbing until any
scoring service exists (every application starts `NOT_SCREENED`/unrated), and
the job-service `applicationCount` increment is a pending cross-service
integration point (TODO: service discovery).

### Seeding sample data

`services/application-service/seed/seed.py` fills a running service (port
5005) with 26 applications across 8 candidates, 3 companies and 6 jobs — a
mixed status ledger (reviews, shortlists, an interview ladder, hires,
rejections, three withdrawals), stars and hiring-team notes:

```bash
python3 seed/seed.py [base_url] [first_candidate] [random_seed]
# defaults: localhost:5005, 3001, 2026 — candidates main..main+7 are used
```

All data goes through the real API surface and lands in `application_db`;
re-runs stay idempotent (duplicate 409s recover ids from the inbox, existing
statuses are tolerated, fresh candidate/job pairs add rows).

## Running the Job Preference Service

`job-preference-service` listens on **port 5006** (`application.yaml`).

```bash
cd services/job-preference-service
mvn spring-boot:run
```

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `DB_USERNAME` | yes | PostgreSQL user (`job_preference_db`) |
| `DB_PASSWORD` | yes | PostgreSQL password |
| `DDL_AUTO` | no | Hibernate DDL mode (default `update`) |
| `SHOW_SQL` | no | Log SQL statements (default `true`) |

### Authentication note

Same pattern as the other services: `job-preference-service` trusts the
`X-User-Id` header as the caller's identity (candidate scope). Through the API
gateway the header is set from the verified JWT (gated to
`JOB_SEEKER`/`ADMIN`); direct local calls to port 5006 supply it manually.
Unsave is addressed by the saved row's id — other candidates' rows answer
`404` (`com.sho1kat.controller.RequesterId` documents the stand-in).

## API — job-preference-service

### Saved jobs (`/api/preferences/saved-jobs`) — candidate

| Method | Path | Access |
|---|---|---|
| `GET` | `/api/preferences/saved-jobs` | candidate via `X-User-Id` — own bookmarks, newest first |
| `POST` | `/api/preferences/saved-jobs` | candidate via `X-User-Id` (`201`; duplicates answer `409`) |
| `GET` | `/api/preferences/saved-jobs/check?jobId=…` | candidate via `X-User-Id` — bookmark probe for the job-list UI |
| `DELETE` | `/api/preferences/saved-jobs/{savedJobId}` | candidate via `X-User-Id` (`204`; other candidates' rows `404`) |

### Request DTOs

- **Save job** — `jobId`/`companyId` (required, copied off the job card),
  `notes` (optional, ≤2000). One bookmark per candidate and job (unique in
  the database, `409` on retries; concurrent races surface as `409` via the
  integrity handler). Responses carry the denormalized `companyId`, the
  personal `notes` and the `savedAt` timestamp.
- `jobId`/`companyId` are never verified against job-service/company-service
  yet — listings are owner-scoped snapshot rows until cross-service lookup
  lands (TODO: gateway/service discovery pending).

### Seeding sample data

`services/job-preference-service/seed/seed.py` fills a running service (port
5006) with 35 bookmarks across 8 candidates and the stand-in jobs 1-6 /
companies 1-3 — most with a personal note, a couple as plain saves:

```bash
python3 seed/seed.py [base_url] [first_candidate] [random_seed]
# defaults: localhost:5006, 4001, 2026 — candidates main..main+7 are used
```

All data goes through the real API surface and lands in `job_preference_db`;
re-runs stay idempotent (duplicate-save 409s recover ids from the shelf, a
fresh candidate/job pair adds rows) and smoke checks report PASS/FAIL per the
sibling seed convention.

## Running the AI Service

`ai-service` listens on **port 5007** (`config-repo/ai-service.yaml`) and is
**database-less** — it generates content on demand and persists nothing.

```bash
cd services/ai-service
GEMINI_API_KEY=... mvn spring-boot:run      # and/or GROQ_API_KEY=...
```

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | one of the two | Google Gemini key; the preferred provider |
| `GROQ_API_KEY` | one of the two | Groq (OpenAI-compatible) key; the fallback provider |
| `AI model / tuning` | no | `gemini.model`, `gemini.temperature`, `groq.model`, etc. all come from `config-repo/ai-service.yaml` |

### Provider fallback

Both backends implement one `AiProvider` contract; the `AiCompletion` facade
walks them **Gemini → Groq** per request:

- a provider without its key is skipped (`503` "not configured" never masks a working fallback),
- a rate-limited / unreachable / malformed-output primary transparently falls through to the other,
- only when **every** configured provider fails does the caller get `503` (a single at-fault
  provider keeps its own `502` for malformed structured output),
- **the service still boots with no keys at all** — health and validation work, generation answers `503`
  (the `seed/smoke.py` probe flags this as SKIP),
- model JSON replies are parsed with a tolerant extractor that strips markdown fences and
  surrounding prose before deserialising into the typed response DTOs.

### Authentication note

Through the API gateway every `/api/ai/**` call requires any logged-in user
(the gateway injects `X-User-Id` from the JWT, which ai-service ignores — there
is no per-record ownership to enforce; output is generated, not stored). Direct
local calls to port 5007 need no identity at all. Providers are never sent the
caller's identity or email.

## API — ai-service

### Health & playground (`/api/ai`)

| Method | Path | Access |
|---|---|---|
| `GET` | `/api/ai` | health/welcome |
| `GET` | `/api/ai/default/{prompt}` | free playground with the portal assistant persona |
| `POST` | `/api/ai/gemini/generate` | raw Gemini call (`AiGenerateRequest` → `AiGenerateResponse`) — bypasses fallback |
| `POST` | `/api/ai/groq/generate` | raw Groq call — bypasses fallback |

### Resume optimization (`/api/ai/resume`)

| Method | Path | Body | Response |
|---|---|---|---|
| `POST` | `/summary` | `ResumeSummaryRequest` (target title, years, experiences/skills/educations) | `AiTextResponse` — ≤80-word ATS summary |
| `POST` | `/experience-bullets` | `WorkExperienceRequest` (job title, company, raw description, achievements hint) | `WorkExperienceBulletResponse` — 4-5 action-verb bullets |
| `POST` | `/improvements` | `ResumeImprovementRequest` (resume content, target title) | `ResumeImprovementResponse` — scored fix-list (`overallScore`, issues → priority) |
| `POST` | `/career-feedback` | `CareerFeedbackRequest` | `CareerFeedbackResponse` — `profileStrength`, shortlisting issues, `targetJobs` |

### Job auto-generate (`/api/ai/job`) — employer posting form

| Method | Path | Input | Response |
|---|---|---|---|
| `POST` | `/description` | `JobDescriptionRequest` (title, skills, level, type, mode, category, context) | `AiTextResponse` — markdown description with 5 fixed sections |
| `POST` | `/requirements?title=…&category=…` | query params | `AiTextResponse` — responsibilities + requirements block |
| `POST` | `/responsibilities?title=…&category=…` | query params | `AiTextResponse` — plain action-verb bullet list |
| `POST` | `/benefits?title=…&category=…&jobType=…` | query params | `AiTextResponse` — six competitive benefits |
| `POST` | `/skills` | `JobTextInputRequest` (title + draft description) | `AiTextResponse` — 8-10 relevant skills |
| `POST` | `/tags` | `JobTextInputRequest` | `AiTextResponse` — 8-10 discoverability tags |
| `POST` | `/salary-suggestion` | `SalaryRangeRequest` | `SalaryRangeResponse` — `minSalary`/`maxSalary` numbers, `currency`, `period`, `marketInsight` |

### Application support (`/api/ai/application`)

| Method | Path | Body | Response |
|---|---|---|---|
| `POST` | `/cover-letter` | `CoverLetterRequest` (`jobTitle` + `candidateName` required) | `AiTextResponse` — ≤300-word first-person letter |
| `POST` | `/screening-score` | `ScreeningScoreRequest` (all fields optional) | `ScreeningScoreResponse` — `score` + three sub-scores (0-100), matched/missing skills, strengths/concerns |
| `POST` | `/skills-gap` | `SkillsGapRequest` | `SkillsGapResponse` — matched/missing/partial skills, learning path, `overallReadiness` |

`screening-score` is what an employer UI will call to fill the application
inbox's `aiScore` / `aiShortListStatus` columns (application-service keeps
those decisions manual — the AI only informs them).

### Natural-language job search (`/api/ai/search`)

| Method | Path | Body | Response |
|---|---|---|---|
| `POST` | `/enhance` | `SearchEnhanceRequest` (free sentence ≤500) | `SearchEnhanceResponse` — `keywords`/`locations`/`skills` plus `jobTypes`/`workModes`/`experienceLevels` in the **exact job-service enums**, `minSalary` |
| `POST` | `/alert-suggestion` | `JobAlertSuggestionRequest` | `JobAlertSuggestionResponse` — suggested keywords/locations/types/modes/levels/industries plus `reasoning` |

Empty search fields stay `null`/`[]` — the prompt forbids invented enum values,
so the output plugs straight into the public `GET /api/jobs` filter set.

### Smoke suite

`services/ai-service/seed/smoke.py` calls every surface above against a running
service (port 5007, like the sibling seed scripts) and prints PASS/FAIL/SKIP
per check:

```bash
python3 seed/smoke.py [base_url]    # SKIP line means no AI key reached the service
```

Nothing is persisted — each check is a live generation, so re-runs are free of
state concerns.

## Roadmap

- [x] User service (auth, user management)
- [x] Company service (profiles, locations, admin verification)
- [x] Job service (postings, taxonomy categories/skills/tags, employer publishing)
- [x] Resume service (resume builder, sections, skills/languages, completion score)
- [x] Application service (apply, employer inbox, notes, status pipeline)
- [x] Job preference service (saved jobs / bookmarks)
- [x] Spring Cloud infrastructure in `cloud/` — eureka-server, config-server, api-gateway (JWT validation, role matrix, identity forwarding)
- [x] AI service — resume optimization (summary, ATS bullets, improvement scoring, career feedback), job auto-generation (descriptions, requirements, benefits, skills/tags, salary band), application support (cover letters, screening scores, skills-gap), natural-language search (filter extraction, alert suggestions); dual-provider fallback Gemini → Groq
- [ ] Per-record role/ownership checks inside every service (`@PreAuthorize` + cross-service ownership, e.g. job-service verifying `companyId`) — coarse role gating runs at the gateway today
- [ ] Per-service JWT re-verification for defense in depth (services currently trust gateway-injected `X-User-*` headers)
- [ ] Cross-service data resolution (job cards showing real company summaries, application counts, AI screening states) — `screening-score` now exists in ai-service; wiring the application-service inbox to it is pending
- [ ] Additional business services (notifications)
- [ ] AI-powered features (matching, recommendations) — beyond the ai-service generation suite: per-candidate job matching/recommendations
- [ ] Container images via Jib for each service
