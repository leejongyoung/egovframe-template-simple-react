# Bug Verification: HTTP 401 session expiry

- **Slug**: session-expiry-401 (from fix context)
- **Tested**: 2026-10-26
- **Assessment**: ./assessment.md
- **Fix**: ./fix.md
- **Result**: partial — frontend verified, real backend/DB integration not run

## Summary
The original frontend symptom no longer reproduces over real HTTP in the browser. The production bundle clears loginUser, displays one localized notice for its one business request, performs a document navigation to /login and renders an anonymous header. No backend/DB end-to-end success is claimed.

## Checks Performed
| Check | Command/action | Result | Notes |
| --- | --- | --- | --- |
| Failing before | upstream ae6158d browser import requestFetch + real HTTP401 from runtime-fixture.mjs | reproduced | no notice; stayed /about/site; stale Demo User and cache; Error HTTP error: 401 |
| Fixed development UI | delete synthetic cookie, click actual /admin/board link | pass | /login, cleared cache, anonymous header; two notices from dev StrictMode's two requests |
| Fixed production UI | `npm run preview -- --host 127.0.0.1 --port 3109`, same cookie deletion + actual link click | pass | one notice, /login, cleared cache, login password input visible, no Demo User |
| Focused tests | `npm run test:run -- src/api/egovFetch.test.js src/contexts/AuthContext.test.jsx` | pass | 24 tests |
| Full regression | `npm run test:run` | pass | 169 tests/21 files |
| Production build | `npm run build` | pass | 444 modules |
| Targeted lint | command in fix.md | pass | exit 0 |
| Node22 baseline | npm exec node@22 command in fix.md | pass | v22.23.4, full tests and build |
| Diff whitespace | `git diff --check` | pass | exit 0 |
| Actual backend + DB login -> cookie removal | not run | not-run | backend/database not provisioned within this repo task |

## Browser Evidence
Real browser network stack -> Vite /api proxy -> work-only synthetic HTTP server (not fetch mocks). Only alert presentation was recorded in sessionStorage to avoid blocking automation; fetch, storage, routing, React, and document navigation ran normally. Synthetic login identity was injected by a fixture cookie; no real authentication credentials were used.

Before: `{alerts:[], beforeAuthenticatedHeader:true, error:"HTTP error: 401", loginUser:"{\"id\":\"demo-user\"}", path:"/about/site", staleHeader:true, success:false}`.

After production: `{path:"/login", loginUser:"{\"id\":\"\"}", notices:["로그인이 필요합니다. 다시 로그인해 주세요."], staleHeader:false, loginVisible:true, navigationType:"navigate"}`.

Reproduce: start `node .specify/bugs/session-expiry-401/runtime-fixture.mjs` on work; start dev/preview in clean submission checkout; open /about/site, set synthetic `SYNTHETIC_SESSION=active; path=/` and display cache, reload; delete synthetic cookie; record alert messages then click existing anchor `a[href="/admin/board"]`; wait /login and inspect storage/header. Production has one business request; dev StrictMode mounts the effect twice.

Screenshots: [before](before.png), [development after](after-dev.png), [production after](after-production.png). Production screenshot visually inspected: login form and anonymous header visible.

## Residual Risks
- Full backend/DB behavior remains unverified; fixture mirrors source-observed response shapes at backend dc30c90.
- Multiple simultaneous failed requests can show multiple notices; concurrency suppression was not part of this fix. Observed in development StrictMode, absent for the tested production navigation.
- Invalid backend JWT cookies are not cleared by frontend (httpOnly); backend cookie policy remains unchanged.
- Existing test output includes router future flags, a list key warning, and expected error-branch logger output. npm ci reports 26 dependency vulnerabilities; no dependency changes made.
- Broad lint and CI were not run; targeted lint, local tests/build, and actual browser were run. No external green CI claim.

## Recommendation
Ready for parent code review of local upstream-submit commit a83f93d, with frontend runtime evidence and explicit integration limits. Keep submission unpushed until that review; do not represent this as completed backend end-to-end verification.

## Hooks
The registered extension configuration has hooks {}; no pre/post fix/test hooks to execute.

## Parent review correction checkpoint

Final local commit a83f93d adds consumer README guidance, removes exact notice prose assertions, and removes unchanged credentials wiring coverage. Focused Node22 suite now has 23 tests, all passed; targeted ESLint and diff check passed. Full 169-test/build/runtime results above belong to the pre-review 610bc5f checkpoint, whose application code is identical; no new full-suite/build/runtime result is claimed for the test/docs-only correction. Both fork [#8](https://github.com/leejongyoung/egovframe-template-simple-react/issues/8) and [#5](https://github.com/leejongyoung/egovframe-template-simple-react/issues/5) are linked and scoped in fix.md. No additional push was made while awaiting review.
