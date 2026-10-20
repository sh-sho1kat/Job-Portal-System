# Postman Collection — Job Portal System API

Lives in `common-lib` so every service team shares one source of truth.
Import file: [`job-portal-system.postman_collection.json`](job-portal-system.postman_collection.json)
(Postman → *Import* → *File*, or drag it into a workspace).

## Setup after import

1. Set the `baseUrl` collection variable (defaults to `http://localhost:5001`).
2. Run **User Service → Auth → Login** once — its test script saves
   `accessToken`, `refreshToken`, and `userId` into collection variables.
   Every secured request then uses `{{accessToken}}` automatically
   (collection-level Bearer auth; public endpoints override with *No Auth*).
3. `Refresh` rotates the pair and its script re-saves both tokens, so the
   collection always works against the latest token family.

## Collection variables

| Variable            | Set by                 | Purpose                                        |
|---------------------|------------------------|------------------------------------------------|
| `baseUrl`           | you                    | service host, e.g. `http://localhost:5001`     |
| `accessToken`       | Login / Refresh script | Bearer token for secured requests              |
| `refreshToken`      | Login / Refresh script | used by Refresh / Logout bodies                |
| `userId`            | Login script           | the `{id}` used by the `Users` folder requests |
| `registeredUserId`  | Register script        | id of the last account created via Register    |

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
  controllers in `backend/services/*/src/main/java/.../controller/`.
- Public endpoints (permitAll) get `"auth": { "type": "noauth" }`;
  everything else inherits collection Bearer auth — do not hardcode tokens.
- When a response returns an access/refresh token, add a test script that
  stores it (`pm.collectionVariables.set(...)`), like Login/Refresh do.
- Document the possible status codes and the request DTO rules in the
  request `description` (see existing entries for the format).
- Error contract to keep in mind: every non-2xx (except empty-body 401s from
  the security layer) returns
  `{ status, error, message, details, timestamp }` via `ApiExceptionHandler`.
- Bump this README when a new service folder is added.
