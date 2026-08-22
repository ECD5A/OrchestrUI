/*
 * OrchestrUI — Agent-native UI orchestration for modern frontend stacks.
 * Copyright (c) 2026 ECD5A
 * Licensed under the MIT License.
 * https://github.com/ECD5A/OrchestrUI
 * SPDX-License-Identifier: MIT
 */

import fs from "node:fs";
import { isIP } from "node:net";
import path from "node:path";

const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const catalog = readJson("catalog/libraries.json");
const components = readJson("catalog/components.json");
const routing = readJson("catalog/routing-rules.json");
const packageManifest = readJson("package.json");
const pluginManifest = readJson(".codex-plugin/plugin.json");
const mcpConfig = readJson(".mcp.json");
const serverManifest = readJson("server.json");

const fail = (message) => { throw new Error(message); };
const isNonPublicIpv4 = (hostname) => {
  const parts = hostname.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return true;
  const [a, b, c] = parts;
  return a === 0
    || a === 10
    || a === 127
    || (a === 100 && b >= 64 && b <= 127)
    || (a === 169 && b === 254)
    || (a === 172 && b >= 16 && b <= 31)
    || (a === 192 && (b === 0 || b === 168))
    || (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100)))
    || (a === 203 && b === 0 && c === 113)
    || a >= 224;
};
const isNonPublicIpv6 = (hostname) => {
  const value = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  return value === "::"
    || value === "::1"
    || value.startsWith("fc")
    || value.startsWith("fd")
    || /^fe[89ab]/.test(value)
    || value.startsWith("ff")
    || value.startsWith("2001:db8:")
    || value.startsWith("::ffff:");
};
const isPublicHttps = (value) => {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase().replace(/\.$/, "");
    if (url.protocol !== "https:" || url.username || url.password || !hostname) return false;
    if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local")) return false;
    const addressType = isIP(hostname.replace(/^\[|\]$/g, ""));
    if (addressType === 4) return !isNonPublicIpv4(hostname);
    if (addressType === 6) return !isNonPublicIpv6(hostname);
    return hostname.includes(".");
  } catch {
    return false;
  }
};

if (catalog.project !== "OrchestrUI") fail("Unexpected project name");
if (catalog.schema_version !== 2) fail("Unexpected library schema version");
if (catalog.verified_at !== components.verified_at) fail("Catalog verification dates must match");
if (catalog.libraries.length !== 7) fail(`Expected 7 libraries, found ${catalog.libraries.length}`);

const required = [
  "id", "name", "roles", "homepage", "docs", "repository", "license_note",
  "redistribution", "integration", "compatibility", "source_provenance", "use_when", "avoid_when",
];
const ids = new Set();
for (const library of catalog.libraries) {
  for (const key of required) if (!(key in library)) fail(`${library.id} missing ${key}`);
  if (ids.has(library.id)) fail(`Duplicate id ${library.id}`);
  ids.add(library.id);
  for (const field of ["homepage", "docs", "repository"]) {
    if (!isPublicHttps(library[field])) fail(`${library.id}.${field} must be public HTTPS`);
  }
  for (const field of ["docs", "license"]) {
    if (!isPublicHttps(library.source_provenance[field])) fail(`${library.id} provenance ${field} must be public HTTPS`);
  }
  const allowedIntegrationTypes = new Set(["shadcn-registry", "tailwind-plugin", "npm-package", "runtime-package"]);
  if (!allowedIntegrationTypes.has(library.integration.type)) fail(`${library.id} has unknown integration type`);
  if (library.integration.type === "shadcn-registry"
      && !/^@[A-Za-z0-9][A-Za-z0-9-]{0,62}$/.test(library.integration.namespace ?? "")) {
    fail(`${library.id} has an unsafe registry namespace`);
  }
  if (library.source_provenance.verified_at !== catalog.verified_at) fail(`${library.id} has stale provenance date`);
  if (!Array.isArray(library.compatibility.frameworks) || !library.compatibility.frameworks.length) {
    fail(`${library.id} missing compatibility frameworks`);
  }
}

