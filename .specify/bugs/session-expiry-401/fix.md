# Bug Fix: HTTP 401 session expiry

- **Slug**: session-expiry-401 (from assessment context)
- **Fixed**: 2026-10-26
- **Assessment**: ./assessment.md
- **Status**: applied

## Summary
The upstream-rooted local commit `a83f93dfd1649136cef7908b3980306b35acb319` handles HTTP 401 before body parsing, then uses the existing cache-clear/full-document-login navigation path. Authentication probes explicitly opt out of HTTP401 navigation so anonymous public/login routes remain usable.

## Changes
| File | Change | Notes |
| --- | --- | --- |
| src/api/egovFetch.js | modified | HTTP401 normalization; localized notice; optional fifth policy argument; non401 JSON error message with HTTP fallback |
| src/api/egovFetch.test.js | regression cases | 14 added behavior tests, existing 5 preserved |
| src/contexts/AuthContext.jsx | modified | probe opts out of redirect and clears live state through existing callback |
| src/contexts/AuthContext.test.jsx | new regression cases | 4 rendered-provider tests; no mocked requestFetch and no source-text assertions |
| README.md | consumer documentation | terminal expiry, anonymous probe, error callback behavior and backend cookie ownership |

## Tests Added or Updated
The API suite exercises status/body combinations, terminal callbacks, display-cache clearing, full-reload target, network errors. The provider suite checks anonymous HTTP200/body401, HTTP401 JSON/empty, and refresh from an authenticated user to anonymous with roles removed.

## Local Verification
- `npm run test:run -- src/api/egovFetch.test.js src/contexts/AuthContext.test.jsx` -> exit 0, 24 passed.
- `npm run test:run` -> exit 0, 21 files/169 tests passed (Node 24.22.0).
- `npm run build` -> exit 0, 444 modules (Node 24.22.0).
- `npm exec -- eslint src/api/egovFetch.js src/api/egovFetch.test.js src/contexts/AuthContext.jsx src/contexts/AuthContext.test.jsx --report-unused-disable-directives --max-warnings 0` -> exit 0, no warnings/errors.
- `npm exec --yes --package=node@22 --call 'node --version && npm run test:run && npm run build'` -> exit 0; Node 22.23.4, 169 tests passed, build passed. Repeated full checks only to resolve the initially different runtime major version.
- `git diff --check` -> exit 0.
- Running Vite development app and production preview browser smoke -> login route, cache cleared, stale user removed; see test.md.

## Deviations from Assessment
Parent review added necessary consumer README documentation beyond the original file list. Removed incidental alert-wording assertions and the unchanged credentials/options wiring test; application implementation is unchanged. Backend comments about /auth/me HTTP status were checked against actual controller implementation before coding; the optional probe policy covers security-filter HTTP401 while retaining HTTP200/body401 behavior.

## Follow-ups
Parent review before any submission push or PR. Real backend/database login and cookie expiry remain unverified; do not close issue solely from frontend fixture evidence.

## Parent review correction validation

Final local commit a83f93d supersedes unpublished 610bc5f. On Node22: `npm exec --yes --package=node@22 --call 'node node_modules/vitest/vitest.mjs run src/api/egovFetch.test.js src/contexts/AuthContext.test.jsx && node node_modules/eslint/bin/eslint.js src/api/egovFetch.js src/api/egovFetch.test.js src/contexts/AuthContext.jsx src/contexts/AuthContext.test.jsx --report-unused-disable-directives --max-warnings 0'` -> exit 0, 23 tests passed and targeted lint passed; `git diff --check` -> exit 0. Earlier 169-test/build/browser evidence was produced at 610bc5f with identical application code; the final correction only removes a test, relaxes prose assertions and adds docs, so unchanged full suite/build/browser were not rerun.

## Cohesive scope: issues #8 and #5

Read both actual fork reports: [session expiry #8](https://github.com/leejongyoung/egovframe-template-simple-react/issues/8) explicitly includes preserving non-401 JSON error messages, referencing [HTTP error body #5](https://github.com/leejongyoung/egovframe-template-simple-react/issues/5). This patch classifies the same response boundary into terminal authentication expiry (401), ordinary authorization/server error (403/5xx), or success; keeping non-401 JSON messages is the shared requested behavior, with regressions proving HTTP403 does not log out. It does not claim every issue5 premise or completion condition: normal backend business errors remain HTTP200, default generic UI errors remain unchanged, and full-page reload deliberately preserves AuthContext reset rather than switching navigation APIs. Any later PR should link both URLs and describe this bounded overlap.

## Reviewed publication

After review, verified both upstream main and origin/upstream-submit remained ae6158dfcf6679a2e1acc5abc3356e9582857f10, then fast-forward pushed approved a83f93dfd1649136cef7908b3980306b35acb319 and opened [upstream PR #164](https://github.com/eGovFramework/egovframe-template-simple-react/pull/164). PR head/base/files were read back: expected SHAs, exactly five app/test/README paths, open and ready for review; no CI checks were reported at that observation. Work-only cards, fixture and screenshots remain outside its diff. Owned smoke tabs and three owned server terminals were closed after evidence was saved.
