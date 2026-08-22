<p align="right">
  <a href="README.ru.md">Русская версия</a>
</p>

<div align="center">
  <picture>
    <source media="(prefers-reduced-motion: reduce)" srcset="assets/readme-demo.png">
    <img src="assets/readme-demo.gif" alt="Animated OrchestrUI routing demo: inspect a React dashboard, select Bklit UI for charts, harmonize the plan, and verify the result" width="100%">
  </picture>

  <p><strong>Deterministic UI policy and quality gates for coding agents.</strong></p>

  [![CI](https://github.com/ECD5A/OrchestrUI/actions/workflows/ci.yml/badge.svg)](https://github.com/ECD5A/OrchestrUI/actions/workflows/ci.yml)
  [![License: MIT](https://img.shields.io/badge/license-MIT-111827.svg)](LICENSE)
  [![Agent Skills](https://img.shields.io/badge/agent%20skills-3-4f46e5.svg)](.agents/skills)
  [![UI ecosystems](https://img.shields.io/badge/UI%20ecosystems-7-0f766e.svg)](#ecosystems)
  [![MCP](https://img.shields.io/badge/MCP-read--only%20v2-7c3aed.svg)](docs/MCP_SPEC.md)
</div>

OrchestrUI accepts a structured `HostProfile` and `TaskProfile`, preserves existing design/chart/motion owners, and computes the smallest admissible UI composition with evidence for every selection and rejection.

`HostProfile + TaskProfile → policy matrix → role ownership → conflicts → recommendation + evidence`

```json
{
  "input_mode": "structured-profiles",
  "selected": [{ "id": "bklit-ui", "role": "data-visualization" }],
  "role_ownership": {
    "base-system": "host:shadcn-ui",
    "data-visualization": "bklit-ui"
  },
  "rejected": [{
    "id": "daisyui",
    "rule_id": "base-system-conflict",
    "conflicting_owner": "host:shadcn-ui"
  }]
}
```

The committed routing benchmark currently passes **50/50** structured scenarios and three project fixtures in CI.

## Ecosystems

| Ecosystem | Role |
|---|---|
| **Kokonut UI** | selective React/shadcn product polish |
| **React Bits** | one signature creative effect |
| **daisyUI** | intentional Tailwind semantic base |
| **Bklit UI** | charts and data visualization |
| **Anime.js** | bespoke timeline, SVG, or scroll motion |
| **Rive** | licensed interactive vector/state-machine graphics |
| **Magic UI** | animated marketing enhancement |

OrchestrUI is independent and is not affiliated with or endorsed by these upstream projects.

## Quick start

Requires Git and Node.js 20+.

```bash
git clone https://github.com/ECD5A/OrchestrUI.git
cd OrchestrUI
npm ci && npm run check
npm run benchmark
```

Install the skills:

```bash
# macOS / Linux
bash scripts/install-codex.sh
```

```powershell
# Windows PowerShell
powershell -ExecutionPolicy Bypass -File scripts\install-codex.ps1
```

Use them from a frontend project:

```text
$ui-library-router plan the smallest compatible UI stack.
$ui-orchestrator implement the approved plan.
$ui-quality-audit audit the rendered result.
```

## Skills and MCP

- `ui-library-router` — inspects the host and assigns role ownership.
- `ui-orchestrator` — integrates approved pieces into one visual contract.
- `ui-quality-audit` — checks coherence, accessibility, responsiveness, motion, performance, and licensing.
- Read-only MCP — `list_libraries`, `recommend_stack`, `get_library_guidance`, `search_components`, `get_install_instructions`, and `audit_plan`.

```bash
npm run build
npm run start:mcp
```

MCP configuration is in [`.mcp.json`](.mcp.json). Setup, architecture, security, licensing, and contribution details live in [`docs/`](docs/), [`SECURITY.md`](SECURITY.md), [`THIRD_PARTY.md`](THIRD_PARTY.md), and [`CONTRIBUTING.md`](CONTRIBUTING.md).

The MCP server does not execute install commands or write project files. OrchestrUI never mirrors the React Bits collection, paid/Pro content, authenticated material, credentials, license keys, or third-party `.riv` artwork.

## Support

If OrchestrUI helps your work, you can support its ongoing maintenance:

* TON: `pointoncurve.ton`
* Bitcoin (BTC): `1ECDSA1b4d5TcZHtqNpcxmY8pBH1GgHntN`
* USDT (TRC20): `TUF4vPdB6QkjCvZq18rBL4Qj4dK5ihCN75`

## Contact

For questions about OrchestrUI, integration, consulting, or collaboration:

<p>
  <a href="mailto:stelmak159@gmail.com" aria-label="Email"><img alt="Email" height="24" src="https://cdn.simpleicons.org/gmail/EA4335"></a>
  &nbsp;
  <a href="https://t.me/ECDS4" aria-label="Telegram"><img alt="Telegram" height="24" src="https://cdn.simpleicons.org/telegram/26A5E4"></a>
  &nbsp;
  <a href="https://github.com/ECD5A/OrchestrUI" aria-label="GitHub repository"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cdn.simpleicons.org/github/FFFFFF"><img alt="GitHub repository" height="24" src="https://cdn.simpleicons.org/github/181717"></picture></a>
</p>
