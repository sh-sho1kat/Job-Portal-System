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
    └── user-service/    # authentication & user management (port 5001)
```

| Module | Artifact | Description |
|---|---|---|
| `common-lib` | `job-portal-common` | Shared library: request/response DTOs, `UserRole`/`UserStatus` enums, `ApiException` base |
| `cloud` | `job-portal-cloud` | Spring Cloud infrastructure services (discovery, config server, API gateway) |
| `services/user-service` | `user-service` | User authentication (JWT access + refresh tokens) and user/role management |

## Requirements

- **JDK 25**
- **Maven 3.8+**
- **PostgreSQL** (user-service database: `user_db`)

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

## Roadmap

- [ ] Spring Cloud infrastructure in `cloud/` (service discovery, config server, API gateway)
- [ ] Additional business services (jobs, applications, notifications)
- [ ] AI-powered features (matching, recommendations)
- [ ] Container images via Jib for each service
