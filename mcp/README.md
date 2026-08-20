# OrchestrUI MCP

The production source is in `src/` and uses the stable Model Context Protocol TypeScript SDK v2.

```bash
npm ci
npm run build
npm run start:mcp
```

The server exposes six read-only tools over stdio. It never executes install commands. See [`../docs/MCP_SPEC.md`](../docs/MCP_SPEC.md) for the contract and [`../docs/SECURITY_MODEL.md`](../docs/SECURITY_MODEL.md) for trust boundaries.

Normal tests are offline and deterministic. Run the optional public-registry smoke test explicitly:

```bash
ORCHESTRUI_LIVE_TESTS=1 npm test
```

On Windows PowerShell:

```powershell
$env:ORCHESTRUI_LIVE_TESTS = "1"
npm test
```
