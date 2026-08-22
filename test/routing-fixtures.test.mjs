import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { loadOrchestrUiData } from "../dist/mcp/src/catalog.js";
import { auditPlan, recommendStack } from "../dist/mcp/src/tools.js";
import { verifyFixtureResults } from "../examples/fixtures/run.mjs";

const data = loadOrchestrUiData();
const fixtureRoot = "examples/fixtures";
const fixtureFiles = fs.readdirSync(fixtureRoot, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => path.join(fixtureRoot, entry.name, "fixture.json"));

test("three project fixtures execute through routing and audit boundaries", () => {
  assert.equal(fixtureFiles.length, 3);

  for (const file of fixtureFiles) {
    const fixture = JSON.parse(fs.readFileSync(file, "utf8"));
    const route = recommendStack({
      hostProfile: fixture.host_profile,
      taskProfile: fixture.task_profile,
    }, data);
    const selected = route.selected.map((entry) => entry.id);
    const existing = route.selected.filter((entry) => entry.already_present).map((entry) => entry.id);
    const rejected = new Set(route.rejected.map((entry) => entry.id));
    const owners = Object.fromEntries(route.role_ownership.map((entry) => [entry.role, entry.owner]));

    assert.deepEqual(selected, fixture.expected.selected, `${fixture.id}: selected`);
    assert.deepEqual(existing, fixture.expected.existing, `${fixture.id}: existing`);
    for (const id of fixture.expected.rejected) assert.ok(rejected.has(id), `${fixture.id}: reject ${id}`);
    for (const [role, owner] of Object.entries(fixture.expected.owners)) {
      assert.equal(owners[role], owner, `${fixture.id}: owner ${role}`);
    }

    const audit = auditPlan({
      selectedLibraries: selected,
      existingStack: [fixture.host_profile.design_system ?? fixture.host_profile.framework],
      riveAssetRights: fixture.task_profile.rive_asset_rights,
      includesPaidContent: false,
      redistributesReactBits: false,
    }, data);
    assert.ok(audit.pending_checks.length > 0, `${fixture.id}: rendered checks must remain pending without evidence`);
    assert.ok(audit.verified_maximum < audit.maximum_score, `${fixture.id}: pending checks must not inflate verified maximum`);
  }
});

test("committed fixture results match the current policy engine", () => {
  assert.deepEqual(verifyFixtureResults(), []);
});
