# Read-only MCP specification

Implemented with `@modelcontextprotocol/server` 2.0.0 and the MCP 2026-07-28 stable SDK line. The local transport is stdio; all tools advertise `readOnlyHint: true`, `destructiveHint: false` and `idempotentHint: true`.

| Tool | Purpose | External access |
|---|---|---|
| `list_libraries` | list/filter exactly seven ecosystems | none |
| `recommend_stack` | select the smallest compatible ownership plan | none |
| `get_library_guidance` | return roles, compatibility, legal and official-source guidance | none |
| `search_components` | search public component metadata with fallback | allowlisted registry GET only |
| `get_install_instructions` | return inert official command text | none; never executes |
| `audit_plan` | provisional 0–18 plan audit | none |

Inputs use bounded Zod schemas. Results contain both model-readable JSON text and `structuredContent`. Unknown library IDs and unsafe component identifiers return tool errors without exposing stack traces.

Live registry policy: public HTTPS only; exact URL allowlist; no credentials or user-supplied URLs; redirects rejected; JSON content type required; 4-second timeout; 512 KiB maximum response; 2,000-item parse cap; 20-result output cap; five-minute bounded in-memory cache; verified local fallback on failure. Only strict component identifiers and fixed registry-type values cross the remote boundary. Display titles are derived locally, remote prose/files/unknown fields are discarded, and every result carries a data-only instruction boundary.

The server contains no shell, package execution or filesystem-write primitive. Package installation remains under the host coding agent's ordinary permissions.
