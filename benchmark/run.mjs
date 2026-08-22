#!/usr/bin/env node
/*
 * OrchestrUI — structured routing benchmark.
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
const benchmark = JSON.parse(fs.readFileSync(path.join(benchmarkRoot, "routing-benchmark.json"), "utf8"));

function sameIds(actual, expected) {
  return JSON.stringify(actual) === JSON.stringify(expected);
}

export function evaluateRoutingBenchmark(data = loadOrchestrUiData()) {
  const failures = [];

  for (const scenario of benchmark.scenarios) {
    const hostProfile = benchmark.hosts[scenario.host];
    const taskProfile = benchmark.tasks[scenario.task];
    if (!hostProfile || !taskProfile) {
      failures.push({ id: scenario.id, reason: "Unknown host or task fixture" });
      continue;
    }

    const result = recommendStack({ hostProfile, taskProfile }, data);
    const selected = result.selected.map((entry) => entry.id);
    const existing = result.selected.filter((entry) => entry.already_present).map((entry) => entry.id);
    const rejected = new Set(result.rejected.map((entry) => entry.id));
    const duplicateOwners = result.role_ownership
      .map((entry) => entry.role)
      .filter((role, index, roles) => roles.indexOf(role) !== index);

    if (result.input_mode !== "structured-profiles") {
      failures.push({ id: scenario.id, reason: `Unexpected input mode ${result.input_mode}` });
    }
    if (!sameIds(selected, scenario.expected_selected)) {
      failures.push({ id: scenario.id, reason: "Selected libraries differ", expected: scenario.expected_selected, actual: selected });
    }
    if (!sameIds(existing, scenario.expected_existing ?? [])) {
      failures.push({ id: scenario.id, reason: "Existing owners differ", expected: scenario.expected_existing ?? [], actual: existing });
    }
    for (const id of scenario.expected_rejected ?? []) {
      if (!rejected.has(id)) failures.push({ id: scenario.id, reason: `Expected ${id} to be rejected` });
    }
    if (duplicateOwners.length) {
      failures.push({ id: scenario.id, reason: `Duplicate role owners: ${duplicateOwners.join(", ")}` });
    }
    if (result.decisions.some((decision) => !decision.rule_id || !decision.evidence.length)) {
      failures.push({ id: scenario.id, reason: "Decision is missing rule evidence" });
    }
  }

  const total = benchmark.scenarios.length;
  const failedScenarios = new Set(failures.map((failure) => failure.id)).size;
  const passed = total - failedScenarios;
  return {
    schema_version: benchmark.schema_version,
    passed,
    total,
    pass_rate: total ? passed / total : 0,
    policy_invariants: [
      "structured input mode",
      "exact expected selection",
      "expected conflict rejection",
      "host framework compatibility",
      "one owner per role",
      "rule evidence on every decision",
    ],
    failures,
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = evaluateRoutingBenchmark();
  console.log(JSON.stringify(result, null, 2));
  if (result.failures.length) process.exitCode = 1;
}
