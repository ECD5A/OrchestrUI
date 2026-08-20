# Implementation workflow

## Before changes

- Confirm the approved library owners and exact requested surfaces.
- Capture host tokens, breakpoints, focus treatment, motion primitives and icon system.
- Check current official public installation guidance for selected libraries only.
- Confirm the component is free/public, its dependencies are acceptable, and any Rive artwork has known rights.

## Integration

- Install or retrieve only the selected component/package through its official public path.
- Review imported files as third-party input. Remove demo-only styles, hard-coded brand tokens, unnecessary dependencies and unsafe remote loading.
- Map colors, type, spacing, radius, surfaces and motion to host tokens; keep one owner per role.
- Preserve semantics and accessible names. Add keyboard behavior, visible focus and escape/close behavior where the interaction requires them.
- Add responsive and empty/loading/error behavior using realistic content lengths.
- Respect `prefers-reduced-motion`; pause or simplify canvas/WebGL effects and clean up listeners, observers, timelines and Rive instances.

## Verification

- Exercise the changed user flow at narrow, medium and wide viewports.
- Run the host lint, typecheck, tests and production build.
- Inspect dependency and bundle impact, console errors, secrets and third-party notices.
- Run `ui-quality-audit` and fix every zero before completion.
