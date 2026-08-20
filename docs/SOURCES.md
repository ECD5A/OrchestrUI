# Sources checked — 2026-08-20

Re-verify primary sources before release.

## UI ecosystems

- Kokonut UI: https://kokonutui.com/docs | https://kokonutui.com/r/registry.json | https://github.com/kokonut-labs/kokonutui/blob/main/LICENSE
- React Bits: https://reactbits.dev/get-started/introduction | https://reactbits.dev/r/registry.json | https://github.com/DavidHDev/react-bits/blob/main/LICENSE.md
- daisyUI: https://daisyui.com/docs/install/ | https://github.com/saadeghi/daisyui/blob/master/LICENSE
- Bklit UI: https://bklit.com/docs/installation | https://bklit.com/r/registry.json | https://github.com/bklit/bklit-ui/blob/main/LICENSE
- Anime.js: https://animejs.com/documentation/getting-started/installation/ | https://github.com/juliangarnier/anime/blob/master/LICENSE.md
- Rive: https://rive.app/docs/runtimes/react/react | https://github.com/rive-app/rive-react/blob/main/LICENSE
- Magic UI: https://magicui.design/docs/components | https://magicui.design/r/registry.json | https://github.com/magicuidesign/magicui/blob/main/LICENSE.md | https://github.com/magicuidesign/mcp

Verification included official docs, public registry indexes and repository license files. The four registry indexes were fetched directly and every fallback component identifier in `catalog/components.json` was confirmed present on 2026-08-20.

## Codex, plugins and skills

- Skills: https://developers.openai.com/codex/skills/
- Plugin architecture: https://developers.openai.com/plugins/concepts/plugins
- Plugin packaging: https://developers.openai.com/plugins/build/plugins
- Plugin submission: https://developers.openai.com/plugins/deploy/submission
- MCP review requirements: https://developers.openai.com/plugins/deploy/app-review

The checked guidance requires `SKILL.md` name/description metadata, `.codex-plugin/plugin.json` for plugins, a standard `skills/` directory, `.mcp.json` for bundled MCP servers and correct read-only annotations.

## MCP and publication

- MCP TypeScript SDK v2: https://ts.sdk.modelcontextprotocol.io/v2/
- MCP SDK releases: https://github.com/modelcontextprotocol/typescript-sdk/releases
- MCP Registry overview: https://modelcontextprotocol.io/registry/about
- MCP Registry quickstart: https://modelcontextprotocol.io/registry/quickstart
- MCP Registry authentication: https://modelcontextprotocol.io/registry/authentication
- MCP Registry package types: https://modelcontextprotocol.io/registry/package-types

The stable SDK package version and npm dist-tag were also checked directly: `@modelcontextprotocol/server@2.0.0`. The official Registry remains preview, requires a real public artifact before metadata publication, and uses immutable versioned `server.json` records.

The official Registry quickstart was checked again through the upstream `modelcontextprotocol/registry` repository on 2026-08-20. Its current sequence is: publish the npm artifact, install `mcp-publisher`, run `mcp-publisher validate`, authenticate, then publish the metadata record.

## Name-availability snapshot

Structured exact-name checks on 2026-08-20 found no GitHub repository named `OrchestrUI`, no npm package `orchestrui`, no PyPI project `OrchestrUI`, no crates.io crate and no exact NuGet package. These checks reduce obvious software-coordinate collisions; they are not exhaustive and do not constitute legal trademark clearance.

## Build tooling

- `@resvg/resvg-js`: https://github.com/yisibl/resvg-js | MPL-2.0

The renderer is a development-only dependency used to produce the checked-in PNG brand previews from original repository-native SVG files.

## GitHub repository operations

- Community health: https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions
- Private vulnerability reporting: https://docs.github.com/en/code-security/security-advisories/working-with-repository-security-advisories/configuring-private-vulnerability-reporting-for-a-repository
- Dependabot: https://docs.github.com/en/code-security/dependabot
- CodeQL: https://docs.github.com/en/code-security/code-scanning/introduction-to-code-scanning/about-code-scanning-with-codeql

CI action tags were resolved from the official repositories on 2026-08-20 and pinned to full commits: `actions/checkout` v4 at `11d5960a326750d5838078e36cf38b85af677262` and `actions/setup-node` v4 at `49933ea5288caeca8642d1e84afbd3f7d6820020`.
