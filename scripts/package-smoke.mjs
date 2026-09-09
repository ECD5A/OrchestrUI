/* Copyright (c) 2026 ECD5A; SPDX-License-Identifier: MIT */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";

const root = fs.realpathSync(process.cwd());
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "orchestrui-package-"));
const npmCli = process.env.npm_execpath;
if (!npmCli) throw new Error("Run through npm run pack:smoke.");
const npm = (args, cwd) => execFileSync(process.execPath, [npmCli, ...args], { cwd, encoding: "utf8", timeout: 120000, maxBuffer: 4 * 1024 * 1024 });
const client = new Client({ name: "orchestrui-package-smoke", version: "1.0.0" });
try {
  const [packed] = JSON.parse(npm(["pack", "--ignore-scripts", "--json", "--pack-destination", temporary], root));
  const files = packed.files.map((file) => file.path);
  for (const required of ["dist/mcp/src/server.js", "dist/mcp/src/inspect.js", "catalog/libraries.json", "server.json", "LICENSE", "THIRD_PARTY.md", "skills/ui-library-router/SKILL.md"]) assert.ok(files.includes(required), required);
  assert.ok(!files.some((file) => /(^|\/)(?:node_modules|\.git|\.env|\.npmrc)(?:\/|$)/.test(file)));
  const consumer = path.join(temporary, "consumer");
  fs.mkdirSync(consumer);
  fs.writeFileSync(path.join(consumer, "package.json"), JSON.stringify({ name: "orchestrui-smoke-consumer", version: "1.0.0", private: true }));
  npm(["install", path.join(temporary, packed.filename), "--ignore-scripts", "--omit=dev", "--no-audit", "--no-fund"], consumer);
  const installed = path.join(consumer, "node_modules", "orchestrui");
  assert.equal(JSON.parse(fs.readFileSync(path.join(installed, "package.json"), "utf8")).version, packed.version);
  const demo = path.join(consumer, "demo");
  fs.mkdirSync(demo);
  fs.writeFileSync(path.join(demo, "package.json"), JSON.stringify({ dependencies: { react: "^19", tailwindcss: "^4" } }));
  await client.connect(new StdioClientTransport({ command: process.execPath, args: [path.join(installed, "dist/mcp/src/server.js")], cwd: consumer, stderr: "pipe" }));
  const listing = await client.listTools();
  assert.equal(listing.tools.length, 7);
  const call = async (name, args) => {
    const response = await client.callTool({ name, arguments: args }, undefined, { timeout: 15000 });
    assert.ok(!response.isError, JSON.stringify(response));
    return response.structuredContent.result;
  };
  assert.equal((await call("list_libraries", {})).count, 7);
  const inspected = await call("inspect_project", { relative_path: "demo" });
  assert.equal(inspected.host_profile.framework, "React");
  const plan = await call("recommend_stack", { host_profile: inspected.host_profile, task_profile: { required_capabilities: ["marketing-motion", "signature-creative-effect"] } });
  assert.deepEqual(plan.selected.map((item) => item.id), ["magic-ui"]);
  assert.equal(plan.unmet_requirements.length, 0);
  assert.ok((await call("get_library_guidance", { library_id: "daisyui" })).library);
  await call("search_components", { library_id: "magic-ui", live: false });
  await call("get_install_instructions", { library_id: "animejs" });
  await call("audit_plan", { selected_libraries: ["magic-ui"] });
  console.log(`Package smoke passed: ${packed.name}@${packed.version}, ${files.length} files, isolated install, 7 MCP tools over stdio.`);
} finally {
  await client.close();
  if (path.dirname(temporary) !== fs.realpathSync(os.tmpdir()) && path.dirname(temporary) !== os.tmpdir()) throw new Error("Unexpected temporary directory");
  fs.rmSync(temporary, { recursive: true, force: true });
}
