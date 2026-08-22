# GitHub setup checklist

Use this checklist immediately before making `ECD5A/OrchestrUI` public. Repository settings remain maintainer-controlled external changes.

- [x] Description: `Deterministic UI policy, discovery and quality gates for coding agents.`
- [x] Homepage: `https://ecd5a.github.io/OrchestrUI/`
- [ ] Public repository with `main` as the default branch
- [x] Issues and Discussions enabled
- [ ] Ruleset/branch protection enabled; require the CI workflow when practical and disable force-pushes/deletion
- [ ] Social preview uploaded from `assets/social-preview.png` (1280 × 640)
- [x] Topics added for UI, frontend, coding agents, MCP, TypeScript, design systems and code quality
- [ ] Private Vulnerability Reporting enabled
- [x] Dependabot alerts and automated security updates enabled
- [ ] Secret scanning/push protection where available
- [ ] CodeQL default setup enabled for JavaScript/TypeScript after the repository becomes public
- [ ] Confirm README/LICENSE/CONTRIBUTING/CODE_OF_CONDUCT/SECURITY detection
- [x] Community and release labels created
- [x] First release published from `v0.1.0`
- [ ] Publish `v0.2.0` from the final tested public commit using `docs/RELEASE_NOTES_0.2.0.md`

## Public launch order

1. Merge the final release-preparation PR and confirm all CI jobs pass.
2. Change repository visibility to public.
3. Enable branch protection/rules, CodeQL default setup, Private Vulnerability Reporting and available secret-scanning protections.
4. Trigger Pages and verify the canonical site.
5. Run strict external-link checks without publication deferral.
6. Tag the tested commit and publish `v0.2.0` with the committed release description.

## Name-availability snapshot

On 2026-08-20, exact-name checks found no `OrchestrUI` repository in GitHub search, no npm package, no PyPI project, no crates.io crate and no exact NuGet package. This is a practical collision check, not a trademark clearance opinion. Re-check the name and package coordinates immediately before publication.

No GitHub Sponsors or `.github/FUNDING.yml` configuration is required; the exact direct-support addresses and donation boundary are in the README.
