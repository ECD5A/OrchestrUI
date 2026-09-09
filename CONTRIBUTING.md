# Contributing to OrchestrUI

Useful contributions include upstream compatibility fixes, routing improvements, accessibility/performance work, catalog validation, agent skills, docs, examples, read-only MCP work and tests.

## Quick start

```bash
git clone https://github.com/ECD5A/OrchestrUI.git
cd OrchestrUI
npm ci
npm run check
```

Small bug fixes, documentation improvements and tests are welcome without prior discussion. For a new integration or architectural change, open an issue first so the ownership and licensing boundaries are clear.

## Before a PR

- Read `AGENTS.md` and `docs/LICENSING.md` and keep the change focused.
- Do not copy paid/Pro content, vendor React Bits, or add secrets/tokens.
- Run `npm run check`; for docs-only changes run `npm run check:docs` (and `npm run check:links` when links changed).
- For adapter changes, run the opt-in live smoke test and include mocked failure-path tests.
- For package/plugin changes, run `npm run pack:check` and keep all version fields synchronized.

A PR should explain the problem, approach, any new dependency, official sources checked, tests run and licensing implications. Security reports follow `SECURITY.md`, never public Issues.
