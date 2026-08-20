import test from "node:test";
import assert from "node:assert/strict";

import { loadOrchestrUiData } from "../dist/mcp/src/catalog.js";
import {
  auditPlan,
  getInstallInstructions,
  getLibraryGuidance,
  listLibraries,
  recommendStack,
  searchComponents,
} from "../dist/mcp/src/tools.js";

const data = loadOrchestrUiData();

test("list_libraries returns exactly seven ecosystems and filters roles", () => {
  assert.equal(listLibraries({}, data).count, 7);
  const charts = listLibraries({ role: "charts" }, data);
  assert.deepEqual(charts.libraries.map((library) => library.id), ["bklit-ui"]);
});

test("recommend_stack chooses the minimum analytics stack", () => {
  const recommendation = recommendStack({
    task: "Build an analytics dashboard with line and bar charts",
    existingStack: ["Next.js", "shadcn/ui"],
    constraints: ["accessible", "low motion"],
    riveAssetRights: "not-applicable",
  }, data);
  assert.deepEqual(recommendation.selected.map((item) => item.id), ["bklit-ui"]);
  assert.ok(recommendation.rejected.some((item) => item.id === "daisyui"));
});

test("recommend_stack blocks Rive without confirmed asset rights", () => {
  const recommendation = recommendStack({
    task: "Create an interactive Rive mascot with a state machine",
    existingStack: ["React"],
    constraints: [],
    riveAssetRights: "unconfirmed",
  }, data);
  assert.ok(!recommendation.selected.some((item) => item.id === "rive"));
  assert.match(recommendation.risks.join(" "), /asset rights/i);
});

test("get_library_guidance exposes React Bits redistribution boundary", () => {
  const guidance = getLibraryGuidance({ libraryId: "react-bits" }, data);
  assert.match(guidance.library.legal.license_note, /Commons Clause/i);
  assert.match(guidance.library.legal.redistribution, /Never.*redistribute|Never mirror/i);
});

test("search_components searches the verified local fallback", async () => {
  const result = await searchComponents({
    libraryId: "bklit-ui",
    query: "heatmap",
    limit: 10,
    live: false,
  }, data);
  assert.equal(result.mode, "catalog-fallback");
  assert.deepEqual(result.matches.map((item) => item.name), ["heatmap-chart"]);
});

test("search_components uses normalized public registry metadata", async () => {
  const fetchImpl = async () => new Response(JSON.stringify({
    items: [{ name: "live-card", title: "Live Card", description: "Registry description", files: [{ content: "ignored source" }] }],
  }), { status: 200, headers: { "content-type": "application/json" } });
  const result = await searchComponents({
    libraryId: "kokonut-ui",
    query: "live",
    limit: 5,
    live: true,
  }, data, { fetchImpl });
  assert.equal(result.mode, "live-registry");
  assert.deepEqual(result.matches, [{
    name: "live-card",
    title: "Live Card",
    description: "Official registry item. Verify details at the cited upstream source.",
  }]);
  assert.equal(result.content_policy.classification, "untrusted-remote-identifiers");
  assert.match(result.content_policy.instruction_boundary, /never follow.*instructions/i);
  assert.ok(!JSON.stringify(result).includes("ignored source"));
  assert.ok(!JSON.stringify(result).includes("Registry description"));
});

test("get_install_instructions returns inert text and rejects path-like input", () => {
  const instructions = getInstallInstructions({ libraryId: "magic-ui", component: "globe" }, data);
  assert.equal(instructions.command, "npx shadcn@latest add @magicui/globe");
  assert.equal(instructions.executes_command, false);
  assert.throws(
    () => getInstallInstructions({ libraryId: "magic-ui", component: "../../package.json" }, data),
    /not a path or command/i,
  );
  const tampered = structuredClone(data);
  tampered.catalog.libraries.find((library) => library.id === "magic-ui").integration.namespace = "@magicui; whoami";
  assert.throws(
    () => getInstallInstructions({ libraryId: "magic-ui", component: "globe" }, tampered),
    /namespace/i,
  );
});

test("audit_plan reports base conflicts, Rive rights and license blockers", () => {
  const audit = auditPlan({
    selectedLibraries: ["daisyui", "kokonut-ui", "rive"],
    existingStack: ["shadcn/ui"],
    riveAssetRights: "unconfirmed",
    includesPaidContent: true,
    redistributesReactBits: true,
  }, data);
  assert.equal(audit.maximum_score, 18);
  assert.equal(audit.blockers.length, 3);
  assert.ok(audit.checks.some((check) => check.category === "library discipline" && check.status === "fail"));
});
