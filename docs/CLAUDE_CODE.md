# Claude Code

OrchestrUI's three workflows use the portable Agent Skills directory shape: one `SKILL.md` plus optional `references/` files. Claude Code support can change independently, so prefer a project-local copy and verify the current official Claude Code documentation before relying on host-specific discovery behavior.

## Project-local installation

From the frontend project that should use OrchestrUI, create a local skills directory and copy the three packaged skills from this repository:

```bash
mkdir -p .claude/skills
cp -R /path/to/OrchestrUI/skills/ui-library-router .claude/skills/
cp -R /path/to/OrchestrUI/skills/ui-orchestrator .claude/skills/
cp -R /path/to/OrchestrUI/skills/ui-quality-audit .claude/skills/
```

PowerShell:

```powershell
New-Item -ItemType Directory -Force .claude\skills | Out-Null
Copy-Item -Recurse C:\path\to\OrchestrUI\skills\ui-library-router .claude\skills\
Copy-Item -Recurse C:\path\to\OrchestrUI\skills\ui-orchestrator .claude\skills\
Copy-Item -Recurse C:\path\to\OrchestrUI\skills\ui-quality-audit .claude\skills\
```

Keep the complete directory for each skill so its progressive-disclosure references remain available. Do not copy only `SKILL.md`.

## MCP configuration

OrchestrUI ships a local stdio server, not a hosted endpoint. Build it with `npm ci && npm run build`, then use the current Claude Code MCP configuration flow to register:

- command: `node`
- argument: the absolute path to `dist/mcp/src/server.js`
- environment variables: none

The included [`.mcp.json`](../.mcp.json) is the canonical host-neutral configuration example. Never claim that installing the skills also registers the MCP server automatically; these are separate capabilities.

## Compatibility boundary

This guide deliberately avoids undocumented host flags and global configuration paths. OrchestrUI validates its skill structure and MCP protocol behavior in-repository, but Claude Code owns discovery, invocation and configuration behavior in each release.
