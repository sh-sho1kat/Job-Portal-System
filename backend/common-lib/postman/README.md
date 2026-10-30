# Postman Collection — Job Portal System API

Lives in `common-lib` so every service team shares one source of truth.
Import file: [`job-portal-system.postman_collection.json`](job-portal-system.postman_collection.json)
(Postman → *Import* → *File*, or drag it into a workspace).

## Setup after import

1. Start the stack (eureka → config-server → user-service → other services →
   **api-gateway**, see the backend README) and leave every `*BaseUrl` variable
   at the gateway default `http://localhost:5000`. The gateway verifies the
   Bearer token, applies the role rules and then fills
   `X-User-Id` / `X-User-Email` / `X-User-Role` from the token itself —
   **you never send identity headers while calling through the gateway** (any
   `X-User-*` headers attached to a request are stripped as untrusted).
2. Run **User Service → Auth → Login** once — its test script saves
   `accessToken`, `refreshToken`, and `userId` into collection variables.
   Every secured request then uses `{{accessToken}}` automatically
   (collection-level Bearer auth; public endpoints override with *No Auth*).
3. `Refresh` rotates the pair and its script re-saves both tokens, so the
   collection always works against the latest token family.
4. The **logged-in account decides which folders work** (the gateway enforces
   the role matrix). When a request comes back `403`, you are logged in as the
   wrong role — log in again with the right account (see the table below).
5. For the **Application Service** folder, run **Apply For Job** once — it
   reuses `{{jobId}}` + `{{companyId}}` from the Job/Company Service
   variables, saves `applicationId`, and the note requests save `noteId`.

## Who to log in as, per folder

| Folder | Log in with | Gateway rule applied |
|---|---|---|
| User Service → Auth (`register`/`login`/`refresh`/`logout`) | anybody | public |
| User Service → Users — your own record | any account | any logged-in user |
| User Service → Users — other people | `ROLE_ADMIN` / `ROLE_SUPER_ADMIN` | self vs admin decided downstream |
| Company Service → Companies / Locations | `ROLE_EMPLOYER` (owner actions) | writes need `EMPLOYER` or `ADMIN` |
| Company Service → Company Admin | `ROLE_ADMIN` / `ROLE_SUPER_ADMIN` | `/api/admin/**` |
| Job Service → Jobs - Public | anybody | public |
| Job Service → Jobs - Employer | `ROLE_EMPLOYER` | writes need `EMPLOYER` or `ADMIN` |
| Job Service → Jobs - Admin, Categories/Skills/Tags writes | `ROLE_ADMIN` / `ROLE_SUPER_ADMIN` | admin / taxonomy-CRUD rules |
| Job Service → Categories/Skills/Tags `/all` reads | any account | authenticated (not public) |
| Resume Service, Job Preference Service | `ROLE_JOB_SEEKER` (or admin) | candidate-only features |
| Application Service → Applications (candidate side) | `ROLE_JOB_SEEKER` that owns the applications | any logged-in user, ownership enforced downstream |
| Application Service → Company Applications / Notes | `ROLE_EMPLOYER` (or admin) | employer inbox rule |

Demo accounts are listed at the bottom of this file.

## Direct-service mode (bypassing the gateway)

For debugging one service in isolation, override that service's `*BaseUrl`
variable to its internal port — `user-service` 5001, `company-service` 5002,
`job-service` 5003, `resume-service` 5004, `application-service` 5005,
`job-preference-service` 5006. In this mode the requests carry the stand-in
`X-User-Id: {{userId}}` header (kept for exactly this purpose), which equals
the **last logged-in** account — services do not parse the JWT themselves.
Never bypass the gateway in production: the service ports are internal and the
gateway is the only public entry point.

## Collection variables

| Variable            | Set by                 | Purpose                                        |
|---------------------|------------------------|------------------------------------------------|
| `baseUrl`           | you                    | gateway by default (`http://localhost:5000`); user-service direct mode `http://localhost:5001` |
| `companyBaseUrl`    | you                    | gateway by default; company-service direct mode `…:5002` |
| `jobBaseUrl`        | you                    | gateway by default; job-service direct mode `…:5003` |
| `resumeBaseUrl`     | you                    | gateway by default; resume-service direct mode `…:5004` |
| `applicationBaseUrl`| you                    | gateway by default; application-service direct mode `…:5005` |
| `preferenceBaseUrl` | you                    | gateway by default; job-preference-service direct mode `…:5006` |
| `accessToken`       | Login / Refresh script | Bearer token for secured requests              |
| `refreshToken`      | Login / Refresh script | used by Refresh / Logout bodies                |
| `userId`            | Login script           | `{id}` used by the `Users` requests (auto-injected as identity by the gateway anyway) |
| `registeredUserId`  | Register script        | id of the last account created via Register    |
| `companyId`         | Create Company script  | `{companyId}` used by the Company Service requests |
| `companySlug`       | Create Company script  | `{slug}` used by *Get Company By Slug*         |
| `locationId`        | Add Location script    | `{locationId}` used by the Locations requests  |
| `jobId`             | Job/seed scripts       | `{jobId}` used by the Job Service requests     |
| `jobCategoryId` / `jobSkillId` / `jobTagId` | creation scripts | taxonomy ids |
| `resumeId`          | create/list script     | `{resumeId}` used by the Resume Service requests |
| section ids         | sub-section scripts    | `workExperienceId`, `educationId`, `resumeSkillId`, `languageId`, `projectId`, `certificationId`, `awardId` |
| `applicationId`     | Apply For Job script   | `{applicationId}` used by the Application Service requests |
| `noteId`            | Add Application Note script | `{noteId}` used by the notes requests     |
| `savedJobId`        | Save Job script        | `{savedJobId}` used by the Saved Jobs requests |

## Demo data currently in the local DB (`user_db`)

- `shoikat@example.com` — `ROLE_ADMIN`, password `DemoPass123!`
- `tanvir.chowdhury@example.com` — `ROLE_SUPER_ADMIN`, password `DemoPass123!`
- 50 demo accounts: `demo01.akter41@example.com`, `demo02.akter85@example.com`,
  … `demo50.begum77@example.com` (alternating `ROLE_JOB_SEEKER` / `ROLE_EMPLOYER`).
  Each demo password is in `/tmp/opencode/apitest/batch.jsonl` (not committed).

## Conventions for adding new services / APIs

- **One top-level folder per microservice** (`User Service`, then later
  `Job Service`, `Application Service`, ...), **one subfolder per controller**
  (`Auth`, `Users`, ...).
- Request name = friendly verb phrase (*Get User By Id*), body/URL use the
  real route. Keep methods, paths, and DTO field names in sync with the
  controllers in `backend/services/*/src/main/java/.../controller/`, and add a
  new `*BaseUrl` variable defaulting to the gateway.
- Public endpoints (permitAll) get `"auth": { "type": "noauth" }`;
  everything else inherits collection Bearer auth — do not hardcode tokens.
- Stand-in `X-User-Id` headers are allowed (they make the direct-service mode
  work) but never required through the gateway.
- When a response returns an access/refresh token, add a test script that
  stores it (`pm.collectionVariables.set(...)`), like Login/Refresh do.
- Document the possible status codes and the request DTO rules in the
  request `description` (see existing entries for the format).
- Error contracts to keep in mind: gateway rejections return
  `{"success": false, "message": str}` (401/403); service errors return
  `{ status, error, message, details, timestamp }` via `ApiExceptionHandler`.
- Bump this README when a new service folder is added.
