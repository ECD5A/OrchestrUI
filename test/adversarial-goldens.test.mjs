import test from "node:test";
import assert from "node:assert/strict";

import { evaluateAdversarialGoldens } from "../benchmark/adversarial.mjs";

test("independently specified adversarial goldens satisfy routing invariants", () => {
  const result = evaluateAdversarialGoldens();
  assert.equal(result.total, 8);
  assert.equal(result.passed, 8, JSON.stringify(result.failures, null, 2));
  assert.equal(result.pass_rate, 1);
  assert.deepEqual(result.failures, []);
  assert.equal(result.provenance.policy_catalog_imported, false);
});
