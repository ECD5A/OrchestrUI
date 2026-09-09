# Roadmap

This roadmap describes the 0.4.0 source line. Package and MCP Registry badges in the README show the currently published version. Checked items are implemented; unchecked items remain future work.

## 0.1 — Initial public source
- [x] Seven-library catalog and routing rules
- [x] Three Agent Skills
- [x] Codex install scripts
- [x] OSS/community/security baseline
- [x] validation, typecheck, MCP protocol tests and optional live smoke tests
- [x] final brand assets/social preview
- [x] first tagged public release

## 0.2 — Live discovery
- [x] official public registry adapters for structured upstreams
- [x] source provenance and verified fallbacks
- [x] allowlists, response limits, timeouts and graceful fallback
- [x] compatibility metadata

## 0.3 — MCP
- [x] read-only MCP TypeScript SDK v2 server
- [x] `list_libraries`
- [x] `recommend_stack`
- [x] `get_library_guidance`
- [x] `search_components`
- [x] `get_install_instructions`
- [x] `audit_plan`

## 0.3 — Distribution (shipped)
- [x] npm package publication with verified install smoke test
- [x] Codex/ChatGPT plugin manifest and bundled MCP configuration
- [x] MCP Registry publication as `io.github.ECD5A/orchestrui`
- [x] versioned GitHub releases with attached npm artifacts
- [ ] hosted MCP registration and OpenAI plugin review if a universal listing is desired
- [ ] additional agent-host guides based on real adoption

## 0.3 — Structured policy proof (shipped)
- [x] structured HostProfile and TaskProfile routing
- [x] declarative role ownership and conflict policy
- [x] evidence-bearing selected and rejected decisions
- [x] 50-scenario routing benchmark
- [x] three executable routing fixtures
- [x] pending audit checks excluded from verified scores
- [x] formal separation between MCP evidence states and the rendered `0/1/2` audit rubric

## 0.4 — Routing and release hardening
- [x] Exhaustive task-wide minimum-set selection with explicit objective evidence
- [x] npm semver compatibility and explicit pending/unmet capability states
- [x] Bounded read-only project metadata inspection with provenance
- [x] Independent 128-subset minimum-set oracle and generated hard-gate cases
- [x] Isolated tarball installation and seven-tool stdio smoke across CI platforms
- [x] Lightweight Markdown CI with full checks for behavioral skills and code

## Next — Adoption evidence
- [ ] one rendered end-to-end frontend case study with captured before/after evidence
- [x] multi-candidate ranking by compatibility, installed ownership, dependency cost, overlap and semver constraints
- [x] independently authored adversarial golden cases alongside the internal policy benchmark
- [ ] additional agent-host guides based on real adoption

## 1.0 — Stability
- [ ] stable catalog schema and MCP API
- [x] compatibility policy baseline
- [x] reproducible local release checks
- [x] pre-release independent security review
- [ ] API stability period
