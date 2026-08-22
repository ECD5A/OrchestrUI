# OrchestrUI 0.2.1 — Registry publication fix

This patch release corrects the case-sensitive MCP Registry namespace used for GitHub publisher authorization.

## Fixed

- Changed the registry identity from `io.github.ecd5a/orchestrui` to `io.github.ECD5A/orchestrui`.
- Kept npm, plugin and MCP metadata on one exact `0.2.1` version.

All routing behavior, read-only safety boundaries and the seven-library catalog remain unchanged from `0.2.0`.
