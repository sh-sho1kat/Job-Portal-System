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
    └── job-service/     # job postings & admin review (port 5003)
```

| Module | Artifact | Description |
|---|---|---|
| `common-lib` | `job-portal-common` | Shared library: request/response DTOs, `UserRole`/`UserStatus`/`Company*` enums, `ApiException` base |
| `cloud` | `job-portal-cloud` | Spring Cloud infrastructure services (discovery, config server, API gateway) |
| `services/user-service` | `user-service` | User authentication (JWT access + refresh tokens) and user/role management |
| `services/company-service` | `company-service` | Company profiles, offices, and admin verification workflow |
| `services/job-service` | `job-service` | Job postings (search, employer CRUD, admin review) |

## Requirements

- **JDK 25**
- **Maven 3.8+**
- **PostgreSQL** (user-service database: `user_db`; company-service database: `company_db`; job-service database: `job_db`)

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
| `DELETE` | `/api/job-categories/{id}` | `X-User-Id` (blocked while it has children or is referenced by active jobs) |

### Job skills (`/api/job-skills`)

| Method | Path | Access |
|---|---|---|
| `GET` | `/api/job-skills` | public — active skills |
| `GET` | `/api/job-skills/{id}` | public |
| `GET` | `/api/job-skills/all` | authenticated via `X-User-Id` — incl. inactive |
| `POST` | `/api/job-skills` | `X-User-Id` |
| `PUT` | `/api/job-skills/{id}` | `X-User-Id` |
| `DELETE` | `/api/job-skills/{id}` | `X-User-Id` (blocked while referenced by active jobs) |

### Job tags (`/api/job-tags`)

| Method | Path | Access |
|---|---|---|
| `GET` | `/api/job-tags` | public |
| `GET` | `/api/job-tags/{id}` | public |
| `POST` | `/api/job-tags` | `X-User-Id` |
| `PUT` | `/api/job-tags/{id}` | `X-User-Id` |
| `DELETE` | `/api/job-tags/{id}` | `X-User-Id` (blocked while referenced by active jobs) |

Taxonomy CRUD is open to employers/admins for now via the `X-User-Id`
stand-in; once role enforcement lands, writes should tighten to admins only.

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

## Roadmap

- [x] User service (auth, user management)
- [x] Company service (profiles, locations, admin verification)
- [x] Job service (postings, taxonomy categories/skills/tags, employer publishing)
- [ ] Spring Cloud infrastructure in `cloud/` (service discovery, config server, API gateway)
- [ ] JWT enforcement in company-service / job-service / gateway identity forwarding
- [ ] Additional business services (applications, notifications)
- [ ] AI-powered features (matching, recommendations)
- [ ] Container images via Jib for each service
