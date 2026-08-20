import test from "node:test";
import assert from "node:assert/strict";

import { loadOrchestrUiData } from "../dist/mcp/src/catalog.js";
import { searchComponents } from "../dist/mcp/src/tools.js";

test("optional live official registry smoke test", {
  skip: process.env.ORCHESTRUI_LIVE_TESTS !== "1" ? "set ORCHESTRUI_LIVE_TESTS=1 to enable network smoke tests" : false,
}, async () => {
  const data = loadOrchestrUiData();
  // This opt-in check verifies upstream availability, not the lower production
  // latency budget that intentionally falls back to the bundled catalog.
  data.components.policy.live_timeout_ms = 10_000;
  const cases = [
    ["kokonut-ui", "particle-button", "particle-button"],
    ["react-bits", "BlurText-TS-TW", "BlurText-TS-TW"],
    ["bklit-ui", "line-chart", "line-chart"],
    ["magic-ui", "globe", "globe"],
  ];
  // Keep the smoke test sequential so the four unrelated upstream registries
  // are not mistaken for a single burst by edge rate limits.
  for (const [libraryId, query, expected] of cases) {
    const result = await searchComponents({ libraryId, query, limit: 3, live: true }, data);
    assert.equal(result.mode, "live-registry", `${libraryId} should return live registry data`);
    assert.ok(
      result.matches.some((item) => item.name === expected),
      `${libraryId} should include ${expected}`,
    );
  }
});