if (Object.keys(components.libraries).length !== 7) fail("Component catalog must contain exactly seven libraries");
for (const id of ids) {
  const entry = components.libraries[id];
  if (!entry) fail(`Component catalog missing ${id}`);
  if (!isPublicHttps(entry.source)) fail(`${id} component source must be public HTTPS`);
  if (entry.registry_index && !isPublicHttps(entry.registry_index)) fail(`${id} registry must be public HTTPS`);
  if (!Array.isArray(entry.items) || !entry.items.length) fail(`${id} needs verified fallback items`);
  const itemNames = new Set();
  for (const item of entry.items) {
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(item.name)) fail(`${id} has unsafe component name ${item.name}`);
    if (itemNames.has(item.name)) fail(`${id} has duplicate component ${item.name}`);
    itemNames.add(item.name);
  }
}
for (const id of Object.keys(components.libraries)) if (!ids.has(id)) fail(`Unknown component library ${id}`);
if (components.policy.metadata_only !== true || components.policy.public_sources_only !== true) {
  fail("Component discovery must stay public and metadata-only");
}
if (components.policy.max_live_response_bytes > 524288 || components.policy.live_timeout_ms > 10000) {
  fail("Live adapter bounds exceed repository policy");
}

const ruleIds = new Set(routing.rules.map((rule) => rule.id));
for (const id of ["minimum-set", "base-system-conflict", "react-bits-no-vendor", "no-pro-by-default"]) {
  if (!ruleIds.has(id)) fail(`Missing routing guard ${id}`);
}

function validateSkill(root, skill) {
  const file = path.join(root, skill, "SKILL.md");
  const text = fs.readFileSync(file, "utf8").replaceAll("\r\n", "\n");
  if (!text.startsWith("---\n")) fail(`${file} missing frontmatter`);
  const end = text.indexOf("\n---\n", 4);
  if (end < 0) fail(`${file} invalid frontmatter fence`);
  const frontmatter = text.slice(4, end);
  if (!new RegExp(`^name:\\s*${skill}$`, "m").test(frontmatter)) fail(`${file} name mismatch`);
  if (!/^description:\s*.+/m.test(frontmatter)) fail(`${file} missing description`);
}

function listFiles(root, relative = "") {
  const current = path.join(root, relative);
  return fs.readdirSync(current, { withFileTypes: true }).flatMap((entry) => {
    const next = path.join(relative, entry.name);
    return entry.isDirectory() ? listFiles(root, next) : [next.replaceAll("\\", "/")];
  }).sort();
}

for (const skill of ["ui-library-router", "ui-orchestrator", "ui-quality-audit"]) {
  validateSkill(".agents/skills", skill);
  validateSkill("skills", skill);
}
const agentSkillFiles = listFiles(".agents/skills");
const pluginSkillFiles = listFiles("skills");
if (JSON.stringify(agentSkillFiles) !== JSON.stringify(pluginSkillFiles)) fail("Packaged skill file list is out of sync");
for (const relative of agentSkillFiles) {
  const agentText = fs.readFileSync(path.join(".agents/skills", relative), "utf8").replaceAll("\r\n", "\n");
  const pluginText = fs.readFileSync(path.join("skills", relative), "utf8").replaceAll("\r\n", "\n");
  if (agentText !== pluginText) fail(`Packaged skill is out of sync: ${relative}`);
}

if (pluginManifest.name !== "orchestrui" || pluginManifest.version !== packageManifest.version) {
  fail("Plugin name/version must match package metadata");
}
if (pluginManifest.skills !== "./skills/" || pluginManifest.mcpServers !== "./.mcp.json") {
  fail("Plugin component paths are invalid");
}
const configuredServer = mcpConfig.mcpServers?.orchestrui;
if (configuredServer?.command !== "node" || JSON.stringify(configuredServer.args) !== JSON.stringify(["./dist/mcp/src/server.js"])) {
  fail("Bundled MCP configuration must launch the built read-only server");
}
if (serverManifest.name !== packageManifest.mcpName || serverManifest.version !== packageManifest.version) {
  fail("MCP Registry metadata must match package metadata");
}
const projectWebsite = "https://ecd5a.github.io/OrchestrUI/";
if (packageManifest.homepage !== projectWebsite
  || pluginManifest.homepage !== projectWebsite
  || pluginManifest.interface?.websiteURL !== projectWebsite) {
  fail("Package and plugin website metadata must point to the interactive project presentation");
}
if (serverManifest.description.length > 100) fail("MCP Registry description must be at most 100 characters");
if (serverManifest.packages?.[0]?.identifier !== packageManifest.name) fail("MCP Registry package identifier mismatch");
if (!/^\^?2\./.test(packageManifest.dependencies?.["@modelcontextprotocol/server"] ?? "")) {
  fail("OrchestrUI must use the stable MCP TypeScript SDK v2 server package");
}

