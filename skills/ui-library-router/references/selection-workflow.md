# Selection workflow

1. Build `HostProfile`: framework and relevant versions, package manager, installed dependency versions, design system, component primitives, chart stack, motion stack, token sources and accessibility constraints.
2. Build `TaskProfile`: application/marketing surface, required capabilities, interaction complexity, data-visualization need, motion requirement, `.riv` rights and task constraints.
3. Call `recommend_stack` with `host_profile` and `task_profile` when MCP is available. Confirm the result reports `structured-profiles`; text-only routing is a compatibility fallback.
4. Review role ownership and candidate-ranking evidence. Keep the host system as owner wherever it already satisfies the role; compare installed reuse, dependency/bundle cost and overlap only after framework, version, conflict and rights gates pass.
5. Remove libraries that duplicate an exclusive owner. Treat daisyUI versus shadcn-derived bases as a base-system conflict, and Magic UI versus React Bits as separate only when React Bits is bounded to one signature effect.
6. Check legal gates before selection: no Pro/authenticated content, no React Bits redistribution, and confirmed rights for every `.riv` asset.
7. Verify current official docs or registry only for the remaining libraries. Record exact component IDs and public source URLs.
8. Produce a compact plan with normalized profiles, selected owners, rejected alternatives and rule IDs, risks and the host checks that will prove the result works.

Prefer no new library when the host stack already covers the request.
