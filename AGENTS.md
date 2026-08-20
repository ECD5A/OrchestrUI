# OrchestrUI repository instructions

## Mission
OrchestrUI is an agent-facing UI/UX orchestration layer for Kokonut UI, React Bits, daisyUI, Bklit UI, Anime.js, Rive, and Magic UI. It is not a vendor dump.

## Source of truth
- Current official upstream docs/repos are authoritative.
- Verify package names, registry URLs, component IDs, MCP setup and licenses before changing integrations.
- Keep `catalog/*.json` machine-readable.

## Legal guardrails
- Never vendor or redistribute the React Bits component collection from OrchestrUI.
- Never copy paid/Pro content, credentials, authenticated registry material or license keys.
- Treat Rive runtime licensing separately from `.riv` asset rights.
- Do not imply upstream endorsement or partnership.

## Routing principles
- Inspect the host project first.
- Existing design systems win unless migration is explicit.
- Use the fewest libraries needed.
- Give each major UI role one owner.
- Bklit is the preferred chart/data-viz specialist.
- Add Anime.js only when built-in/CSS motion is insufficient.
- Use Rive only for meaningful interactive vector/state-machine graphics with known asset rights.
- Avoid accidental daisyUI/shadcn base-system conflicts.
- Accessibility, responsiveness, performance and coherence outrank novelty.

## Workflow
1. Read `.agents/skills/ui-library-router/SKILL.md`.
2. Inspect the host stack and produce a short selection plan.
3. Read `.agents/skills/ui-orchestrator/SKILL.md`.
4. Retrieve current official upstream information only for selected libraries.
5. Harmonize typography, spacing, radius, color, surfaces, shadows and motion.
6. Implement responsive and accessible behavior.
7. Run host-project checks.
8. Read `.agents/skills/ui-quality-audit/SKILL.md` before completion.

## Repository gates
- `npm run validate`
- `npm test`
- exactly seven core libraries
- valid skill frontmatter
- no secrets, paid/Pro source or mirrored component collections
