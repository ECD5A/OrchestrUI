import test from "node:test";
import assert from "node:assert/strict";
import { semverCompatibility } from "../dist/mcp/src/compatibility.js";
import { recommendStack } from "../dist/mcp/src/routing.js";
import { loadOrchestrUiData } from "../dist/mcp/src/catalog.js";
import { classifyFiles, diffArguments } from "../scripts/ci-scope.mjs";

const data = loadOrchestrUiData();
test("semver handles prereleases, partials, ranges and ambiguous declarations", () => {
  for (const [actual, range, expected] of [
    ["4.0.0-beta.1", ">=4.0.0", "incompatible"],
    ["4", ">=4.9.0", "unknown"], ["4", ">=4.0.0", "compatible"],
    ["4.2.1", "^4", "compatible"], ["5.0.0", "^4", "incompatible"],
    ["4.2.9", "~4.2", "compatible"], ["4.3.0", "~4.2", "incompatible"],
    ["0.2.9", "^0.2.3", "compatible"], ["0.3.0", "^0.2.3", "incompatible"],
    ["0.0.4", "^0.0.3", "incompatible"], ["4.2.0+build", ">=4", "compatible"],
    ["4.2.0", ">=3 <4 || ^4.2", "compatible"],
    ["3.5.0", "3.2 - 3.6", "compatible"],
    ["workspace:*", ">=4", "unknown"], ["banana4.2.0", ">=4", "unknown"],
    ["01.2.3", ">=1", "unknown"], ["^3 || ^4", ">=4", "unknown"],
    ["^3", ">=4", "incompatible"], [undefined, ">=4", "unknown"],
  ]) assert.equal(semverCompatibility(actual, range), expected, `${actual} / ${range}`);
});

test("incompatible existing owner cannot hide an unmet requirement", () => {
  const result = recommendStack({ hostProfile: { framework: "React", design_system: "daisyui", tailwind_version: "3.4.0" }, taskProfile: { required_capabilities: ["forms-controls"] } }, data);
  assert.equal(result.capability_coverage[0].status, "unmet");
  assert.equal(result.unmet_requirements.length, 1);
  assert.equal(result.selected.length, 0);
});

test("unknown compatibility and external ownership require verification", () => {
  for (const hostProfile of [{ framework: "React", tailwind_version: "workspace:*" }, { framework: "React", design_system: "shadcn/ui" }]) {
    const result = recommendStack({ hostProfile, taskProfile: { required_capabilities: ["forms-controls"] } }, data);
    assert.equal(result.pending_requirements.length, 1);
    assert.match(result.summary, /Provisional/);
  }
});

// Independent coverage oracle: no policy file, scores or optimizer helpers.
const coverage = {
  "forms-controls": ["daisyui"], "product-polish": ["kokonut-ui", "daisyui"],
  "data-visualization": ["bklit-ui"], "marketing-motion": ["magic-ui", "react-bits"],
  "signature-creative-effect": ["magic-ui", "react-bits"], "bespoke-motion": ["animejs"],
  "interactive-vector": ["rive"],
};
const capabilities = Object.keys(coverage);
const libraries = [...new Set(Object.values(coverage).flat())];
test("all 128 task subsets match an independent minimum-set oracle and input permutations", () => {
  for (let mask = 0; mask < 128; mask++) {
    const required = capabilities.filter((_, i) => mask & (1 << i));
    let minimum = Infinity;
    for (let subset = 0; subset < 128; subset++) {
      const ids = libraries.filter((_, i) => subset & (1 << i));
      if (ids.includes("daisyui") && ids.includes("kokonut-ui")) continue;
      if (required.every((c) => coverage[c].some((id) => ids.includes(id)))) minimum = Math.min(minimum, ids.length);
    }
    const input = { hostProfile: { framework: "React", tailwind_version: "4.2.0" }, taskProfile: { required_capabilities: required, rive_asset_rights: "confirmed" } };
    const result = recommendStack(input, data);
    assert.equal(result.selected.length, minimum, required.join(","));
    assert.equal(result.unmet_requirements.length, 0);
    assert.equal(result.pending_requirements.length, 0);
    const reversed = recommendStack({ ...input, taskProfile: { ...input.taskProfile, required_capabilities: [...required].reverse() } }, data);
    // Echoed input order is intentionally preserved; routing decisions are not.
    const { profiles: originalProfiles, ...originalPlan } = result;
    const { profiles: reversedProfiles, ...reversedPlan } = reversed;
    assert.deepEqual(originalPlan, reversedPlan);
    assert.equal(new Set(result.role_ownership.map((x) => x.role)).size, result.role_ownership.length);
    assert.ok(result.candidate_rankings.every((x) => x.eligible || x.rank === null));
    assert.ok(result.selected.every((x) => !result.rejected.some((r) => r.id === x.id)));
  }
});

test("generated host combinations never bypass version, framework or rights gates", () => {
  for (const framework of ["React", "Vue", "Svelte"]) for (const tailwind_version of ["3.4.0", "4.0.0-beta.1", "4.2.0"]) for (const rights of ["confirmed", "unconfirmed"]) {
    const result = recommendStack({ hostProfile: { framework, tailwind_version }, taskProfile: { required_capabilities: capabilities, rive_asset_rights: rights } }, data);
    const ids = result.selected.map((x) => x.id);
    if (rights !== "confirmed") assert.ok(!ids.includes("rive"));
    if (tailwind_version !== "4.2.0") assert.ok(!ids.includes("daisyui") && !ids.includes("kokonut-ui"));
    if (framework !== "React") assert.ok(!ids.includes("magic-ui") && !ids.includes("react-bits"));
    assert.equal(result.capability_coverage.length, 7);
  }
});

test("CI scopes docs, executable docs, skills and event revisions correctly", () => {
  assert.equal(classifyFiles(["README.md", "docs/USAGE.md"]), false);
  for (const file of ["skills/a/SKILL.md", ".agents/skills/a/references/a.md", "AGENTS.md", "docs/demo.js", ".github/workflows/ci.yml"]) assert.equal(classifyFiles([file]), true);
  const before = "a".repeat(40), after = "b".repeat(40);
  assert.ok(diffArguments("push", { before, after }).includes(before));
  assert.ok(diffArguments("pull_request", { pull_request: { base: { sha: before }, head: { sha: after } } }).includes(`${before}...${after}`));
  assert.deepEqual(diffArguments("push", { before: "0".repeat(40), after }), ["ls-files", "-z"]);
  assert.throws(() => diffArguments("push", {}));
});
