# Router examples

Executable project snapshots live in [`fixtures/`](fixtures/):

- `next-shadcn-dashboard` preserves shadcn/ui as base owner and selects Bklit UI only for data visualization.
- `daisy-admin` preserves the existing daisyUI base and rejects Kokonut as a conflicting foundation.
- `marketing-landing` keeps the shadcn/ui base, assigns Magic UI to marketing enhancement and limits React Bits to one signature effect.

Each fixture contains source-state evidence, `HostProfile`, `TaskProfile`, expected selected/rejected libraries, expected role ownership and a reproducible `result.json`. CI executes the real router and then confirms that rendered audit categories remain pending until evidence exists.
