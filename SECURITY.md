# Security Policy

## Reporting a vulnerability

**Do not open a public GitHub issue for a suspected vulnerability.**

For the public repository, enable GitHub **Private Vulnerability Reporting** and use the repository Security page / **Report a vulnerability** flow.

If private reporting is temporarily unavailable, open a non-sensitive issue asking for a private security contact **without disclosing exploit details, secrets, tokens or reproduction data**.

## Useful reports

- command/configuration injection in MCP/CLI surfaces;
- unsafe path/file handling;
- SSRF, redirect or allowlist bypass in live registry adapters;
- response-limit, timeout or cache-bound bypass;
- secret exposure;
- supply-chain or registry confusion;
- realistic dependency vulnerabilities;
- bypasses of paid-content/redistribution guardrails;
- unsafe remote fetching or SSRF in current or future adapters.

## Out of scope

- vulnerabilities solely in an upstream project OrchestrUI only links to;
- tests without authorization;
- DoS against third-party services;
- social engineering;
- scanner output without a plausible impact path.

Until 1.0, fixes target the latest `main` and latest tagged release.
