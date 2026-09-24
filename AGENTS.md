# AGENTS.md — 02-wheaterapp

## Quickstart

- `bun install` — install deps (not `npm install`)
- `bun test` — run tests (not `jest`/`vitest`)
- `bun start` — run the CLI

## Toolchain

- **Bun.js** is the default runtime/package manager. Use `bun <cmd>` never `node`/`npm`/`yarn`/`pnpm`.
- `bun build <file>` bundles; `bun test` runs the test suite.
- Bun auto-loads `.env` — do NOT add `dotenv` or `cross-env`.

## Testing

- Use `bun test` with `bun:test` (import from `"bun:test"`).
- Tests live next to the code: `src/*.test.ts`.
- Unit-only — nothing hits the network. Storage tests point `WEATHER_CLI_CONFIG`
  at a temp file; UI tests rely on colors being off when stdout is not a TTY.

## TypeScript

- `tsconfig.json` enforces strict mode (`"strict": true`).
- Key flags: `noImplicitOverride`, `noFallthroughCasesInSwitch`, `noUncheckedIndexedAccess`.
- `noUnusedLocals`/`noUnusedParameters` are **disabled** — don't enable without reviewing.

## Project structure

- `index.ts` — entry point; calls `run()` from `src/menu.ts`.
- `src/api.ts` — OpenMeteo clients (geocoding + forecast). No API key needed.
- `src/storage.ts` — config persistence (`~/.weather-cli.json`, override with
  `WEATHER_CLI_CONFIG`) plus pure helpers over `Config` (add/remove/set default).
- `src/menu.ts` — menu loop; each option is its own handler returning the new `Config`.
- `src/prompt.ts` — stdin line reader, two paths on purpose: `node:readline` on a
  TTY (line editing + history), Bun's `console` async iterator otherwise.
  **Keep the non-TTY path**: in Bun 1.4 readline closes the interface after the
  first line when stdin is not a TTY (`ERR_USE_AFTER_CLOSE`), which breaks piped
  input. `ask()` returns `null` on EOF and `run()` must call `closePrompt()` so
  the process can exit.
- `src/ui.ts` — ANSI colors (TTY-only) and all rendering.
- `src/weather-codes.ts` — WMO code → description + icon.
- `src/types.ts` — shared types and `cityKey`/`cityLabel` helpers.
- `bun.lock` — lockfile, committed.
- `node_modules/` and `out/`/`dist/` are gitignored.

## Commands cheat-sheet

| Action | Command |
|---|---|
| Install deps | `bun install` |
| Run app | `bun start` |
| Build binary | `bun run build` → `./dist/weather` |
| Test | `bun test` |
| Typecheck | `bun run typecheck` |

## What to avoid

- ❌ `npm install` / `npm run` — use `bun` equivalents.
- ❌ `dotenv` — Bun loads `.env` automatically.
- ❌ `cross-env` — not needed.
- ❌ `jest`/`vitest` — use `bun test`.

- Puedes usar `@bun-instructions.md` para obtener las instrucciones de Bun.