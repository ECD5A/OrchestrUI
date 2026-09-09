# Publishing and distribution

GitHub is canonical. Local source, npm, the MCP Registry and the OpenAI plugin directory are separate release surfaces.

## Release preflight

1. Review [`SOURCES.md`](SOURCES.md). Re-verify upstream metadata when changing integrations; update catalog dates only after actually checking every referenced ecosystem.
2. Set one exact semantic version in `package.json`, `.codex-plugin/plugin.json`, `server.json` and MCP server metadata.
3. Regenerate fixture-backed Pages data with `npm run site:data:write`. Run `npm run render:brand` only when the SVG brand source changes.
4. Run `npm ci`, `npm run check`, `npm run check:links`, `ORCHESTRUI_LIVE_TESTS=1 npm test`, `npm audit`, `npm audit --omit=dev` and `npm run pack:smoke`. The smoke test installs the actual tarball in a fresh temporary consumer and calls all seven tools over stdio; `pack:check` is only a dry-run file listing.
5. If artwork changes, inspect the README hero (`.github/assets/orchestrui-readme-pro.gif`) and social preview (`assets/social-preview.png`) separately.
6. Inspect the tarball file list for secrets, Pro content, vendored collections and missing legal files.
7. Confirm all relative Markdown links, exact support addresses and the absence of `.github/FUNDING.yml`; `npm run validate` enforces these repository gates.
8. Tag only the exact tested commit.

While the canonical repository is private, run `$env:ORCHESTRUI_PUBLICATION_DEFERRED=1; npm run check:links` in PowerShell or `ORCHESTRUI_PUBLICATION_DEFERRED=1 npm run check:links` in a POSIX shell. Only canonical OrchestrUI GitHub, raw-content, and Pages 404s are deferred. Re-run the strict command without this flag after publication; every canonical URL must then resolve.

## npm and MCP Registry

The MCP Registry currently hosts metadata, not artifacts, so publish the public npm package first. `package.json#mcpName` and `server.json#name` must both be `io.github.ECD5A/orchestrui`; the GitHub owner segment is case-sensitive during Registry authorization.

The repository includes `.github/workflows/publish-npm.yml` for npm Trusted Publishing. On npmjs.com open the `orchestrui` package settings, add a GitHub Actions trusted publisher, and enter organization/user `ECD5A`, repository `OrchestrUI`, workflow filename `publish-npm.yml`, with direct publishing allowed. No npm token or SSH key is stored in GitHub. The workflow uses GitHub OIDC and Node 24, runs `npm run check`, and publishes the selected tag. For an existing release that has not reached npm, dispatch the workflow with its exact tag. Published GitHub Releases trigger it automatically. npm requires CLI 11.5.1+ and Node 22.14+ for trusted publishing.

After npm publication, install the official `mcp-publisher`, then run `mcp-publisher validate`, `mcp-publisher login github` and `mcp-publisher publish`. Registry versions are immutable, and the Registry is still in preview; do not publish placeholder metadata.

## OpenAI plugin directory

The repository includes the required `.codex-plugin/plugin.json`, standard `skills/` directory and bundled `.mcp.json`. This is a valid local plugin package for Codex/ChatGPT surfaces that support bundled stdio MCP servers.

Public submission to the universal ChatGPT/Codex plugin directory is a separate product flow. The current OpenAI documentation allows skills-only, MCP-only and combined submissions. An MCP-backed public submission requires a real publicly accessible hosted MCP endpoint, verified publisher identity, the applicable Apps Management write permission, accurate tool annotations and review test cases. This repository currently ships a local stdio MCP server, so do not represent it as ready for public OpenAI directory submission. Either submit an intentionally skills-only package or first deploy and test an appropriate hosted MCP. Do not add `.app.json` until a real registered MCP technical ID exists.

Submission, branding, privacy/terms URLs, screenshots and MCP tool annotations must be re-scanned in the current review UI. The repository is not automatically an OpenAI plugin listing or GitHub Marketplace listing.

## Maintainer-controlled release commands

GitHub Release publication triggers the npm workflow. MCP Registry publication is a separate step after npm succeeds.

Published release tags are immutable: never move or overwrite one after an npm, MCP Registry or GitHub Release record exists. Prepare every release on a branch, merge it through the protected `main` workflow, and tag the exact tested merge commit.

```bash
release_version=x.y.z
git switch -c "release/v${release_version}"
npm version "${release_version}" --no-git-tag-version
# Synchronize server.json and .codex-plugin/plugin.json, then run release preflight.
git add --all
git commit -m "chore: prepare OrchestrUI v${release_version}"
git push -u origin "release/v${release_version}"
# Merge the reviewed pull request and return to the tested main branch.
git tag -a "v${release_version}" -m "OrchestrUI v${release_version}"
git push origin "v${release_version}"
gh release create "v${release_version}" --title "OrchestrUI v${release_version}" --notes-file "docs/RELEASE_NOTES_${release_version}.md"
# Wait for publish-npm.yml to succeed, then verify the exact version on npm.
npm view "orchestrui@${release_version}" version dist.integrity
# Attach the published npm archive to the GitHub Release.
npm pack "orchestrui@${release_version}" --ignore-scripts
gh release upload "v${release_version}" "orchestrui-${release_version}.tgz"
mcp-publisher validate
mcp-publisher login github
mcp-publisher publish
```

Order matters: the tested commit comes first, npm must contain the exact package version before the MCP Registry record is published, and any hosted MCP/OpenAI directory submission is a separate review process.

## Repository maintenance

Keep required checks and linear history enabled on `main`, delete merged branches, and maintain Issues, security reporting, Dependabot and code scanning. Repository settings are the source of truth for their current status.

The homepage points to GitHub Pages. The optional GitHub social preview can be uploaded from `assets/social-preview.png` (1280 × 640).
