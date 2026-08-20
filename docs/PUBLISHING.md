# Publishing and distribution

GitHub is canonical. Local source, npm, the MCP Registry and the OpenAI plugin directory are separate release surfaces.

## Release preflight

1. Re-verify [`SOURCES.md`](SOURCES.md) and update both catalog verification dates.
2. Set one exact semantic version in `package.json`, `.codex-plugin/plugin.json`, `server.json` and MCP server metadata.
3. Regenerate brand PNGs with `npm run render:brand` and confirm the working tree contains only expected changes.
4. Run `npm ci`, `npm run check`, `npm run check:links`, `ORCHESTRUI_LIVE_TESTS=1 npm test`, `npm audit`, `npm audit --omit=dev` and `npm run pack:check`.
5. Inspect `assets/readme-hero.png` and `assets/social-preview.png` at their native dimensions.
6. Inspect the tarball file list for secrets, Pro content, vendored collections and missing legal files.
7. Confirm all relative Markdown links, exact support addresses and the absence of `.github/FUNDING.yml`; `npm run validate` enforces these repository gates.
8. Tag only the exact tested commit.

Before the canonical repository is public, `npm run check:links` reports `github.com/ECD5A/OrchestrUI` URLs as publication-deferred rather than broken. Re-run it after publication; those URLs must then resolve.

## npm and MCP Registry

The npm package name `orchestrui` was unclaimed when checked on 2026-08-20; re-check immediately before publication. The MCP Registry currently hosts metadata, not artifacts, so publish the public npm package first. `package.json#mcpName` and `server.json#name` are both `io.github.ecd5a/orchestrui` as required for GitHub authentication.

After npm publication, install the official `mcp-publisher`, then run `mcp-publisher validate`, `mcp-publisher login github` and `mcp-publisher publish`. Registry versions are immutable, and the Registry is still in preview; do not publish placeholder metadata.

## OpenAI plugin directory

The repository includes the required `.codex-plugin/plugin.json`, standard `skills/` directory and bundled `.mcp.json`. This is a valid local plugin package for Codex/ChatGPT surfaces that support bundled stdio MCP servers.

Public submission to the universal ChatGPT/Codex plugin directory is a separate product flow. The current OpenAI documentation allows skills-only, MCP-only and combined submissions. An MCP-backed public submission requires a real publicly accessible hosted MCP endpoint, verified publisher identity, the applicable Apps Management write permission, accurate tool annotations and review test cases. This repository currently ships a local stdio MCP server, so do not represent it as ready for public OpenAI directory submission. Either submit an intentionally skills-only package or first deploy and test an appropriate hosted MCP. Do not add `.app.json` until a real registered MCP technical ID exists.

Submission, branding, privacy/terms URLs, screenshots and MCP tool annotations must be re-scanned in the current review UI. The repository is not automatically an OpenAI plugin listing or GitHub Marketplace listing.

## Maintainer-controlled release commands

The following commands are intentionally documented, not automated. Run them only after reviewing the final diff and explicitly authorizing each external publication surface.

The current local branch contains one pre-publication baseline commit. Amend that local-only commit so the first pushed history contains one clean public release commit rather than exposing construction history.

```bash
git add --all
git commit --amend -m "feat: initial OrchestrUI public release"
git tag -a v0.1.0 -m "OrchestrUI v0.1.0"
git push origin main
git push origin v0.1.0
gh release create v0.1.0 --title "OrchestrUI v0.1.0" --notes-file docs/RELEASE_NOTES_0.1.0.md
npm publish --access public
mcp-publisher validate
mcp-publisher login github
mcp-publisher publish
```

Order matters: the tested commit comes first, npm must contain the exact package version before the MCP Registry record is published, and any hosted MCP/OpenAI directory submission is a separate review process.
