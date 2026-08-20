# Contributing to OrchestrUI

Useful contributions include upstream compatibility fixes, routing improvements, accessibility/performance work, catalog validation, agent skills, docs, examples, read-only MCP work and tests.

Before a PR:

1. Read `AGENTS.md` and `docs/LICENSING.md`.
2. Keep the change focused.
3. Do not copy paid/Pro content.
4. Do not vendor React Bits.
5. Do not add secrets/tokens.
6. Run `npm run check`.
7. For documentation or source-link changes, run `npm run check:links`.
8. For adapter changes, run the opt-in live smoke test and include mocked failure-path tests.
9. For package/plugin changes, run `npm run pack:check` and keep all version fields synchronized.

A PR should explain the problem, approach, any new dependency, official sources checked, tests run and licensing implications. Security reports follow `SECURITY.md`, never public Issues.
