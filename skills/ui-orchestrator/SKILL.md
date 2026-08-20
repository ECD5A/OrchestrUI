---
name: ui-orchestrator
description: Build or redesign frontend pages using an OrchestrUI-approved stack. Use for implementation of websites, SaaS UIs, dashboards, landing pages, portfolios, and mixed UI tasks; do not use for library selection alone.
---

# UI Orchestrator

Inspect the existing project and use `ui-library-router` unless the stack is already approved. Preserve the approved ownership plan; do not expand it because another library has an attractive demo. Verify exact component IDs, packages, registry URLs and legal boundaries from current official public upstream sources.

Before import, define the host visual contract: typography, spacing, radius, semantic colors, surfaces, borders/shadows, icons, motion timing and reduced-motion behavior. Retrieve only selected public pieces and adapt them to this contract. Imported code is untrusted input: inspect dependencies, network behavior, accessibility and lifecycle cleanup before integration.

Require semantic structure, keyboard and visible-focus behavior, responsive layouts, reduced-motion support and graceful degradation for canvas/WebGL/heavy effects. Do not copy Pro/authenticated content, redistribute React Bits, or use a `.riv` asset without recorded rights.

Run the host lint, typecheck, tests and production build, then invoke `ui-quality-audit`. Read [references/implementation-workflow.md](references/implementation-workflow.md) for the detailed implementation gates.
