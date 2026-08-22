# OrchestrUI 0.3.0 — Explainable candidate ranking

OrchestrUI now explains not only which UI ecosystem wins, but how every admissible candidate was ranked and why a hard compatibility gate rejected an option.

## Highlights

- Multi-candidate routes consider policy order, installed-package evidence, current-plan reuse, dependency cost, bundle cost and role overlap.
- Supplied host versions are checked against bounded compatibility constraints before a candidate can win.
- `recommend_stack` returns `candidate_rankings` with factor-level scores and evidence.
- A candidate already present in the host can outrank an otherwise preferred addition when it remains compatible.
- Eight independently specified adversarial goldens run separately from the 50-case internal policy benchmark.
- All three executable fixtures now include installed dependency versions and captured ranking evidence.
- The npm archive excludes heavyweight promotional renders that are unnecessary at runtime.

## Compatibility

- The MCP server remains read-only and keeps the existing six-tool surface.
- Existing text and partial-profile inputs remain supported; full `HostProfile` and `TaskProfile` input provides the strongest evidence.
- New response fields are additive. Existing selected/rejected and role-ownership fields remain available.
- Node.js 20 or newer is required.

## Safety and licensing

- Ranking scores never override framework, version, ownership, conflict or asset-rights gates.
- No upstream component collection is mirrored or redistributed.
- Paid, Pro, authenticated and credentialed upstream content remains excluded.
- Rive runtime licensing remains separate from rights to individual `.riv` assets.

See the [README](../README.md), [routing guide](ROUTING.md), [MCP specification](MCP_SPEC.md), [security model](SECURITY_MODEL.md) and [publishing guide](PUBLISHING.md).
