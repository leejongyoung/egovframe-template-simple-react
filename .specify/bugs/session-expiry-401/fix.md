# Bug Fix: HTTP 401 session expiry

- **Slug**: session-expiry-401 (from assessment context)
- **Fixed**: 2026-10-26
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary
The upstream-rooted local commit `610bc5fb051c0a5ce05519690b718889588791cd` handles HTTP 401 before body parsing, then uses the existing cache-clear/full-document-login navigation path. Authentication probes explicitly opt out of HTTP401 navigation so anonymous public/login routes remain usable.

## Changes
| File | Change | Notes |
| --- | --- | --- |
| src/api/egovFetch.js | modified | HTTP401 normalization; localized notice; optional fifth policy argument; non401 JSON error message with HTTP fallback |
| src/api/egovFetch.test.js | regression cases | 15 added behavior tests, existing 5 preserved |
| src/contexts/AuthContext.jsx | modified | probe opts out of redirect and clears live state through existing callback |
| src/contexts/AuthContext.test.jsx | new regression cases | 4 rendered-provider tests; no mocked requestFetch and no source-text assertions |

## Tests Added or Updated
The API suite exercises status/body combinations, terminal callbacks, display-cache clearing, full-reload target, valid response delivery, credential options and network errors. The provider suite checks anonymous HTTP200/body401, HTTP401 JSON/empty, and refresh from an authenticated user to anonymous with roles removed.

## Local Verification
- `npm run test:run -- src/api/egovFetch.test.js src/contexts/AuthContext.test.jsx` -> exit 0, 24 passed.
- `npm run test:run` -> exit 0, 21 files/169 tests passed (Node 24.22.0).
- `npm run build` -> exit 0, 444 modules (Node 24.22.0).
- `npm exec -- eslint src/api/egovFetch.js src/api/egovFetch.test.js src/contexts/AuthContext.jsx src/contexts/AuthContext.test.jsx --report-unused-disable-directives --max-warnings 0` -> exit 0, no warnings/errors.
- `npm exec --yes --package=node@22 --call 'node --version && npm run test:run && npm run build'` -> exit 0; Node 22.23.4, 169 tests passed, build passed. Repeated full checks only to resolve the initially different runtime major version.
- `git diff --check` -> exit 0.
- Running Vite development app and production preview browser smoke -> login route, cache cleared, stale user removed; see test.md.

## Deviations from Assessment
None. Backend comments about /auth/me HTTP status were checked against actual controller implementation before coding; the optional probe policy covers security-filter HTTP401 while retaining HTTP200/body401 behavior.

## Follow-ups
Parent review before any submission push or PR. Real backend/database login and cookie expiry remain unverified; do not close issue solely from frontend fixture evidence.
