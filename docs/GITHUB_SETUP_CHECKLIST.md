# GitHub setup checklist

Current public-repository state for `ECD5A/OrchestrUI`. Unchecked items still require a maintainer-controlled visual or product decision.

- [x] Description: `Deterministic UI policy, discovery and quality gates for coding agents.`
- [x] Homepage: `https://ecd5a.github.io/OrchestrUI/`
- [x] Public repository with `main` as the default branch
- [x] Issues and Discussions enabled
- [x] Branch protection enabled with required CI, linear history, conversation resolution, and force-push/deletion protection
- [ ] Social preview uploaded from `assets/social-preview.png` (1280 × 640); GitHub currently serves its generated default card
- [x] Topics added for UI, frontend, coding agents, MCP, TypeScript, design systems and code quality
- [x] Private Vulnerability Reporting enabled
- [x] Dependabot alerts and automated security updates enabled
- [x] Secret scanning and push protection enabled
- [x] CodeQL enabled for JavaScript/TypeScript
- [x] Confirm README/LICENSE/CONTRIBUTING/CODE_OF_CONDUCT/SECURITY detection
- [x] Community and release labels created
- [x] First release published from `v0.1.0`
- [x] Publish `v0.2.0` and the registry-alignment `v0.2.1` patch release from tested commits

## Completed public launch

1. The repository is public and `main` is protected.
2. CI, CodeQL, Dependabot, Private Vulnerability Reporting, secret scanning and push protection are enabled.
3. GitHub Pages is deployed over HTTPS from the pinned workflow.
4. npm and MCP Registry publication are verified independently from a clean install/readback.
5. Tagged GitHub releases contain the exact npm archives.

## Published coordinates

The canonical repository is `ECD5A/OrchestrUI`, npm publishes `orchestrui`, and the official MCP Registry identity is `io.github.ECD5A/orchestrui`. Version `0.2.1` is active across all three release surfaces.

No GitHub Sponsors or `.github/FUNDING.yml` configuration is required; the exact direct-support addresses and donation boundary are in the README.
