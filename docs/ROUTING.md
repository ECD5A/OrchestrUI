# Structured routing

`recommend_stack` is profile-first. It does not select libraries from prompt keywords when structured profiles are supplied.

```text
HostProfile + TaskProfile
        ↓
capability routes from catalog/routing-rules.json
        ↓
existing role owners + exclusive-role conflicts
        ↓
selected and rejected candidates with rule evidence
```

`HostProfile` records the framework and versions, package manager, installed dependency versions, design system, component primitives, motion stack, chart stack, tokens, and accessibility constraints. `TaskProfile` records required capabilities, surface type, interaction complexity, data-visualization need, motion requirement, asset rights, and constraints.

The policy catalog maps seven capabilities to explicit roles and ordered candidates. Exclusive roles preserve a declared host owner. Host and selected-library incompatibilities are also catalog data, so the engine can state which rule rejected a candidate and which owner caused the conflict.

Each admissible candidate receives a deterministic ranking with evidence for policy order, installed-package or primitive reuse, dependency cost, bounded bundle cost, role overlap and declared host-version constraints. Compatibility, explicit conflicts, exclusive ownership and rights requirements remain hard gates: a high score can never override them. The result exposes `candidate_rankings` so callers can inspect every factor instead of trusting an opaque winner.

Legacy `task`, `existing_stack`, and `constraints` inputs remain supported. Text-only results are marked `legacy-text-inference`; calls that supply only one profile are marked `hybrid-profile-inference`. Both modes return a risk asking the caller to provide both structured profiles.

The committed benchmark covers 50 structured scenarios. A separate 8-case adversarial golden set was specified from a maintainer-supplied independent review without importing the routing policy catalog. CI verifies exact selection, expected conflict rejection, ranking winners, one owner per role, and evidence on every decision. Three project fixtures exercise host snapshots through routing and audit boundaries.

`audit_plan` reports `pass`, `fail`, or `pending`. Pending rendered checks never increase `verified_score` or `verified_maximum`; evidence must be supplied before they become verified. A recommendation never authorizes package installation.