for (const file of [
  "README.md", "README.ru.md", "LICENSE", "PRIVACY.md", "TERMS.md", "SECURITY.md", "CONTRIBUTING.md",
  "CODE_OF_CONDUCT.md", "SUPPORT.md", "GOVERNANCE.md", "ROADMAP.md", "CHANGELOG.md",
  "THIRD_PARTY.md", "TRADEMARKS.md", ".github/CODEOWNERS", "package-lock.json", "server.json",
  "docs/CLAUDE_CODE.md", "docs/GITHUB_SETUP_CHECKLIST.md", "docs/RELEASE_NOTES_0.1.0.md",
  "assets/icon.svg", "assets/logo.svg", "assets/social-preview.svg", "assets/social-preview.png",
  "site/index.html", "site/styles.css", "site/app.js", "site/robots.txt", "site/sitemap.xml",
  ".github/workflows/pages.yml", "scripts/render-brand-assets.mjs",
  "scripts/check-external-links.mjs",
  "mcp/src/server.ts", "mcp/src/tools.ts", "mcp/src/adapters.ts",
]) {
  if (!fs.existsSync(file)) fail(`Missing ${file}`);
}

const expectedPackageFiles = [
  "assets/", "catalog/", "docs/", ".agents/skills/", "skills/", "README.ru.md", "TRADEMARKS.md",
];
for (const entry of expectedPackageFiles) {
  if (!packageManifest.files?.includes(entry)) fail(`npm package files must include ${entry}`);
}

function validatePng(file, width, height) {
  const image = fs.readFileSync(file);
  const signature = "89504e470d0a1a0a";
  if (image.length < 24 || image.subarray(0, 8).toString("hex") !== signature) fail(`${file} is not a valid PNG`);
  if (image.readUInt32BE(16) !== width || image.readUInt32BE(20) !== height) {
    fail(`${file} must be ${width}x${height}`);
  }
}
validatePng("assets/social-preview.png", 1280, 640);

for (const file of ["assets/icon.svg", "assets/logo.svg", "assets/social-preview.svg"]) {
  const svg = fs.readFileSync(file, "utf8");
  if (!/<svg\b/i.test(svg) || /<image\b/i.test(svg) || /(?:href|src)=["']https?:/i.test(svg)) {
    fail(`${file} must remain a self-contained SVG`);
  }
}

const readme = fs.readFileSync("README.md", "utf8").replaceAll("\r\n", "\n");
const readmeRu = fs.readFileSync("README.ru.md", "utf8").replaceAll("\r\n", "\n");
if (!readme.includes('src="assets/readme-demo.gif"') || !readmeRu.includes('src="assets/readme-demo.gif"')
  || readme.includes("readme-hero") || readmeRu.includes("readme-hero")) {
  fail("Both READMEs must use the shared animated walkthrough");
}
for (const address of [
  "pointoncurve.ton",
  "1ECDSA1b4d5TcZHtqNpcxmY8pBH1GgHntN",
  "TUF4vPdB6QkjCvZq18rBL4Qj4dK5ihCN75",
]) {
  if (!readme.includes(address) || !readmeRu.includes(address)) {
    fail(`English or Russian README is missing support address ${address}`);
  }
}
if (!readme.startsWith('<p align="right">\n  <a href="README.ru.md">Русская версия</a>\n</p>')) {
  fail("README.md must begin with the restrained Russian language link");
}
if (!readmeRu.startsWith('<p align="right">\n  <a href="README.md">English version</a>\n</p>')) {
  fail("README.ru.md must begin with the restrained English language link");
}
if (fs.existsSync(".github/FUNDING.yml") || fs.existsSync(".github/FUNDING.yaml")) {
  fail("Direct support must not be duplicated through GitHub FUNDING metadata");
}

function listRepositoryFiles(root = ".", relative = "") {
  const ignoredDirectories = new Set([".git", "dist", "node_modules"]);
  const current = path.join(root, relative);
  return fs.readdirSync(current, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) return [];
    const next = path.join(relative, entry.name);
    return entry.isDirectory() ? listRepositoryFiles(root, next) : [next.replaceAll("\\", "/")];
  });
}

