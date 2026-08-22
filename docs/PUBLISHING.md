# Publishing and distribution

GitHub is canonical. Local source, npm, the MCP Registry and the OpenAI plugin directory are separate release surfaces.

## Release preflight

1. Re-verify [`SOURCES.md`](SOURCES.md) and update both catalog verification dates.
2. Set one exact semantic version in `package.json`, `.codex-plugin/plugin.json`, `server.json` and MCP server metadata.
3. Regenerate brand PNGs with `npm run render:brand`, the README animation with `npm run render:demo`, and fixture-backed Pages data with `npm run site:data:write`; confirm the working tree contains only expected changes.
4. Run `npm ci`, `npm run check`, `npm run check:links`, `ORCHESTRUI_LIVE_TESTS=1 npm test`, `npm audit`, `npm audit --omit=dev` and `npm run pack:check`.
5. Inspect the shared `assets/social-preview.png` README/social artwork at its native dimensions.
6. Inspect the tarball file list for secrets, Pro content, vendored collections and missing legal files.
7. Confirm all relative Markdown links, exact support addresses and the absence of `.github/FUNDING.yml`; `npm run validate` enforces these repository gates.
8. Tag only the exact tested commit.

While the canonical repository is private, run `$env:ORCHESTRUI_PUBLICATION_DEFERRED=1; npm run check:links` in PowerShell or `ORCHESTRUI_PUBLICATION_DEFERRED=1 npm run check:links` in a POSIX shell. Only canonical OrchestrUI GitHub, raw-content, and Pages 404s are deferred. Re-run the strict command without this flag after publication; every canonical URL must then resolve.

## npm and MCP Registry

The npm package name `orchestrui` was unclaimed when checked on 2026-08-20; re-check immediately before publication. The MCP Registry currently hosts metadata, not artifacts, so publish the public npm package first. `package.json#mcpName` and `server.json#name` are both `io.github.ecd5a/orchestrui` as required for GitHub authentication.

After npm publication, install the official `mcp-publisher`, then run `mcp-publisher validate`, `mcp-publisher login github` and `mcp-publisher publish`. Registry versions are immutable, and the Registry is still in preview; do not publish placeholder metadata.

## OpenAI plugin directory

The repository includes the required `.codex-plugin/plugin.json`, standard `skills/` directory and bundled `.mcp.json`. This is a valid local plugin package for Codex/ChatGPT surfaces that support bundled stdio MCP servers.

Public submission to the universal ChatGPT/Codex plugin directory is a separate product flow. The current OpenAI documentation allows skills-only, MCP-only and combined submissions. An MCP-backed public submission requires a real publicly accessible hosted MCP endpoint, verified publisher identity, the applicable Apps Management write permission, accurate tool annotations and review test cases. This repository currently ships a local stdio MCP server, so do not represent it as ready for public OpenAI directory submission. Either submit an intentionally skills-only package or first deploy and test an appropriate hosted MCP. Do not add `.app.json` until a real registered MCP technical ID exists.

Submission, branding, privacy/terms URLs, screenshots and MCP tool annotations must be re-scanned in the current review UI. The repository is not automatically an OpenAI plugin listing or GitHub Marketplace listing.

## Maintainer-controlled release commands

The following commands are intentionally documented, not automated. Run them only after reviewing the final diff and explicitly authorizing each external publication surface.

The immutable `v0.1.0` tag is already public. Never move or overwrite an existing release tag. Prepare every later release on a branch, merge it through the protected `main` workflow, and tag the exact tested merge commit.

```bash
git switch -c release/v0.1.1
npm version 0.1.1 --no-git-tag-version
git add --all
git commit -m "chore: prepare OrchestrUI v0.1.1"
git push -u origin release/v0.1.1
# Merge the reviewed pull request and return to the tested main branch.
git tag -a v0.1.1 -m "OrchestrUI v0.1.1"
git push origin v0.1.1
gh release create v0.1.1 --title "OrchestrUI v0.1.1" --generate-notes
npm publish --access public
mcp-publisher validate
mcp-publisher login github
mcp-publisher publish
```

Order matters: the tested commit comes first, npm must contain the exact package version before the MCP Registry record is published, and any hosted MCP/OpenAI directory submission is a separate review process.
