# Read-only MCP specification

Implemented with `@modelcontextprotocol/server` 2.0.0 and the MCP 2026-07-28 stable SDK line. The local transport is stdio; all tools advertise `readOnlyHint: true`, `destructiveHint: false` and `idempotentHint: true`.

| Tool | Purpose | External access |
|---|---|---|
| `inspect_project` | extract a HostProfile with provenance and diagnostics | bounded local JSON reads within the server workspace |
| `list_libraries` | list/filter exactly seven ecosystems | none |
| `recommend_stack` | compute the smallest compatible ownership plan from structured profiles | none |
| `get_library_guidance` | return roles, compatibility, legal and official-source guidance | none |
| `search_components` | search public component metadata with fallback | allowlisted registry GET only |
| `get_install_instructions` | return inert official command text | none; never executes |
| `audit_plan` | verified score plus explicit pending checks | none |

Inputs use bounded Zod schemas. Results contain both model-readable JSON text and `structuredContent`. Unknown library IDs and unsafe component identifiers return tool errors without exposing stack traces.

`inspect_project` accepts `relative_path` (default `.`), resolved within the server's startup working directory. It reads only `package.json`, optional `package-lock.json` and `components.json`, each at most 2 MiB. It never imports executable configuration, scans sources, reads credentials, installs packages or executes scripts. Paths and symlinks outside the workspace are rejected. Set the server working directory to the intended frontend project. Monorepos can select a relative application directory. pnpm/yarn/bun projects use manifest declarations; their lockfile formats are not parsed. Lockfile evidence is labelled separately from proof of installed state. Non-semver URLs and custom dependency specifications are omitted. Resolve diagnostics when `ready_for_routing` is false before passing the returned profile to `recommend_stack`.

In 0.4, `optimization` reports exhaustive assignment count and the lexicographic objective: unassigned capabilities, unverified assignments, ecosystem additions, distinct libraries, then negative policy score (including dependency/bundle cost). A local numeric `rank` need not identify the globally selected candidate; use `outcome: selected`. `capability_coverage.verification` is `verified`, `pending` or `failed` for catalog-level routing checks, not rendered UI quality. Unknown versions and unverified external owners appear in `pending_requirements`. A known incompatible existing owner produces an `unmet_requirement`, never a successful preservation result.

`recommend_stack` accepts `host_profile` and `task_profile`. It returns normalized profiles, actionable `profile_diagnostics`, input mode, selected and rejected candidates, role ownership, decisions, evidence-bearing `candidate_rankings`, capability coverage, explicit `unmet_requirements`, task-wide `plan_metrics`, risks and validation steps. Hard gates are evaluated before ranking; only eligible candidates receive a numeric rank, while blocked candidates expose `rank: null` and `blocked_by`. Ranking factors cover policy order, installed evidence, dependency/bundle cost, overlap, task-wide coverage and semver compatibility. Bounded text fields remain available for backward compatibility; partial-profile calls report `hybrid-profile-inference` and text-only calls report `legacy-text-inference`.

`audit_plan` uses `pass`, `fail` and `pending`. Callers may attach bounded verification evidence. Pending categories do not increase `verified_score` or `verified_maximum`; blockers are derived only from failed checks.

The MCP audit and the `ui-quality-audit` skill deliberately operate at two different levels. `audit_plan` is an evidence-state contract: a check is verified (`pass`/`fail`) or still unverified (`pending`), with no partial credit. The rendered UI skill uses the separate `0/1/2` review rubric: `1` means an exercised check has an acceptable documented tradeoff, never that evidence is missing. Pending MCP checks must be exercised before they can contribute to the rendered rubric.

Live registry policy: public HTTPS only; exact URL allowlist; no credentials or user-supplied URLs; redirects rejected; JSON content type required; 4-second timeout; 512 KiB maximum response; 2,000-item parse cap; 20-result output cap; five-minute bounded in-memory cache; verified local fallback on failure. Only strict component identifiers and fixed registry-type values cross the remote boundary. Display titles are derived locally, remote prose/files/unknown fields are discarded, and every result carries a data-only instruction boundary.

The server contains no shell, package execution or filesystem-write primitive. Package installation remains under the host coding agent's ordinary permissions.
