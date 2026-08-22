# Read-only MCP specification

Implemented with `@modelcontextprotocol/server` 2.0.0 and the MCP 2026-07-28 stable SDK line. The local transport is stdio; all tools advertise `readOnlyHint: true`, `destructiveHint: false` and `idempotentHint: true`.

| Tool | Purpose | External access |
|---|---|---|
| `list_libraries` | list/filter exactly seven ecosystems | none |
| `recommend_stack` | compute the smallest compatible ownership plan from structured profiles | none |
| `get_library_guidance` | return roles, compatibility, legal and official-source guidance | none |
| `search_components` | search public component metadata with fallback | allowlisted registry GET only |
| `get_install_instructions` | return inert official command text | none; never executes |
| `audit_plan` | verified score plus explicit pending checks | none |

Inputs use bounded Zod schemas. Results contain both model-readable JSON text and `structuredContent`. Unknown library IDs and unsafe component identifiers return tool errors without exposing stack traces.

`recommend_stack` accepts `host_profile` and `task_profile`. It returns normalized profiles, input mode, selected and rejected candidates, role ownership, decisions, evidence-bearing `candidate_rankings`, risks and validation steps. Ranking factors cover policy order, installed evidence, dependency/bundle cost, overlap and bounded version compatibility; hard gates cannot be overridden by score. Bounded text fields remain available for backward compatibility; partial-profile calls report `hybrid-profile-inference` and text-only calls report `legacy-text-inference`.

`audit_plan` uses `pass`, `fail` and `pending`. Callers may attach bounded verification evidence. Pending categories do not increase `verified_score` or `verified_maximum`; blockers are derived only from failed checks.

The MCP audit and the `ui-quality-audit` skill deliberately operate at two different levels. `audit_plan` is an evidence-state contract: a check is verified (`pass`/`fail`) or still unverified (`pending`), with no partial credit. The rendered UI skill uses the separate `0/1/2` review rubric: `1` means an exercised check has an acceptable documented tradeoff, never that evidence is missing. Pending MCP checks must be exercised before they can contribute to the rendered rubric.

Live registry policy: public HTTPS only; exact URL allowlist; no credentials or user-supplied URLs; redirects rejected; JSON content type required; 4-second timeout; 512 KiB maximum response; 2,000-item parse cap; 20-result output cap; five-minute bounded in-memory cache; verified local fallback on failure. Only strict component identifiers and fixed registry-type values cross the remote boundary. Display titles are derived locally, remote prose/files/unknown fields are discarded, and every result carries a data-only instruction boundary.

The server contains no shell, package execution or filesystem-write primitive. Package installation remains under the host coding agent's ordinary permissions.
