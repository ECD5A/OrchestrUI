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

The policy catalog maps seven capabilities to explicit roles and ordered candidates. Exclusive roles preserve a declared host owner. Host and selected-library incompatibilities are also catalog data, so the engine can state which rule rejected a candidate and which owner caused the conflict. `profile_diagnostics` calls out missing framework, inferred input and unknown version evidence without pretending that missing data is a pass.

Every candidate is evaluated against hard gates before ranks are assigned. Only admissible candidates receive an `eligible` rank; blocked candidates keep `rank: null` and expose `blocked_by`. Admissible candidates are then scored using policy order, installed-package or primitive reuse, dependency cost, bounded bundle cost, role overlap, task-wide capability coverage and declared host-version constraints. The result exposes `candidate_rankings`, `capability_coverage`, `unmet_requirements` and `plan_metrics`, so callers can inspect the whole combination instead of trusting an opaque winner.

The semver evaluator accepts exact versions, comparator sets, caret/tilde ranges and OR clauses. Missing host versions remain explicitly `unknown`; malformed supplied versions are not silently treated as compatible. A candidate can never win by score when framework, version, ownership, conflict or asset-rights gates fail.

Legacy `task`, `existing_stack`, and `constraints` inputs remain supported. Text-only results are marked `legacy-text-inference`; calls that supply only one profile are marked `hybrid-profile-inference`. Both modes return a risk asking the caller to provide both structured profiles.

The committed benchmark covers 50 structured scenarios. A separate 8-case adversarial golden set was specified from a maintainer-supplied independent review without importing the routing policy catalog. CI verifies exact selection, expected conflict rejection, ranking winners, one owner per role, and evidence on every decision. Three project fixtures exercise host snapshots through routing and audit boundaries.

`audit_plan` reports `pass`, `fail`, or `pending`. Pending rendered checks never increase `verified_score` or `verified_maximum`; evidence must be supplied before they become verified. A recommendation never authorizes package installation.
