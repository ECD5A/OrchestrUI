#!/usr/bin/env node
/*
 * OrchestrUI — independently specified adversarial routing goldens.
 * Copyright (c) 2026 ECD5A
 * Licensed under the MIT License.
 * https://github.com/ECD5A/OrchestrUI
 * SPDX-License-Identifier: MIT
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { loadOrchestrUiData } from "../dist/mcp/src/catalog.js";
import { recommendStack } from "../dist/mcp/src/tools.js";

const benchmarkRoot = path.dirname(fileURLToPath(import.meta.url));
const golden = JSON.parse(fs.readFileSync(path.join(benchmarkRoot, "adversarial-golden-cases.json"), "utf8"));

function same(actual, expected) {
  return JSON.stringify(actual) === JSON.stringify(expected);
}

export function evaluateAdversarialGoldens(data = loadOrchestrUiData()) {
  const failures = [];

  for (const testCase of golden.cases) {
    const result = recommendStack(testCase.input, data);
    const selected = result.selected.map((entry) => entry.id);
    const existing = result.selected.filter((entry) => entry.already_present).map((entry) => entry.id);
    const rejected = Object.fromEntries(result.rejected.map((entry) => [entry.id, entry.rule_id]));
    const owners = Object.fromEntries(result.role_ownership.map((entry) => [entry.role, entry.owner]));
    const winners = Object.fromEntries(result.candidate_rankings
      .filter((entry) => entry.outcome === "selected")
      .map((entry) => [entry.capability, entry.candidate]));

    if (!same(selected, testCase.expected.selected)) {
      failures.push({ id: testCase.id, reason: "Selected libraries differ", expected: testCase.expected.selected, actual: selected });
    }
    if (testCase.expected.existing && !same(existing, testCase.expected.existing)) {
      failures.push({ id: testCase.id, reason: "Existing libraries differ", expected: testCase.expected.existing, actual: existing });
    }
    for (const [id, rule] of Object.entries(testCase.expected.rejected_rules ?? {})) {
      if (rejected[id] !== rule) failures.push({ id: testCase.id, reason: `Expected ${id} rejection by ${rule}`, actual: rejected[id] });
    }
    for (const [role, owner] of Object.entries(testCase.expected.owners ?? {})) {
      if (owners[role] !== owner) failures.push({ id: testCase.id, reason: `Expected ${role} owner ${owner}`, actual: owners[role] });
    }
    for (const [capability, winner] of Object.entries(testCase.expected.ranking_winners ?? {})) {
      if (winners[capability] !== winner) failures.push({ id: testCase.id, reason: `Expected ${capability} winner ${winner}`, actual: winners[capability] });
    }
    if (result.candidate_rankings.some((entry) => !entry.factors.length || entry.factors.some((factor) => !factor.evidence))) {
      failures.push({ id: testCase.id, reason: "Candidate ranking is missing evidence" });
    }
  }

  const total = golden.cases.length;
  const failedCases = new Set(failures.map((failure) => failure.id)).size;
  return {
    schema_version: golden.schema_version,
    provenance: golden.provenance,
    passed: total - failedCases,
    total,
    pass_rate: total ? (total - failedCases) / total : 0,
    failures,
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = evaluateAdversarialGoldens();
  console.log(JSON.stringify(result, null, 2));
  if (result.failures.length) process.exitCode = 1;
}
