# AGENTS.md — 02-wheaterapp

## Quickstart

- `bun install` — install deps (not `npm install`)
- `bun test` — run tests (not `jest`/`vitest`)
- `bun run --hot ./index.ts` — dev server with HMR

## Toolchain

- **Bun.js** is the default runtime/package manager. Use `bun <cmd>` never `node`/`npm`/`yarn`/`pnpm`.
- `bun build <file>` bundles; `bun test` runs the test suite.
- Bun auto-loads `.env` — do NOT add `dotenv` or `cross-env`.

## Testing

- Use `bun test` with `bun:test` (import from `"bun:test"`).
- Example: `bun test index.test.ts`.
- No test server fixtures needed — tests are unit-only currently.

## TypeScript

- `tsconfig.json` enforces strict mode (`"strict": true`).
- Key flags: `noImplicitOverride`, `noFallthroughCasesInSwitch`, `noUncheckedIndexedAccess`.
- `noUnusedLocals`/`noUnusedParameters` are **disabled** — don't enable without reviewing.

## Project structure

- `index.ts` — entry point (currently just `console.log("Hello via Bun!")`).
- `bun.lock` — lockfile, committed.
- `OpenMeteo` API used for weather (geocoding + forecast).
- `node_modules/` and `out/`/`dist/` are gitignored.

## Commands cheat-sheet

| Action | Command |
|---|---|
| Install deps | `bun install` |
| Run app | `bun --hot ./index.ts` |
| Build | `bun build ./index.ts` |
| Test | `bun test` |
| Lint/typecheck | (none configured beyond tsc) |

## What to avoid

- ❌ `npm install` / `npm run` — use `bun` equivalents.
- ❌ `dotenv` — Bun loads `.env` automatically.
- ❌ `cross-env` — not needed.
- ❌ `jest`/`vitest` — use `bun test`.

- Puedes usar `@bun-instructions.md` para obtener las instrucciones de Bun.