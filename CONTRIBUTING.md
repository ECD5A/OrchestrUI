# Contributing to OrchestrUI

Small fixes, docs, examples and tests are welcome, including your first open-source contribution. You do not need prior approval for a small PR.

For a new ecosystem or an architectural change, [open an issue](https://github.com/ECD5A/OrchestrUI/issues/new/choose) first so we can agree on scope before you spend time implementing it. If you are unsure where to start, ask in [Discussions](https://github.com/ECD5A/OrchestrUI/discussions).

## Your first PR

1. Fork the repository on GitHub and clone your fork.
2. Create a branch and make one focused change.
3. Run the checks below for the files you changed.
4. Open a PR explaining the problem, the change and what you checked. Draft PRs are welcome for early feedback.

For code contributions, use Node.js 20 or newer:

```bash
git clone https://github.com/YOUR_USERNAME/OrchestrUI.git
cd OrchestrUI
git switch -c fix/short-description
npm ci
npm run check
```

For ordinary Markdown edits, Node.js is enough to run `npm run check:docs`; dependency installation and code tests are unnecessary.

## What to check

- **Code or behavioral skills:** run `npm run check`.
- **Ordinary Markdown:** run `npm run check:docs`. If external links changed, also run `npm run check:links`.
- **MCP or package behavior:** also run `npm run pack:smoke`.
- **Registry adapters:** include mocked failure cases and run the optional live smoke test described in the [MCP guide](mcp/README.md). If upstream access fails, mention it in the PR.
- **Catalog or integrations:** cite the official sources you checked and review [licensing boundaries](docs/LICENSING.md).

Keep secrets and third-party component collections out of patches. [AGENTS.md](AGENTS.md) explains the routing invariants for behavioral changes. Version bumps are handled during release preparation; ordinary contributions do not need one.

## Useful places to contribute

Routing and compatibility live in `mcp/src/` and `catalog/`; reproducible cases live in `test/`, `benchmark/` and `examples/fixtures/`. Setup improvements, clearer docs and reports of confusing behavior are equally useful. Start with the [documentation index](docs/README.md).

Report suspected vulnerabilities privately through [SECURITY.md](SECURITY.md).