for (const constructionArtifact of [
  "CODEX_MASTER_PROMPT.md", "IMPLEMENTATION_PLAN.md", "FINAL_CHECKLIST.md", "RELEASE_CHECKLIST_FINAL.md",
]) {
  if (fs.existsSync(constructionArtifact)) fail(`Construction artifact must not enter the public tree: ${constructionArtifact}`);
}

const textExtensions = new Set([".md", ".json", ".yml", ".yaml", ".ts", ".js", ".mjs", ".ps1", ".sh"]);
const localTraceNeedles = [
  ["C:", "\\", "Users", "\\"].join(""),
  ["/", "Users", "/"].join(""),
  ["/", "home", "/"].join(""),
  ["App", "Data", "\\"].join(""),
  ["Desk", "top", "\\"].join(""),
].map((value) => value.toLowerCase());
const constructionPhraseNeedles = [
  ["generated", " by ", "AI"].join(""),
  ["generated", " by ", "Codex"].join(""),
  ["Codex", " was instructed"].join(""),
  ["according", " to the prompt"].join(""),
  ["Added", " by Codex"].join(""),
  ["TO", "DO", " from prompt"].join(""),
].map((value) => value.toLowerCase());
for (const repositoryFile of listRepositoryFiles().filter((file) => textExtensions.has(path.extname(file).toLowerCase()))) {
  const text = fs.readFileSync(repositoryFile, "utf8");
  if (localTraceNeedles.some((needle) => text.toLowerCase().includes(needle))) {
    fail(`${repositoryFile} contains a personal or local filesystem trace`);
  }
  if (constructionPhraseNeedles.some((needle) => text.toLowerCase().includes(needle))) {
    fail(`${repositoryFile} contains construction-process commentary`);
  }
}

for (const sourceFile of [
  "mcp/src/server.ts", "mcp/src/tools.ts", "mcp/src/adapters.ts", "mcp/src/catalog.ts",
  "scripts/validate.mjs", "scripts/check-external-links.mjs", "scripts/render-brand-assets.mjs",
  "scripts/install-codex.sh", "scripts/install-codex.ps1",
]) {
  const source = fs.readFileSync(sourceFile, "utf8");
  if (!source.includes("Copyright (c) 2026 ECD5A") || !source.includes("SPDX-License-Identifier: MIT")) {
    fail(`${sourceFile} is missing the OrchestrUI source header`);
  }
}

for (const markdownFile of listRepositoryFiles().filter((file) => file.toLowerCase().endsWith(".md"))) {
  const markdown = fs.readFileSync(markdownFile, "utf8");
  for (const match of markdown.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)) {
    const rawTarget = match[1].trim();
    const targetWithFragment = rawTarget.startsWith("<")
      ? rawTarget.slice(1, rawTarget.indexOf(">"))
      : rawTarget.split(/\s+["']/)[0];
    if (/^(?:https?:|mailto:|#)/i.test(targetWithFragment)) continue;
    const target = decodeURIComponent(targetWithFragment.split(/[?#]/, 1)[0]);
    if (!target) continue;
    const resolved = path.resolve(path.dirname(markdownFile), target);
    if (!fs.existsSync(resolved)) fail(`${markdownFile} has a broken relative link: ${targetWithFragment}`);
  }
}

for (const forbidden of ["vendor/react-bits", "third_party/react-bits", "components/react-bits"]) {
  if (fs.existsSync(forbidden)) fail(`Forbidden React Bits vendoring path: ${forbidden}`);
}
const mcpSource = listFiles("mcp/src")
  .map((file) => fs.readFileSync(path.join("mcp/src", file), "utf8"))
  .join("\n");
if (/node:child_process|child_process|\bwriteFile(?:Sync)?\b|\bappendFile(?:Sync)?\b|\bunlink(?:Sync)?\b|\brm(?:Sync)?\b/.test(mcpSource)) {
  fail("MCP source contains a prohibited execution or filesystem-mutation primitive");
}

console.log("OrchestrUI validation passed.");
console.log(`Libraries: ${catalog.libraries.map((library) => library.name).join(", ")}`);
console.log("Plugin/MCP manifests, packaged skills, provenance and read-only boundaries are consistent.");
