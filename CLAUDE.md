# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

Early-stage monorepo. The backend has users, JWT auth (`/api/auth/register`, `/api/auth/login`, `/api/users/me`), categories and transactions (`/api/transactions`, listed per month/year with income/expense totals; `/api/transactions/recent`, all of them newest first, paginated); the frontend has the login and register pages, the client-side session plumbing and the home screen (menu, user profile, recent transactions with pagination). The transactions and categories pages are placeholders; everything else is still to come.

## Architecture

Monorepo with two independent apps at the root, no shared build orchestration (no Nx/Turborepo):

- `frontend/` — Next.js (App Router, TypeScript), package manager **pnpm**.
- `backend/` — Spring Boot 4.1.1 (Java 21, Maven), package `com.expensetracker.backend`. Uses Spring Data JPA against PostgreSQL.
- `docker-compose.yml` (root) — single `postgres` service (`postgres:16-alpine`), configured via `.env` (copy from root `.env.example`). Connection settings there (`POSTGRES_DB`/`POSTGRES_USER`/`POSTGRES_PASSWORD`/`POSTGRES_PORT`) must stay in sync with `backend/src/main/resources/application.yml`, which reads the same env vars (with matching defaults) for its datasource URL/credentials.
- Auth — `backend` issues JWTs (HS256) signed with `JWT_SECRET` (see root `.env.example`); set a real 32+ byte secret outside local dev via that env var, read by `application.yml` under `app.jwt.secret`.

The two apps communicate over HTTP; the frontend's API base URL is configured via `NEXT_PUBLIC_API_BASE_URL` (see `frontend/.env.example`), pointing at the backend on `http://localhost:8080` by default. The backend only accepts browser requests from the origins in `app.cors.allowed-origins` (`CORS_ALLOWED_ORIGINS`, default `http://localhost:3000`).

## Frontend architecture — Feature-Sliced Design

