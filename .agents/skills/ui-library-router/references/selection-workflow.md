# Selection workflow

1. Record the existing framework, base design system, styling version, token sources, package manager and relevant chart/motion dependencies.
2. Split the request into major roles. Keep base controls, product components, data visualization, marketing effects, bespoke motion and interactive vector graphics separate.
3. Assign one owner to each required role. Keep the host system as owner wherever it already satisfies the need.
4. Remove libraries that duplicate a selected owner. Treat daisyUI versus shadcn-derived bases as a base-system conflict, and Magic UI versus React Bits as overlapping unless one is explicitly limited to a signature effect.
5. Check legal gates before selection: no Pro/authenticated content, no React Bits redistribution, and confirmed rights for every `.riv` asset.
6. Verify current official docs or registry only for the remaining libraries. Record exact component IDs and public source URLs.
7. Produce a compact plan with selected owners, rejected alternatives, risks and the host checks that will prove the result works.

Prefer no new library when the host stack already covers the request.
