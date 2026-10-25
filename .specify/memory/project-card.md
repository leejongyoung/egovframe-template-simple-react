# egovframe-template-simple-react project context

Observed from the `work` source at `8e7212d3660f9731a2189f2c23bb50990690ba32` on 2026-10-26.
This is a maintenance context card, not a claim that application checks were run during adoption.

## Role and public entry points

React 19 + Vite example frontend for the separated eGovFrame simple homepage backend. Public entry points are `src/`, `src/config.js`, `vite.config.js`, `README.md`, `Dockerfile`, and `k8s/`; user, board, notice and schedule flows interact with the separate backend.

## Evidence and maintenance boundaries

- `README.md`: frontend/backend separation, sample pages, `/api`, OAuth setup and container requirements.
- `package.json`: actual development/build/lint/test scripts and dependency declarations.
- `.github/workflows/fork-ci.yml`: Node 22, `npm ci`, Vite build and `npm run test:run`.
- `.github/workflows/node.js.yml`: upstream main CI path.
- `AGENTS.md` and `scripts/open_upstream_pr.sh`: existing fork branch/submission policy; the current helper derives a submission from work and is unsuitable for the isolated procedure below.
- Public fork issues #8 and #12 identify authentication integration/test work; their existence is not a reproduction or a completed fix.

Keep the change scope and workflow policy in the [constitution](constitution.md); concept cards
link there rather than repeating the policy. Author a concept card only for actual planned work.

## Build and verification commands

- Install reproducibly: `npm ci` with the committed lockfile.
- Frontend: `npm run dev`; build: `npm run build`; preview: `npm run preview`.
- Tests: `npm run test:run` for one-shot Vitest; `npm run test` is watch mode.
- Lint: `npm run lint` exists in package scripts but is not run by the observed fork CI.
- Integration: follow README backend/DB setup and Docker Compose fullstack profile; Docker builds require BuildKit. No such environment was started for adoption.

For this tooling-only adoption, verify Spec Kit CLI/integration status, installed core/bug commands,
constitution completeness, and template resolution/scaffold presence. Full application build,
lint, tests, formatter, external services, and deployment are not part of that smoke check.

## Upstream and submission baseline

Actual upstream is `eGovFramework/egovframe-template-simple-react`, default branch `main`. Fetch that upstream's current default SHA for the submission base; fork `main` remains an upstream mirror and `work` holds fork maintenance tooling.

Use a separate Orca submission worktree based on the fetched upstream default SHA (`upstream-submit` prepared at that SHA when absent). Preserve the existing `upstream-submit/*` PR-head convention in `AGENTS.md` for later disposable PR branches. Do not run the existing work-derived `scripts/open_upstream_pr.sh` for this workflow; it does not establish a clean upstream-rooted history or exclude these newly introduced work-only paths. Transfer only reviewed application/test/documentation patches to the clean base, then inspect the entire diff and commit list.
No PR is created by adoption. Do not merge `work` or cherry-pick its adoption commit into a submission.
Preserve existing submission branches and PRs. Inspect changed paths and commits against the exact
base before any later PR; exclude work-only scaffolding without deleting upstream-owned files.

## Working with the pinned tooling

Installed by `uvx --from specify-cli==1.2.3 specify init --here --force --non-interactive
--integration omp --script sh --extension bug` after checking for existing path conflicts.
The CLI's init metadata pins 1.2.3; native agent commands live in `.omp/commands/`, including
`speckit.bug.assess.md`, `speckit.bug.fix.md`, and `speckit.bug.test.md`.
Use official upgrade support for future changes and preserve local customizations.
The new [domain model card template](../templates/model-card-template.md) aligns concept meanings
before specification; it is not an ML performance or benchmark card.

Observed submission base: `ae6158dfcf6679a2e1acc5abc3356e9582857f10` (eGovFramework/egovframe-template-simple-react, `main`).
Submission branch status: created-remote-at-upstream-default.
