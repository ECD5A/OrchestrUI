# Privacy

OrchestrUI is a local, read-only orchestration tool. It does not require an account, API key or user profile and does not include telemetry.

The MCP server reads OrchestrUI's bundled public catalog. When live component search is enabled, it sends only a normal public `GET` request to the selected ecosystem's allowlisted official registry index. Search text, local files, prompts and project contents are not sent to those registries. Responses are bounded and cached only in process memory for up to five minutes. Only strict component identifiers and fixed registry-type values are retained; remote prose, files and unknown fields are discarded before agent-visible output is built.

OrchestrUI does not operate a hosted service or collect personal data. The package manager, GitHub, upstream documentation sites and UI ecosystems used through OrchestrUI have their own privacy practices.

Security reports should follow [SECURITY.md](SECURITY.md).