`frontend/src/` follows [Feature-Sliced Design](https://feature-sliced.design). Layers, from most to least app-specific:

| Layer | Path | Contains |
| --- | --- | --- |
| app | `src/app/` | Next.js App Router routes + global setup (`globals.css`, `providers.tsx`) |
| pages | `src/views/` | Whole-page compositions (`LoginPage`, `RegisterPage`, `HomePage`, `TransactionsPage`, `CategoriesPage`) |
| widgets | `src/widgets/` | Composite blocks reused across pages (`app-header`, `recent-transactions`) |
| features | `src/features/` | User-facing actions (`auth/login`, `auth/register`, `auth/logout`) |
| entities | `src/entities/` | Business entities (`user`, `session`, `transaction`, `category`) |
| shared | `src/shared/` | Reusable, domain-agnostic code (`ui`, `api`, `config`, `lib`) |

Rules to keep:

- **Imports only go downward.** A layer may import from layers below it, never from the same layer or above. Cross-imports between slices of the same layer are not allowed — hoist the shared code down a layer instead (e.g. `toAuthErrorMessage` lives in `entities/session` because both auth features need it).
- **The FSD *pages* layer is `src/views/`.** `src/pages/` would make Next.js think the Pages Router is in use, so the layer is renamed; `src/app/` is the Next.js router *and* the FSD app layer.
- **Slices expose a public API via `index.ts`.** Import `@/entities/session`, not `@/entities/session/model/session-context`. Inside a slice, use relative imports.
- Segments within a slice: `ui/` (components), `model/` (types, schemas, state), `api/` (requests), `lib/` (helpers).
- Files are kebab-case; the `@/*` path alias maps to `src/*`.

### Frontend stack

- **UI — [shadcn/ui](https://ui.shadcn.com)** (new-york style) on Tailwind CSS v4. Components are vendored into `src/shared/ui/`, configured by `frontend/components.json`; add more with `pnpm dlx shadcn@latest add <component>` and re-export them from `src/shared/ui/index.ts`. Do not hand-edit generated component files unless a change is genuinely needed — `shadcn add` overwrites them. Theme tokens live in `src/app/globals.css` (Tailwind v4 is CSS-first: there is no `tailwind.config.ts`).
- **Forms** — `react-hook-form` + `zod` via `@hookform/resolvers`. Each form's schema sits in the feature's `model/` segment and mirrors the backend's bean validation, so the client catches what the server would reject.
- **API access** — `apiRequest` in `src/shared/api/` wraps `fetch`, and turns transport failures and non-2xx responses (RFC 7807 problem details) into a single `ApiError`. Features never call `fetch` directly.
- **Session** — `entities/session` keeps the access token and user in `localStorage` under `expense-tracker:session` and exposes them through `SessionProvider` / `useSession()` (mounted in `src/app/providers.tsx`). It is client-side only, so the session is `"loading"` during SSR and the first render; auth pages are guarded by `src/app/(auth)/layout.tsx`, which bounces signed-in visitors home, and members-only pages by `src/app/(protected)/layout.tsx`, which sends anonymous visitors to the login page (a UX guard only — the backend enforces access).

## Commands

### Database

```bash
docker compose up -d      # start PostgreSQL (run from repo root)
```

### Backend (`backend/`)

```bash
mvn spring-boot:run                                    # run the app (localhost:8080)
mvn test                                                # run all tests
mvn test -Dtest=ExpenseTrackerApplicationTests          # run a single test class
mvn test -Dtest=ExpenseTrackerApplicationTests#contextLoads  # run a single test method
mvn package                                             # build the jar
```

### Frontend (`frontend/`)

```bash
pnpm install         # install dependencies
pnpm dev             # run dev server (localhost:3000)
pnpm build           # production build
pnpm lint            # eslint
pnpm exec tsc --noEmit   # typecheck only
```

No frontend test runner is configured yet.

## Commits

Messages follow [Conventional Commits](https://www.conventionalcommits.org):

```
<type>(<scope>): <subject>

<body>
```

- **type** — `feat` (new functionality), `fix` (bug fix), `refactor` (no behavior change), `test`, `docs`, `style` (formatting only), `perf`, `build` (Maven/pnpm, dependencies), `ci`, `chore` (tooling, config, anything else).
- **scope** — the app and, if useful, the module: `backend`, `frontend`, `backend/transactions`, `frontend/auth`. Omit it for repo-wide changes (`docs: …` for `CLAUDE.md`/`README.md`).
- **subject** — English, imperative mood, lowercase, no trailing period, ≤ 72 chars: `feat(backend): add transactions module`.
- **body** — optional; explains *what* and *why*, wrapped at 72 chars. Breaking API changes get `!` after the type/scope (`feat(backend)!: …`) and a `BREAKING CHANGE:` footer.
- One logical change per commit; keep backend and frontend changes in separate commits unless they only make sense together.
- Run the relevant checks before committing: `mvn test` for backend, `pnpm lint` and `pnpm exec tsc --noEmit` for frontend.
- Never commit secrets (`.env`) or build output (`target/`, `.next/`, `*.tsbuildinfo`).

## Branching — GitHub Flow

The project follows [GitHub Flow](https://docs.github.com/en/get-started/using-github/github-flow): one long-lived branch, short-lived topic branches, everything merged through pull requests.

- **The main branch is always deployable.** Never commit or push directly to it; every change lands through a pull request. (Until the GitHub remote exists the local default branch may still be called `master`; it is renamed to `main` when the repo is published.)
- **One branch per change**, always created from an up-to-date main branch: `git switch main && git pull && git switch -c <type>/<short-name>`.
- **Branch names** are `<type>/<short-kebab-case-name>`, where `<type>` is one of the Conventional Commit types (`feat`, `fix`, `refactor`, `docs`, `chore`, …) — e.g. `feat/home-screen`, `fix/login-redirect`. Optionally add the issue number: `feat/42-home-screen`.
- **Keep branches short-lived and focused.** One feature or fix per branch; unrelated changes go to a separate branch. Sync with main (merge or rebase) when it moves on, rather than letting the branch drift.
- **Commit early and often** on the branch, following the commit conventions above; the checks listed there must pass before opening a PR.
- **Open a pull request** into main as soon as there is something to discuss (a draft PR is fine). The PR title follows the commit subject format; the description says what changed and why and how it was verified.
- **Merge only after review and green checks**, preferably as a squash merge so the main history has one Conventional Commit per PR. Delete the branch after merging.
- Claude does not push, open or merge PRs, or delete branches unless asked.
