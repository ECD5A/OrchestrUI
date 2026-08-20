<p align="right">
  <a href="README.md">English version</a>
</p>

<div align="center">
  <a href="https://ecd5a.github.io/OrchestrUI/" title="Открыть демонстрацию работы OrchestrUI">
    <img src="assets/social-preview.svg" alt="OrchestrUI — семь UI-экосистем сходятся в один цельный интерфейс" width="100%">
  </a>

  <p><strong>Agent-native оркестрация UI для современных frontend-стеков.</strong></p>

  [![CI](https://github.com/ECD5A/OrchestrUI/actions/workflows/ci.yml/badge.svg)](https://github.com/ECD5A/OrchestrUI/actions/workflows/ci.yml)
  [![License: MIT](https://img.shields.io/badge/license-MIT-111827.svg)](LICENSE)
  [![Agent Skills](https://img.shields.io/badge/agent%20skills-3-4f46e5.svg)](.agents/skills)
  [![UI ecosystems](https://img.shields.io/badge/UI%20ecosystems-7-0f766e.svg)](#экосистемы)
  [![MCP](https://img.shields.io/badge/MCP-read--only%20v2-7c3aed.svg)](docs/MCP_SPEC.md)
</div>

OrchestrUI помогает coding agents изучить существующий frontend, назначить одного владельца каждой UI-роли, получить только одобренные публичные компоненты, согласовать их с design system проекта и проверить готовый интерфейс.

> **Изучить → Распределить роли → Согласовать → Проверить. Использовать только то, что действительно нужно проекту.**

## Экосистемы

| Экосистема | Роль |
|---|---|
| **Kokonut UI** | выборочный product polish для React/shadcn |
| **React Bits** | один выразительный creative effect |
| **daisyUI** | осознанная semantic base для Tailwind |
| **Bklit UI** | charts и data visualization |
| **Anime.js** | bespoke timeline, SVG или scroll motion |
| **Rive** | лицензированная interactive vector/state-machine графика |
| **Magic UI** | animated marketing enhancement |

OrchestrUI — независимый проект, не аффилированный и не одобренный перечисленными upstream-проектами.

## Быстрый старт

Требуются Git и Node.js 20+.

```bash
git clone https://github.com/ECD5A/OrchestrUI.git
cd OrchestrUI
npm ci && npm run check
```

Установить skills:

```bash
# macOS / Linux
bash scripts/install-codex.sh
```

```powershell
# Windows PowerShell
powershell -ExecutionPolicy Bypass -File scripts\install-codex.ps1
```

Использовать из frontend-проекта:

```text
$ui-library-router подбери минимальный совместимый UI-стек.
$ui-orchestrator реализуй согласованный план.
$ui-quality-audit проверь готовый интерфейс.
```

## Skills и MCP

- `ui-library-router` — изучает host project и распределяет роли.
- `ui-orchestrator` — интегрирует одобренные части в единый визуальный язык.
- `ui-quality-audit` — проверяет coherence, accessibility, responsiveness, motion, performance и licensing.
- Read-only MCP — `list_libraries`, `recommend_stack`, `get_library_guidance`, `search_components`, `get_install_instructions` и `audit_plan`.

```bash
npm run build
npm run start:mcp
```

MCP-конфигурация находится в [`.mcp.json`](.mcp.json). Setup, architecture, security, licensing и contribution details находятся в [`docs/`](docs/), [`SECURITY.md`](SECURITY.md), [`THIRD_PARTY.md`](THIRD_PARTY.md) и [`CONTRIBUTING.md`](CONTRIBUTING.md).

MCP server не запускает install commands и не записывает файлы проекта. OrchestrUI не копирует коллекцию React Bits, paid/Pro content, authenticated material, credentials, license keys или сторонние `.riv` assets.

## Поддержать OrchestrUI

Если OrchestrUI полезен в вашей работе, вы можете поддержать дальнейшее развитие и сопровождение проекта:

* TON: `pointoncurve.ton`
* Bitcoin (BTC): `1ECDSA1b4d5TcZHtqNpcxmY8pBH1GgHntN`
* USDT (TRC20): `TUF4vPdB6QkjCvZq18rBL4Qj4dK5ihCN75`

Поддержка полностью добровольна и не изменяет права, предоставленные лицензией MIT.

## Контакты

По вопросам коммерческой интеграции, консультаций, сотрудничества и партнёрства:

<p>
  <a href="mailto:stelmak159@gmail.com" aria-label="Email"><img alt="Email" height="24" src="https://cdn.simpleicons.org/gmail/EA4335"></a>
  &nbsp;
  <a href="https://t.me/ECDS4" aria-label="Telegram"><img alt="Telegram" height="24" src="https://cdn.simpleicons.org/telegram/26A5E4"></a>
  &nbsp;
  <a href="https://github.com/ECD5A/OrchestrUI" aria-label="GitHub repository"><picture><source media="(prefers-color-scheme: dark)" srcset="https://cdn.simpleicons.org/github/FFFFFF"><img alt="GitHub repository" height="24" src="https://cdn.simpleicons.org/github/181717"></picture></a>
</p>

