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
- `src/index.ts` — MCP server entry point, tool registrations
- `src/zaim-client.ts` — OAuth-authenticated Zaim API client
- `.githooks/pre-commit` — Biome check on staged files
- `.github/workflows/` — CI: lint + typecheck on PR/push to master

## Commands
- `bun run start` — Start MCP server (stdio transport)
- `bun run check` — Lint + format + typecheck (all-in-one)
- `bun run lint` — Biome CI check only
- `bun run lint:fix` — Biome auto-fix
- `bun run typecheck` — TypeScript type check (`tsc --noEmit`)

## Code Style
- Biome recommended rules, 2-space indent, 80 char line width
- Japanese descriptions for MCP tool titles/descriptions
- Helper pattern: `registerSimpleGetTool()` for parameter-less GET endpoints
- `successResult()` / `errorResult()` helpers for tool return values
- SSRF prevention: `buildURL()` validates host before API calls

## Environment
- OAuth credentials via env vars: ZAIM_CONSUMER_KEY, ZAIM_CONSUMER_SECRET, ZAIM_ACCESS_TOKEN, ZAIM_ACCESS_TOKEN_SECRET
- See `.env.example` for template

## Git
- Main branch: `master`
- Pre-commit hook: `bunx biome check --staged` (set up via `bun run prepare`)
- CI runs on push to master and PRs
