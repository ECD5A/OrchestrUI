# OrchestrUI 0.1.0

OrchestrUI is an agent-facing UI orchestration layer that helps coding agents choose and integrate the smallest coherent set of tools across seven frontend ecosystems.

## Highlights

- Three reusable Agent Skills for routing, implementation and rendered-UI quality review.
- A read-only MCP server with six bounded tools for catalog lookup, stack recommendations, public component discovery, install guidance and plan auditing.
- Exactly seven supported ecosystems: Kokonut UI, React Bits, daisyUI, Bklit UI, Anime.js, Rive and Magic UI.
- Metadata-only public registry adapters with exact allowlists, response and timeout limits, normalization, short-lived caching and verified offline fallbacks.
- Codex plugin metadata, npm packaging metadata and MCP Registry metadata prepared for maintainer-controlled publication.
- Original OrchestrUI identity assets, README showcase and reproducible SVG-to-PNG rendering.
- CI, schema validation, typechecking, unit/protocol tests, optional live smoke tests and release packaging checks.

## Safety and licensing

- MCP tools do not execute install commands or write to the filesystem.
- React Bits components and other upstream collections are not mirrored or redistributed.
- Paid, Pro, authenticated and credentialed upstream content is excluded.
- Rive runtime licensing is kept separate from the rights to individual `.riv` assets.
- All upstream names remain the property of their respective owners; no affiliation or endorsement is implied.

## Requirements

- Node.js 20 or newer.
- Git for repository installation.
- Network access only when live public registry lookup is explicitly requested.

See the [README](../README.md), [setup guide](SETUP.md), [security model](SECURITY_MODEL.md) and [publishing guide](PUBLISHING.md) for details.
