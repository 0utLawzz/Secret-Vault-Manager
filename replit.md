# Cred Vault

A personal credential and credit record manager — store emails, passwords, credit amounts, and track statuses (New / Bank / VPending / USED). NeoBrutalism design.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/db/src/schema/credentials.ts` — DB schema (credentialsTable with status enum)
- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `artifacts/api-server/src/routes/credentials.ts` — CRUD + credit/status endpoints
- `artifacts/api-server/src/routes/auth.ts` — Login / logout / me endpoints
- `artifacts/api-server/src/middlewares/auth.ts` — requireAuth middleware
- `artifacts/cred-vault/src/pages/Vault.tsx` — Main vault page
- `artifacts/cred-vault/src/pages/Login.tsx` — Password gate page
- `artifacts/cred-vault/src/types/credential.ts` — Shared frontend types

## Architecture decisions

- Password protection via `VAULT_PASSWORD` env var + express-session. If not set, vault is open (dev mode).
- Status options: New | Bank | VPending | USED. USED cards are faded + italic.
- Credit is a separate nullable float field with a dedicated PATCH endpoint.
- NeoBrutalism design: thick black borders, offset shadows, bold typography.

## Product

- Add/edit/delete credential records (email, password, credit, status, notes)
- Quick status change via clickable badge on each card
- Inline credit add/edit via popover
- USED records appear faded and italic ("spent")
- Filter tabs: All / New / Bank / VPending / USED
- Stats bar showing counts by status
- Password masking with reveal toggle
- Copy email/password to clipboard

## User preferences

_Populate as needed._

## Gotchas

- Set `VAULT_PASSWORD` secret before deploying to protect the vault publicly.
- Run `pnpm --filter @workspace/api-spec run codegen` after any OpenAPI spec change.
- `requireAuth` middleware bypasses auth when `VAULT_PASSWORD` is not set.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
