---
name: ui-quality-audit
description: Audit an OrchestrUI-based frontend for visual coherence, accessibility, responsiveness, motion discipline, performance, data visualization quality, licensing, and misuse of UI libraries. Use before declaring toolkit-based UI work complete.
---

# UI Quality Audit

Audit the rendered result and implementation, not only the plan. Score each category 0 (blocking), 1 (acceptable with a documented tradeoff) or 2 (release-ready): visual coherence; library discipline; accessibility; responsiveness; motion/reduced-motion; data-viz readability; Rive lifecycle/asset rights; engineering checks/dependencies/secrets; licensing/Pro/React Bits restrictions.

Fix every 0 within scope, rerun affected checks, and then report the score out of 18, evidence, blockers fixed, remaining tradeoffs and checks executed. Do not award points for requirements that were not exercised; mark them not applicable with evidence and score 2 only when absence removes the risk.

Read [references/rubric.md](references/rubric.md) before completing a full audit.
