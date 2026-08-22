import test from "node:test";
import assert from "node:assert/strict";

import { evaluateRoutingBenchmark } from "../benchmark/run.mjs";

test("all structured routing benchmark scenarios satisfy policy invariants", () => {
  const result = evaluateRoutingBenchmark();
  assert.equal(result.total, 50);
  assert.equal(result.passed, 50, JSON.stringify(result.failures, null, 2));
  assert.equal(result.pass_rate, 1);
  assert.deepEqual(result.failures, []);
});
