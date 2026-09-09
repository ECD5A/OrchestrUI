import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { inspectProject } from "../dist/mcp/src/inspect.js";

function fixture(t, manifest) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "orchestrui-inspect-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.writeFileSync(path.join(root, "package.json"), JSON.stringify(manifest));
  return root;
}
test("inspector extracts declarations and locked versions without running scripts", (t) => {
  const root = fixture(t, { packageManager: "pnpm@10", dependencies: { next: "^15", react: "^19", tailwindcss: "^4", recharts: "^3" }, scripts: { postinstall: "DO_NOT_EXECUTE" } });
  fs.writeFileSync(path.join(root, "package-lock.json"), JSON.stringify({ packages: { "node_modules/tailwindcss": { version: "4.2.0" } } }));
  fs.writeFileSync(path.join(root, "components.json"), JSON.stringify({ tailwind: { cssVariables: true } }));
  const result = inspectProject(".", root);
  assert.equal(result.host_profile.framework, "Next.js");
  assert.equal(result.host_profile.tailwind_version, "4.2.0");
  assert.equal(result.host_profile.package_manager, "pnpm");
  assert.equal(result.host_profile.design_system, "shadcn/ui");
  assert.deepEqual(result.host_profile.chart_stack, ["recharts"]);
  assert.equal(JSON.stringify(result).includes("DO_NOT_EXECUTE"), false);
});
test("inspector rejects traversal and reports ambiguous base systems", (t) => {
  const root = fixture(t, { dependencies: { react: "^19", daisyui: "^5", "@mui/material": "^7" } });
  assert.throws(() => inspectProject("..", root), /within/);
  assert.equal(inspectProject(".", root).ready_for_routing, false);
  assert.equal(inspectProject(".", root).host_profile.design_system, undefined);
});
test("inspector rejects oversized and malformed metadata without echoing contents", (t) => {
  const root = fixture(t, {});
  fs.writeFileSync(path.join(root, "package.json"), "private-data-not-json");
  assert.throws(() => inspectProject(".", root), (error) => !error.message.includes("private-data"));
  fs.writeFileSync(path.join(root, "package.json"), " ".repeat(2 * 1024 * 1024 + 1));
  assert.throws(() => inspectProject(".", root), /oversized/);
});
test("inspector rejects a directory junction outside its workspace", (t) => {
  const root = fixture(t, {});
  const outside = fixture(t, {});
  fs.symlinkSync(outside, path.join(root, "outside"), process.platform === "win32" ? "junction" : "dir");
  assert.throws(() => inspectProject("outside", root), /symlink/);
});

test("inspector omits dependency credentials and rejects false lockfile version evidence", (t) => {
  const root = fixture(t, { dependencies: { react: "^19", tailwindcss: "^4", custom: "https://user:private-token@example.org/pkg" } });
  fs.writeFileSync(path.join(root, "package-lock.json"), JSON.stringify({ packages: { "node_modules/tailwindcss": { version: "^4" } } }));
  const result = inspectProject(".", root);
  assert.ok(!JSON.stringify(result).includes("private-token"));
  assert.equal(result.host_profile.tailwind_version, "^4");
  assert.ok(!result.evidence.some((entry) => entry.field === "tailwindcss" && entry.kind === "locked-version-not-installed-proof"));
});
