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

Version checks use the npm `semver` library, including prerelease ordering. Exact versions are checked directly; declared ranges are compatible only when every allowed version fits the required range. Disjoint ranges are incompatible; partial overlap, missing or malformed declarations remain `unknown` and require verification. A candidate can never win by score when framework, version, ownership, conflict or asset-rights gates fail.

The optimizer exhaustively evaluates capability assignments over the seven-library catalog. Its ordered objective minimizes unassigned capabilities, unverified assignments, additions and distinct libraries, then maximizes policy score (which includes declared dependency/bundle costs). Cost ratings are relative catalog estimates, not measured bytes. Local candidate rank is explanatory; the globally selected candidate can have a lower local rank. The two marketing roles can share Magic UI while retaining separate ownership entries. A single signature-only task still prefers React Bits. Existing external owners remain preserved but pending capability verification; known incompatible owners cannot hide unmet requirements.

Legacy `task`, `existing_stack`, and `constraints` inputs remain supported. Text-only results are marked `legacy-text-inference`; calls that supply only one profile are marked `hybrid-profile-inference`. Both modes return a risk asking the caller to provide both structured profiles.

The committed benchmark covers 50 structured scenarios. A separate 8-case golden set originated in a maintainer-supplied independent review; its shared-marketing expectation was updated for the documented 0.4 objective. An independent coverage oracle tests all 128 capability subsets for minimum cardinality and permutation invariance. Generated host combinations exercise framework, version and asset-rights gates. Three project fixtures exercise host snapshots through routing and audit boundaries. `npm run pack:smoke` installs the built tarball into a temporary consumer and calls all seven tools over stdio.

`audit_plan` reports `pass`, `fail`, or `pending`. Pending rendered checks never increase `verified_score` or `verified_maximum`; evidence must be supplied before they become verified. A recommendation never authorizes package installation.
