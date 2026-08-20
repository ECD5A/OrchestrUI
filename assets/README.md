# Brand assets

OrchestrUI uses a restrained routing system: seven input paths converge through one orchestration node and leave as one coherent output. The mark is original project artwork and does not reuse upstream logos.

## Files

- `icon.svg` — square application/favicon mark.
- `logo.svg` — horizontal project lockup.
- `readme-hero.svg` — editable repository hero source.
- `readme-hero.png` — generated repository hero.
- `social-preview.svg` — editable 1280×640 social-preview source.
- `social-preview.png` — generated GitHub social preview.

## Visual system

- Ink: `#08111F`
- Panel: `#0D1728`
- Indigo: `#7667F4`
- Cyan: `#22D3EE`
- Mint: `#2DD4BF`
- Primary text: `#F8FAFC`
- Secondary text: `#A8B3C7`

Typography uses a system sans-serif stack so the SVGs remain self-contained. Keep generous negative space, crisp routing geometry and limited color. Do not add generic robot/brain imagery, stock assets, upstream logos or claims of partnership.

Regenerate both PNG files locally after editing their SVG sources:

```bash
npm run render:brand
```
