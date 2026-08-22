# Architecture

OrchestrUI separates stable policy from current upstream knowledge:

- `AGENTS.md` holds durable repository rules.
- `.agents/skills/` holds repository workflows; `skills/` is an identical plugin-packaged copy enforced by validation.
- `catalog/libraries.json` holds exactly seven ecosystems, roles, compatibility, legal boundaries and provenance.
- `catalog/components.json` holds small metadata-only fallbacks and the four public official registry indexes.
- `catalog/routing-rules.json` is the declarative policy matrix for capabilities, exclusive roles, priorities, requirements and conflicts.
- `mcp/src/` implements six read-only MCP tools on the stable TypeScript SDK v2.
- `benchmark/` holds 50 structured routing scenarios and a reproducible benchmark runner.
- `examples/fixtures/` holds three host/task snapshots executed through routing and audit in CI.
- `.codex-plugin/plugin.json`, `.mcp.json` and `server.json` prepare Codex/plugin/npm/MCP Registry distribution.
- `assets/` holds the original OrchestrUI SVG identity and generated PNG previews; `scripts/render-brand-assets.mjs` makes the raster output reproducible.

The MCP layer loads trusted bundled catalogs synchronously. `search_components` may fetch only an exact allowlisted public registry URL, rejects non-public literal hosts, redirects and non-JSON responses, caps the body at 512 KiB, times out after four seconds and retains normalized metadata in memory for at most five minutes. Remote prose and component source files are discarded; agent-visible labels are locally derived from strict identifiers and carry an explicit data-only policy.

No MCP tool executes commands or mutates files. `get_install_instructions` returns inert text so the coding agent's normal permission model remains the only installation authority.

`recommend_stack` normalizes `HostProfile` and `TaskProfile`, registers existing role owners, evaluates ordered capability routes, applies catalog conflicts and returns selected/rejected candidates with rule evidence. Task text is a compatibility-only inference path. `audit_plan` keeps unverified rendered checks pending and excludes them from its verified score.

OrchestrUI does not vendor the seven libraries because that creates licensing risk, stale code, unnecessary context and dependency conflicts. The value remains selection, retrieval guidance, harmonization and audit judgment.
