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

`HostProfile` records the framework and versions, package manager, design system, component primitives, motion stack, chart stack, tokens, and accessibility constraints. `TaskProfile` records required capabilities, surface type, interaction complexity, data-visualization need, motion requirement, asset rights, and constraints.

The policy catalog maps seven capabilities to explicit roles and ordered candidates. Exclusive roles preserve a declared host owner. Host and selected-library incompatibilities are also catalog data, so the engine can state which rule rejected a candidate and which owner caused the conflict.

Legacy `task`, `existing_stack`, and `constraints` inputs remain supported. Text-only results are marked `legacy-text-inference`; calls that supply only one profile are marked `hybrid-profile-inference`. Both modes return a risk asking the caller to provide both structured profiles.

The committed benchmark covers 50 structured scenarios. CI verifies exact selection, expected conflict rejection, one owner per role, and rule evidence on every decision. Three project fixtures exercise host snapshots through routing and audit boundaries.

`audit_plan` reports `pass`, `fail`, or `pending`. Pending rendered checks never increase `verified_score` or `verified_maximum`; evidence must be supplied before they become verified. A recommendation never authorizes package installation.
