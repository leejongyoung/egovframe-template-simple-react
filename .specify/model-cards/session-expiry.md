# Domain model card: session expiry

## One-sentence definition
A frontend API consumer receiving an unauthenticated business response clears its display cache and reloads the login route, while the authentication probe may report anonymous state without navigating.

## Why it is needed
[Fork issue #8](https://github.com/leejongyoung/egovframe-template-simple-react/issues/8) reports that real security-layer HTTP 401 responses bypass the existing HTTP 200/resultCode 403 session-expiry path, leaving stale authentication UI.

## Existing models and terminology
- Observed upstream `ae6158dfcf6679a2e1acc5abc3356e9582857f10`: `src/api/egovFetch.js` interprets `CODE.RCV_ERROR_AUTH` (403) as authentication failure; actual HTTP 403 remains a transport/authorization error.
- `src/contexts/AuthContext.jsx` owns live user/roles; `src/utils/storage.js` serializes `loginUser`, a display-only cache. Cache is narrower than authenticated identity.
- Backend `dc30c90f0c6ebbb731e8e50f37d511585456909c`: `JwtAuthenticationEntryPoint` emits HTTP 401/resultCode 403; `JwtAuthenticationFilter` emits HTTP 401/string resultCode 401 for invalid tokens. These are observed source contracts, not backend runtime evidence.
- Backend `EgovLoginApiController.getCurrentUser` returns a map containing string resultCode 401 for anonymous requests (normally HTTP 200, despite SecurityConfig's HTTP-401 comment). The JWT filter can still return HTTP 401 on this endpoint when an invalid cookie exists.
- [PR #133](https://github.com/eGovFramework/egovframe-template-simple-react/pull/133) established terminal authentication handling with no screen callback or duplicate error; [PR #151](https://github.com/eGovFramework/egovframe-template-simple-react/pull/151) closed after maintainers incorporated HTTP checks and mock updates. Neither implements 401 expiry handling in current main.

## Synthetic example data
`loginUser = { id: "demo-user" }` (string ID, no credential), HTTP status 401, JSON `{ resultCode: "401", resultMessage: "invalid or expired token" }`; protected GET `/bbsMaster`. Alternative body: resultCode numeric 403, empty body or HTML. Probe GET `/auth/me` can return HTTP 200/body 401 or transport 401. All examples are fictitious.

## Successful behavior
- Existing HTTP 200/body 403 -> one localized authentication notice, cache `{id:""}`, full reload `/login`, neither callback (preserves #133).
- Proposed HTTP 401 on business request, regardless of body -> same terminal path; status is authoritative and JSON parsing failure must not prevent navigation (#8).
- Probe with HTTP 401 -> its error callback clears AuthContext, no navigation/notice; HTTP 200/body 401 -> existing handler clears context. This preserves anonymous public/login routes and prevents reload loops with an invalid cookie.
- Successful business response -> existing success callback. Non-401 HTTP error with JSON resultMessage -> Error carrying message to error callback; malformed/absent body -> HTTP status fallback (#8).

## Rejected or invalid behavior
HTTP 403 permission denial must not log the user out even if its body contains 403; generic non-2xx processing enforces this distinction. Neither business callback may run after terminal expiry. Invalid JSON on a successful response retains existing failure handling; it is not evidence of expiry.

## Outside this concept's responsibility
Backend token/cookie issuance and deletion, role authorization, login credential validation, network-error redesign, concurrency deduplication, routing refactors and dependency upgrades. A browser fixture can prove frontend behavior over real HTTP, not backend/DB end-to-end behavior.

## Rule sources and assumptions
| Rule | Source/revision | Evidence kind | Limits |
| --- | --- | --- | --- |
| Terminal auth branch + reload | upstream ae6158d `egovFetch.js`, PR #133 | observed | browser reproduction pending |
| HTTP 401 security bodies | backend dc30c90 JWT filter/entry point | observed source | no backend running |
| Anonymous probe is normal | backend dc30c90 controller; frontend AuthContext | observed source | controller comments differ from actual HTTP implementation |
| Include cookie credentials | upstream ae6158d requestFetch | observed | maintain existing override |
| Localized notice and 401 classification | fork #8 | proposed bug remediation | preserve public API callers; optional fifth policy argument for probe |

## Open questions
Full backend + database login/cookie-deletion verification remains pending environment availability; do not claim it from fixture or unit tests. Concurrent expiry notices and invalid-cookie replacement policy belong to separate work. No unresolved product policy blocks preserving the existing reload contract.

## Next step and evidence of completion
Follow [assessment](../bugs/session-expiry-401/assessment.md), then fix/test reports. Constitution: [maintenance policy](../memory/constitution.md). Pre-fix browser reproduction and all final checks are pending at card creation.

Completion checkpoint (2026-10-26): [fix](../bugs/session-expiry-401/fix.md) applied in isolated upstream-submit commit 610bc5fb051c0a5ce05519690b718889588791cd; [verification](../bugs/session-expiry-401/test.md) records 169 passing tests on Node22, passing build/targeted lint, failing-before browser evidence and passing actual production browser behavior. Backend/DB remains unverified, so overall integration result is partial. No upstream submission push or PR at this checkpoint.
