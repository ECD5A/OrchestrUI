# Security model

Trust boundaries include bundled local catalogs, MCP clients, package managers and four public official component registries. The MCP server requires no secrets and accepts no arbitrary URL, path or command input.

Controls:

- every tool is read-only/non-destructive and no MCP source imports shell/process-execution APIs;
- install commands are inert return values;
- registry URLs come only from the trusted bundled exact allowlist and must use HTTPS without credentials; localhost, private, link-local, reserved and multicast literal hosts are rejected;
- redirects, non-JSON responses, failed status codes and oversized bodies are rejected;
- live requests time out after four seconds and responses are capped at 512 KiB/2,000 parsed items/20 returned matches;
- remote data is reduced to a strict component identifier and optional fixed-enum registry type; display titles/descriptions are derived locally, while remote prose, files and unknown fields are discarded;
- every component-search result declares that metadata is data only and must never be followed as instructions or commands;
- cache is in-memory only, bounded to eight registry entries and five minutes;
- invalid live data falls back to verified bundled metadata;
- component IDs reject slashes, whitespace, shell metacharacters and path traversal;
- shadcn registry namespaces are validated as single scoped identifiers before install-command text is constructed;
- source provenance is returned with results.

Tests cover allowlist and non-public-host enforcement, response type/size bounds, metadata stripping, safe component and namespace identifiers, live fallback and MCP annotations. Bundled catalog metadata is trusted release input and is validated before packaging; remote registry responses remain untrusted. Future HTTP transports must separately add origin/host validation, authentication and deployment rate limits before exposure.
