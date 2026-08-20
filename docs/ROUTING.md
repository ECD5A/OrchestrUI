# Routing guide

| Need | Primary | Optional | Usually reject |
|---|---|---|---|
| SaaS analytics | Bklit + existing base | Kokonut | React Bits everywhere |
| Forms/settings | existing base or intentional daisyUI | Kokonut polish | multiple bases |
| Landing page | Magic UI or Kokonut | React Bits signature effect | unrelated dashboard tooling |
| Creative portfolio | React Bits or Magic UI | Anime.js if bespoke | Bklit without data |
| Custom timeline/SVG | Anime.js | native components | Rive unless vector state machine needed |
| Interactive mascot | Rive | host system around it | Rive for ordinary controls |

If two libraries compete for the same major role, remove one unless there is a documented isolation strategy.

The MCP `recommend_stack` tool applies this policy deterministically from bounded task/stack/constraint text. Its result is a recommendation, not authorization to install packages. `audit_plan` provides a provisional score; the rendered `ui-quality-audit` remains required after implementation.
