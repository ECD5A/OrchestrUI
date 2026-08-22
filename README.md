<p align="right">
  <a href="README.ru.md">Русская версия</a>
</p>

<div align="center">
  <img src=".github/assets/orchestrui-readme-pro.gif" alt="Animated OrchestrUI trace: inspect a structured host, route the smallest UI stack, harmonize role ownership, and audit verified evidence" width="1100">

  <p><strong>Deterministic UI policy and quality gates for coding agents.</strong></p>

  [![CI](https://github.com/ECD5A/OrchestrUI/actions/workflows/ci.yml/badge.svg)](https://github.com/ECD5A/OrchestrUI/actions/workflows/ci.yml)
  [![npm](https://img.shields.io/npm/v/orchestrui?logo=npm&color=CB3837)](https://www.npmjs.com/package/orchestrui)
  [![License: MIT](https://img.shields.io/badge/license-MIT-111827.svg)](LICENSE)
  [![Agent Skills](https://img.shields.io/badge/agent%20skills-3-4f46e5.svg)](.agents/skills)
  [![UI ecosystems](https://img.shields.io/badge/UI%20ecosystems-7-0f766e.svg)](#ecosystems)
  [![MCP](https://img.shields.io/badge/MCP-Registry-7c3aed.svg)](https://registry.modelcontextprotocol.io/v0/servers/io.github.ECD5A%2Forchestrui/versions/latest)

  <p>
    <a href="#quick-start">Quick start</a>
    &nbsp;·&nbsp;
    <a href="#output">Output</a>
    &nbsp;·&nbsp;
    <a href="#skills-and-mcp">Skills &amp; MCP</a>
    &nbsp;·&nbsp;
    <a href="#ecosystems">Ecosystems</a>
    &nbsp;·&nbsp;
    <a href="docs/">Docs</a>
  </p>
</div>

OrchestrUI inspects a structured project profile, preserves compatible owners, and returns the smallest admissible UI composition with evidence for every decision.

<a id="quick-start"></a>
## Quick start

Requires Node.js 20+. Add the published read-only server to an MCP host:

```json
{
  "mcpServers": {
    "orchestrui": {
      "command": "npx",
      "args": ["-y", "orchestrui@latest"]
    }
  }
}
```

<details>
<summary><strong>Install skills on macOS / Linux</strong></summary>

```bash
git clone --depth 1 https://github.com/ECD5A/OrchestrUI.git
cd OrchestrUI
bash scripts/install-codex.sh
```

</details>

<details>
<summary><strong>Install skills on Windows</strong></summary>

```powershell
git clone --depth 1 https://github.com/ECD5A/OrchestrUI.git
Set-Location OrchestrUI
powershell -ExecutionPolicy Bypass -File scripts\install-codex.ps1
```

</details>

<details>
<summary><strong>Develop from source</strong></summary>

```bash
git clone https://github.com/ECD5A/OrchestrUI.git
cd OrchestrUI
npm ci && npm run check
npm run benchmark
```

</details>

Use them from a frontend project:

```text
$ui-library-router plan the smallest compatible UI stack.
$ui-orchestrator implement the approved plan.
$ui-quality-audit audit the rendered result.
```

<a id="output"></a>
## What it returns

```json
{
  "input_mode": "structured-profiles",
  "selected": ["bklit-ui"],
  "owners": {
    "base-system": "host:shadcn-ui",
    "data-visualization": "bklit-ui"
  },
  "rejected": [{ "id": "daisyui", "rule": "base-system-conflict" }]
}
```

The committed suite passes **50/50** structured scenarios, **8/8** independently specified adversarial goldens, and three project fixtures in CI.

<a id="skills-and-mcp"></a>
## Skills and MCP

- `ui-library-router` — inspects the host and assigns role ownership.
- `ui-orchestrator` — integrates approved pieces into one visual contract.
- `ui-quality-audit` — checks coherence, accessibility, responsiveness, motion, performance, and licensing.
- Read-only MCP — `list_libraries`, `recommend_stack`, `get_library_guidance`, `search_components`, `get_install_instructions`, and `audit_plan`.

Published through [npm](https://www.npmjs.com/package/orchestrui), the [official MCP Registry](https://registry.modelcontextprotocol.io/v0/servers/io.github.ECD5A%2Forchestrui/versions/latest), and versioned [GitHub Releases](https://github.com/ECD5A/OrchestrUI/releases). Local plugin configuration is in [`.mcp.json`](.mcp.json); setup, architecture, security, licensing, and contribution details live in [`docs/`](docs/), [`SECURITY.md`](SECURITY.md), [`THIRD_PARTY.md`](THIRD_PARTY.md), and [`CONTRIBUTING.md`](CONTRIBUTING.md).

The MCP surface is read-only and uses public upstream metadata; implementation code and third-party assets remain in the host project.

<a id="ecosystems"></a>
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
