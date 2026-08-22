# Brand assets

OrchestrUI uses a restrained visual system: inspect the host, make one scoped UI decision, then verify the coherent plan. The mark is original project artwork and does not reuse upstream logos.

## Files

- `icon.svg` — square application/favicon mark.
- `logo.svg` — horizontal project lockup.
- `readme-demo.gif` — generated 960×540 standards-compatible animated README walkthrough, kept below a 400 KB repository budget.
- `readme-demo.png` — static final frame for documentation and fallback use.
- `.github/assets/orchestrui-readme-pro.gif` — authored 1100×619 README hero kept outside the published npm package.
- `social-preview.svg` — editable 1280×640 artwork for the GitHub social preview.
- `social-preview.png` — generated upload-ready rendering of the same artwork.

## Visual system

- Ink: `#08111F`
- Panel: `#0D1728`
- Indigo: `#7667F4`
- Cyan: `#22D3EE`
- Mint: `#2DD4BF`
- Primary text: `#F8FAFC`
- Secondary text: `#A8B3C7`

Typography uses a system sans-serif stack so the SVGs remain self-contained. Keep generous negative space, crisp routing geometry and limited color. Do not add generic robot/brain imagery, stock assets, upstream logos or claims of partnership.

Regenerate the static social preview after editing the SVG source:

```bash
npm run render:brand
```

Regenerate the animated README walkthrough:

```bash
npm run render:demo
```
