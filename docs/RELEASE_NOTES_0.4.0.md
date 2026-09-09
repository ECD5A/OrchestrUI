# OrchestrUI 0.4.0 — Task-wide routing and project inspection

OrchestrUI now evaluates the whole UI task before selecting libraries, inspects local project metadata, and distinguishes verified compatibility from unresolved requirements.

## Highlights

- Exhaustive assignment across the seven-library catalog minimizes uncovered capabilities, unknown compatibility, additions and library count before policy scores. Marketing motion and a signature effect can share one library while keeping separate role ownership.
- The new read-only `inspect_project` tool extracts a HostProfile from bounded local JSON metadata, with declared-versus-locked version evidence and diagnostics.
- npm semver replaces the custom parser. Prereleases and partial or ambiguous version ranges no longer receive incorrect compatibility results.
- Incompatible existing owners produce explicit unmet requirements. Unknown compatibility and unverified external owners remain pending.
- Independent checks cover all 128 capability subsets, input permutations and generated framework/version/rights combinations.
- Package verification installs the built tarball in an isolated consumer and exercises all seven MCP tools over stdio on the CI platforms.
- Ordinary Markdown changes avoid dependency installation and code builds; skills, agent instructions and executable files retain full checks.

## Compatibility

- Node.js 20 or newer is required. The server remains local stdio and read-only.
- The six existing tools and legacy text inputs remain available; `inspect_project` is the seventh tool.
- New response fields include coverage verification, pending requirements and optimization evidence. Ineligible candidates use `rank: null`; a local rank does not necessarily identify the globally selected candidate. Use `outcome: selected`.
- Start the server in the frontend project directory. Inspection can read relative subdirectories inside that workspace; it does not execute project configuration or scripts.
- Re-run recommendations when upgrading: whole-task selection can intentionally use fewer libraries than 0.3.0.

## Safety and licensing

- Ranking scores never override framework, version, ownership, conflict or asset-rights gates.
- No upstream component collection, paid, Pro or authenticated content is bundled.
- Rive runtime licensing remains separate from rights to individual `.riv` assets.
- OrchestrUI remains MIT-licensed; the added npm semver dependency is ISC-licensed.

Documentation: [README](https://github.com/ECD5A/OrchestrUI#readme) · [Routing](https://github.com/ECD5A/OrchestrUI/blob/main/docs/ROUTING.md) · [MCP specification](https://github.com/ECD5A/OrchestrUI/blob/main/docs/MCP_SPEC.md)

## Contact

For questions about OrchestrUI, integration, consulting, or collaboration:

<p>
  <a href="mailto:stelmak159@gmail.com" aria-label="Email"><img alt="Email" height="24" src="https://cdn.simpleicons.org/gmail/EA4335"></a>
  &nbsp;
  <a href="https://t.me/ECDS4" aria-label="Telegram"><img alt="Telegram" height="24" src="https://cdn.simpleicons.org/telegram/26A5E4"></a>
  &nbsp;
  <a href="https://github.com/ECD5A/OrchestrUI" aria-label="GitHub repository"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cdn.simpleicons.org/github/FFFFFF"><img alt="GitHub repository" height="24" src="https://cdn.simpleicons.org/github/181717"></picture></a>
</p>
