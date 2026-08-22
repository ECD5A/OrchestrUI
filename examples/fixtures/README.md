# End-to-end routing fixtures

Each fixture records a realistic host-project snapshot, installed dependency versions, a structured `HostProfile`, a structured `TaskProfile`, and policy expectations. CI executes the real routing engine against every fixture and verifies ranking evidence, selection, rejection, existing owners, role ownership, and audit pending-state behavior.

Each committed `result.json` contains the actual recommendation, rule evidence and audit output. Verify or rebuild them with `npm run fixtures` and `npm run fixtures:write`.

These fixtures prove routing behavior. They do not claim that a frontend was rendered or visually audited; rendered evidence must be attached separately before a fixture can be promoted to a completed implementation case study.
