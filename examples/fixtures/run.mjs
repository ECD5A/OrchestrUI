#!/usr/bin/env node
/*
 * OrchestrUI — reproducible routing fixture results.
 * Copyright (c) 2026 ECD5A
 * Licensed under the MIT License.
 * https://github.com/ECD5A/OrchestrUI
 * SPDX-License-Identifier: MIT
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { loadOrchestrUiData } from "../../dist/mcp/src/catalog.js";
import { auditPlan, recommendStack } from "../../dist/mcp/src/tools.js";

const fixtureRoot = path.dirname(fileURLToPath(import.meta.url));

export function buildFixtureResults(data = loadOrchestrUiData()) {
  return fs.readdirSync(fixtureRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((entry) => {
      const directory = path.join(fixtureRoot, entry.name);
      const fixture = JSON.parse(fs.readFileSync(path.join(directory, "fixture.json"), "utf8"));
      const recommendation = recommendStack({
        hostProfile: fixture.host_profile,
        taskProfile: fixture.task_profile,
      }, data);
      const audit = auditPlan({
        selectedLibraries: recommendation.selected.map((item) => item.id),
        existingStack: [fixture.host_profile.design_system ?? fixture.host_profile.framework],
        riveAssetRights: fixture.task_profile.rive_asset_rights,
        includesPaidContent: false,
        redistributesReactBits: false,
      }, data);
      return {
        directory,
        output: {
          schema_version: 1,
          fixture_id: fixture.id,
          policy_schema_version: data.routing.schema_version,
          package_version: data.version,
          recommendation,
          audit,
        },
      };
    });
}

export function verifyFixtureResults({ write = false } = {}) {
  const mismatches = [];
  for (const { directory, output } of buildFixtureResults()) {
    const destination = path.join(directory, "result.json");
    const serialized = `${JSON.stringify(output, null, 2)}\n`;
    if (write) {
      fs.writeFileSync(destination, serialized);
    } else if (!fs.existsSync(destination) || fs.readFileSync(destination, "utf8").replaceAll("\r\n", "\n") !== serialized) {
      mismatches.push(path.relative(fixtureRoot, destination).replaceAll("\\", "/"));
    }
  }
  return mismatches;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const write = process.argv.includes("--write");
  const mismatches = verifyFixtureResults({ write });
  if (write) {
    console.log("Rebuilt three routing fixture results.");
  } else if (mismatches.length) {
    console.error(`Fixture results are stale: ${mismatches.join(", ")}`);
    process.exitCode = 1;
  } else {
    console.log("Three routing fixture results are reproducible.");
  }
}
