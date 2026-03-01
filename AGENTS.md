# zaim-mcp

Zaim家計簿APIのMCPサーバー（Model Context Protocol）。

## Tech Stack
- Runtime: Bun (not Node.js) — use `bun run` / `bun install`
- Language: TypeScript (strict mode, ES2022, Node16 module resolution)
- Linter/Formatter: Biome (`bun run check` = lint + format + typecheck)
- Package manager: Bun (no package-lock.json, uses bun.lock)
- MCP SDK: @modelcontextprotocol/sdk, Zod for schema validation
- Auth: OAuth 1.0a (oauth-1.0a package)

## Project Structure
- `src/cli.ts` — CLI entry point (`zaim-mcp` bin), dispatches `init` subcommand or starts MCP server
- `src/index.ts` — MCP server entry point, tool registrations
- `src/helpers.ts` — Pure helper functions (isValidDate, dateSchema, successResult, errorResult)
- `src/zaim-client.ts` — OAuth-authenticated Zaim API client, `buildURL()` SSRF guard
- `src/init/` — Interactive setup wizard (`zaim-mcp init`)
  - `index.ts` — Main init flow: credential input, OAuth dance, client config writing
  - `oauth.ts` — OAuth 1.0a request/access token exchange with Zaim API
  - `clients.ts` — MCP client config writers (Claude Desktop, Claude Code, Cursor, Windsurf, VS Code)
  - `prompt.ts` — Interactive CLI prompt helpers (input, single/multi choice)
- `src/__tests__/` — Unit tests (Bun built-in test runner)
- `.githooks/pre-commit` — Biome check on staged files
- `.github/workflows/ci.yml` — CI: lint + typecheck + test on PR/push to master

## Commands
- `bun run start` — Start MCP server (stdio transport)
- `bun run test` — Run unit tests (Bun built-in test runner)
- `bun run check` — Lint + format + typecheck (all-in-one)
- `bun run lint` — Biome CI check only
- `bun run lint:fix` — Biome auto-fix
- `bun run typecheck` — TypeScript type check (`tsc --noEmit`)

## Code Style
- Biome recommended rules, 2-space indent, 80 char line width
- Japanese descriptions for MCP tool titles/descriptions
- Helper pattern: `registerSimpleGetTool()` for parameter-less GET endpoints
- `successResult()` / `errorResult()` helpers in `src/helpers.ts`
- SSRF prevention: `buildURL()` in `src/zaim-client.ts` validates host before API calls

## Testing
- Test runner: Bun built-in (`bun:test`), no additional dependencies
- Test files: `src/__tests__/**/*.test.ts`
- Scope: Pure functions only (no mocking, no API calls)
- Test names use Japanese (consistent with codebase conventions)

## Environment
- OAuth credentials via env vars: ZAIM_CONSUMER_KEY, ZAIM_CONSUMER_SECRET, ZAIM_ACCESS_TOKEN, ZAIM_ACCESS_TOKEN_SECRET
- See `.env.example` for template

## Git
- Main branch: `master`
- Pre-commit hook: `bunx biome check --staged` (set up via `bun run prepare`)
- CI runs lint + typecheck + test on push to master and PRs
