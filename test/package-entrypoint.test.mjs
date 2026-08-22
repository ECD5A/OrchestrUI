import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const manifest = JSON.parse(fs.readFileSync("package.json", "utf8"));

test("npm package exposes a portable MCP executable", () => {
  assert.equal(manifest.bin?.["orchestrui-mcp"], "dist/mcp/src/server.js");
  const executable = fs.readFileSync(manifest.bin["orchestrui-mcp"], "utf8");
  assert.ok(executable.startsWith("#!/usr/bin/env node\n"));
});
