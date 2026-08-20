# Setup

## Codex global skills

macOS/Linux:
```bash
git clone https://github.com/ECD5A/OrchestrUI.git ~/OrchestrUI
cd ~/OrchestrUI
bash scripts/install-codex.sh
```

Windows:
```powershell
git clone https://github.com/ECD5A/OrchestrUI.git $HOME\OrchestrUI
cd $HOME\OrchestrUI
powershell -ExecutionPolicy Bypass -File scripts\install-codex.ps1
```

You may also copy/symlink selected skills into a target repo's `.agents/skills`.

## Source checkout and MCP

Node.js 20 or newer is required.

```bash
npm ci
npm run check
npm run start:mcp
```

The bundled [`.mcp.json`](../.mcp.json) is used by the plugin package. In another MCP host, configure `node` with the absolute path to `dist/mcp/src/server.js`. The process communicates over stdio and writes protocol messages to stdout; diagnostics go to stderr.

## Codex/ChatGPT plugin package

The repository root is a valid plugin folder after `npm run build`. The required manifest is [`.codex-plugin/plugin.json`](../.codex-plugin/plugin.json), skills are in `skills/`, and bundled MCP configuration is in `.mcp.json`.

Local plugin installation and marketplace configuration depend on the current Codex/ChatGPT host. The repository intentionally does not edit a user's personal marketplace during normal setup.

## Development commands

```bash
npm run validate
npm run typecheck
npm test
npm run check
npm run pack:check
```

Network smoke tests are opt-in with `ORCHESTRUI_LIVE_TESTS=1`; normal CI does not depend on upstream availability.
