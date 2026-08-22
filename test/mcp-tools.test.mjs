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

test("recommend_stack uses structured profiles instead of prompt keywords", () => {
  const recommendation = recommendStack({
    task: "Build a landing analytics dashboard with every animation library",
    existingStack: [],
    constraints: [],
    riveAssetRights: "not-applicable",
    hostProfile: {
      framework: "Next.js",
      design_system: "shadcn/ui",
      component_primitives: ["Radix UI"],
      motion_stack: [],
      chart_stack: [],
      tokens: ["CSS variables"],
      accessibility_constraints: ["WCAG 2.2 AA"],
    },
    taskProfile: {
      surface: "application",
      required_capabilities: ["forms-controls"],
      interaction_complexity: "medium",
      data_visualization: "none",
      motion_requirement: "native",
      rive_asset_rights: "not-applicable",
      constraints: [],
    },
  }, data);

  assert.equal(recommendation.input_mode, "structured-profiles");
  assert.deepEqual(recommendation.selected, []);
  assert.ok(recommendation.rejected.some((item) => item.id === "daisyui" && item.conflicting_owner === "host:shadcn-ui"));
  assert.ok(!recommendation.selected.some((item) => ["bklit-ui", "magic-ui", "animejs"].includes(item.id)));
});

test("recommend_stack preserves existing role owners with evidence", () => {
  const recommendation = recommendStack({
    hostProfile: {
      framework: "React",
      component_primitives: [],
      motion_stack: ["Framer Motion"],
      chart_stack: ["Recharts"],
      tokens: [],
      accessibility_constraints: [],
    },
    taskProfile: {
      surface: "application",
      required_capabilities: ["data-visualization", "bespoke-motion"],
      interaction_complexity: "high",
      data_visualization: "advanced",
      motion_requirement: "bespoke",
      rive_asset_rights: "not-applicable",
      constraints: [],
    },
  }, data);

  assert.deepEqual(recommendation.selected, []);
  assert.ok(recommendation.rejected.some((item) => item.id === "bklit-ui" && item.conflicting_owner === "host:recharts"));
  assert.ok(recommendation.rejected.some((item) => item.id === "animejs" && item.conflicting_owner === "host:framer-motion"));
  assert.ok(recommendation.decisions.every((decision) => decision.evidence.length > 0));
});

test("recommend_stack marks partial structured input as hybrid inference", () => {
  const recommendation = recommendStack({
    task: "Build an analytics dashboard",
    hostProfile: {
      framework: "Next.js",
      design_system: "shadcn/ui",
      component_primitives: [],
      motion_stack: [],
      chart_stack: [],
      tokens: [],
      accessibility_constraints: [],
    },
  }, data);
  assert.equal(recommendation.input_mode, "hybrid-profile-inference");
  assert.deepEqual(recommendation.selected.map((item) => item.id), ["bklit-ui"]);
  assert.match(recommendation.risks.join(" "), /supply both HostProfile and TaskProfile/i);
});

test("recommend_stack ranks an installed admissible candidate above a new dependency", () => {
  const recommendation = recommendStack({
    hostProfile: {
      framework: "React",
      dependencies: {},
      component_primitives: ["React Bits"],
      motion_stack: [],
      chart_stack: [],
      tokens: [],
      accessibility_constraints: ["prefers-reduced-motion"],
    },
    taskProfile: {
      surface: "marketing",
      required_capabilities: ["marketing-motion"],
      interaction_complexity: "medium",
      data_visualization: "none",
      motion_requirement: "native",
      rive_asset_rights: "not-applicable",
      constraints: ["low bundle impact"],
    },
  }, data);

  assert.deepEqual(recommendation.selected.map((item) => item.id), ["react-bits"]);
  const ranking = recommendation.candidate_rankings.filter((entry) => entry.capability === "marketing-motion");
  assert.deepEqual(ranking.map((entry) => entry.candidate), ["react-bits", "magic-ui"]);
  assert.equal(ranking[0].outcome, "selected");
  assert.ok(ranking[0].factors.some((factor) => factor.id === "installed-evidence" && factor.score > 0));
});

test("recommend_stack treats supplied semver incompatibility as a hard blocker", () => {
  const recommendation = recommendStack({
    hostProfile: {
      framework: "React",
      tailwind_version: "3.4.0",
      dependencies: {},
      component_primitives: [],
      motion_stack: [],
      chart_stack: [],
      tokens: [],
      accessibility_constraints: [],
    },
    taskProfile: {
      surface: "application",
      required_capabilities: ["forms-controls"],
      interaction_complexity: "medium",
      data_visualization: "none",
      motion_requirement: "none",
      rive_asset_rights: "not-applicable",
      constraints: [],
    },
  }, data);

  assert.deepEqual(recommendation.selected, []);
  assert.ok(recommendation.rejected.some((item) => item.id === "daisyui" && item.rule_id === "version-compatibility"));
  assert.ok(recommendation.candidate_rankings.some((entry) => entry.candidate === "daisyui" && entry.blocked_by === "version-compatibility"));
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

test("audit_plan excludes pending checks from the verified score", () => {
  const pending = auditPlan({
    selectedLibraries: ["bklit-ui"],
    existingStack: ["shadcn/ui"],
    riveAssetRights: "not-applicable",
    includesPaidContent: false,
    redistributesReactBits: false,
  }, data);
  assert.ok(pending.pending_checks.includes("accessibility"));
  assert.ok(pending.checks.some((check) => check.status === "pending"));
  assert.equal(pending.score, pending.verified_score);
  assert.ok(pending.verified_maximum < pending.maximum_score);

  const verified = auditPlan({
    selectedLibraries: ["bklit-ui"],
    existingStack: ["shadcn/ui"],
    riveAssetRights: "not-applicable",
    includesPaidContent: false,
    redistributesReactBits: false,
    verifications: [
      { category: "visual coherence", status: "pass", evidence: "Rendered token comparison reviewed." },
      { category: "accessibility", status: "pass", evidence: "Keyboard and axe checks passed." },
      { category: "responsiveness", status: "pass", evidence: "375px, 768px and 1440px verified." },
      { category: "data-viz readability", status: "pass", evidence: "Labels, units and non-color cues verified." },
      { category: "engineering checks/dependencies/secrets", status: "pass", evidence: "Lint, typecheck, tests, build and secret scan passed." },
    ],
  }, data);
  assert.equal(verified.verified_score, 18);
  assert.equal(verified.verified_maximum, 18);
  assert.deepEqual(verified.pending_checks, []);
});
