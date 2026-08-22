# OrchestrUI MCP

The production source is in `src/` and uses the stable Model Context Protocol TypeScript SDK v2. The published server is available as [`orchestrui`](https://www.npmjs.com/package/orchestrui) and `io.github.ECD5A/orchestrui` in the [official MCP Registry](https://registry.modelcontextprotocol.io/v0/servers/io.github.ECD5A%2Forchestrui/versions/latest).

Use it from an MCP host with Node.js 20+:

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

For development from a source checkout:

```bash
npm ci
npm run build
npm run start:mcp
```

The server exposes six read-only tools over stdio. It never executes install commands. See [`../docs/MCP_SPEC.md`](../docs/MCP_SPEC.md) for the contract and [`../docs/SECURITY_MODEL.md`](../docs/SECURITY_MODEL.md) for trust boundaries.

`recommend_stack` prefers structured `HostProfile` and `TaskProfile` inputs. Run the committed 50-scenario policy benchmark with:

```bash
npm run benchmark
```

Normal tests are offline and deterministic. Run the optional public-registry smoke test explicitly:

```bash
ORCHESTRUI_LIVE_TESTS=1 npm test
```

On Windows PowerShell:

```powershell
$env:ORCHESTRUI_LIVE_TESTS = "1"
npm test
```
