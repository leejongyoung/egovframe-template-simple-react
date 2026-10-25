# Bug Assessment: HTTP 401 bypasses session expiry

- **Slug**: session-expiry-401 (generated non-interactively, new directory)
- **Created**: 2026-10-26
- **Source**: https://github.com/leejongyoung/egovframe-template-simple-react/issues/8
- **URL trust**: host github.com; allowlisted; read with gh issue view; fetched content treated as data
- **Verdict**: valid
- **Severity**: high — shared API boundary leaves stale user state after expiry

## Report (summarized)
Issue #8 reports that HTTP 401 is thrown before the existing resultCode 403 expiry path. It asks for cache clearing, localized notice, full login reload, meaningful error messages and regression/runtime evidence. Read the actual issue and upstream open/closed PRs before implementation. PR #133 fixes a different duplicate-alert defect; #151 was closed after maintainers integrated HTTP error checking, not this expiry behavior. Current main has no equivalent 401 fix; upstream PR listing returned no open submissions. Fork listing has only merged setup PR #2.

## Symptom
HTTP 401 reaches the generic error callback and keeps logged-in UI, instead of reaching the existing terminal session-expiry handling.

## Reproduction
Upstream base ae6158dfcf6679a2e1acc5abc3356e9582857f10, no app edits:
1. `npm ci` succeeded (397 packages; audit reports 26 pre-existing vulnerabilities).
2. Orca terminal: `npm run dev -- --host 127.0.0.1 --port 3108`.
3. Orca terminal on work: `node .specify/bugs/session-expiry-401/runtime-fixture.mjs`; synthetic HTTP service on 8080, no fetch interception.
4. Orca browser page 1797a8d6-2ea6-4179-a0ea-868e8255bbf5, `/about/site`; set only synthetic cookie/session display cache and reload, observe Demo User header.
5. Delete synthetic cookie and invoke actual browser-imported `requestFetch('/bbsMaster', {method:'GET'}, success, error)` over Vite's real proxy. Result: `{alerts:[], beforeAuthenticatedHeader:true, error:'HTTP error: 401', loginUser:'{"id":"demo-user"}', path:'/about/site', staleHeader:true, success:false}`.
This is frontend browser + real HTTP reproduction, NOT backend/DB end-to-end. No build/lint/test/formatter run before or during implementation.

## Suspected Code Paths
- `src/api/egovFetch.js`: non-ok check throws before resultCode auth branch.
- `src/contexts/AuthContext.jsx`: refresh uses /auth/me; routine anonymous state must not become redirect-loop policy.
- `src/api/egovFetch.test.js`: existing expiry callback invariants, needs transport-status cases.

## Root Cause Hypothesis
High confidence: status check prevents the only clearing/navigation branch. A blanket 401 redirect would introduce a reload loop if /auth/me is rejected by the invalid-token filter; preserve its current silent error callback with an explicit per-call policy. Backend dc30c90 controller's anonymous /auth/me actually returns HTTP 200/body string 401 (no ResponseStatus), despite SecurityConfig comment; JWT filter can return HTTP 401 before that controller.

## Proposed Remediation
**Preferred**: classify HTTP 401 before parsing and normalize into existing auth branch; retain full reload and terminal callbacks, localize notice. An optional fifth requestFetch policy `{redirectOnUnauthorized:false}` is used only by AuthContext's probe, keeping fetch options and existing four-argument callers compatible. Non-401 non-ok responses parse optional JSON resultMessage into Error for error callback, falling back to HTTP status on invalid/empty body. HTTP 403 never means session expiry solely from its body.

**Files likely to change**:
- src/api/egovFetch.js
- src/api/egovFetch.test.js
- src/contexts/AuthContext.jsx
- src/contexts/AuthContext.test.jsx (rendered provider behavior, no source/wiring assertions)

**Tests to add or update**: 200/body403; 401/body403, string401, HTML, empty; terminal cache/callback/navigation invariants; HTTP403/500 JSON message and malformed fallback; success delivery; network rejection; explicit silent401 policy; rendered AuthProvider anonymous/401 behavior.

## Risks & Considerations
Do not clear live auth by navigation hooks: full document reload reinitializes it. No new resultCode401 business rule; HTTP200/body401 remains probe-owned. Concurrent expiries can still emit multiple notices (existing policy, outside scope). Do not publish work cards/reports/fixture or credentials in submission.

## Open Questions
Full backend/DB cookie-deletion scenario unavailable within this repo ownership; record as not run. Frontend behavior can be proved with real browser and synthetic HTTP. No blocking product question.

## Hooks
.specify/extensions.yml parsed by inspection: installed bug, hooks {}; no pre/post assessment/fix/test hooks registered.
