#!/usr/bin/env node
/*
 * OrchestrUI — deterministic fixture data for the Pages workflow demo.
 * Copyright (c) 2026 ECD5A
 * Licensed under the MIT License.
 * https://github.com/ECD5A/OrchestrUI
 * SPDX-License-Identifier: MIT
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const fixtureRoot = path.resolve("examples/fixtures");
const destination = path.resolve("site/fixtures.js");

const labels = {
  "daisy-admin": "daisyUI admin",
  "marketing-landing": "Marketing landing",
  "next-shadcn-dashboard": "Next.js dashboard",
};

function compactList(values, limit = 3) {
  const visible = values.slice(0, limit);
  const remaining = values.length - visible.length;
  return remaining > 0 ? [...visible, `+${remaining}`] : visible;
}

export function buildSiteFixtures() {
  return fs.readdirSync(fixtureRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((entry) => {
      const directory = path.join(fixtureRoot, entry.name);
      const fixture = JSON.parse(fs.readFileSync(path.join(directory, "fixture.json"), "utf8"));
      const result = JSON.parse(fs.readFileSync(path.join(directory, "result.json"), "utf8"));
      const recommendation = result.recommendation;
      const audit = result.audit;
      return {
        id: fixture.id,
        label: labels[fixture.id] ?? fixture.id,
        run_id: fixture.id.toUpperCase(),
        input_mode: recommendation.input_mode,
        summary: recommendation.summary,
        host: {
          framework: [fixture.host_profile.framework, fixture.host_profile.framework_version].filter(Boolean).join(" "),
          base: fixture.host_profile.design_system ?? "none",
          tokens: compactList(fixture.host_profile.tokens).join(", "),
          gap: fixture.task_profile.required_capabilities.join(", "),
        },
        selected: recommendation.selected.map((item) => ({
          id: item.id,
          role: item.role,
          capability: item.capability,
        })),
        rejected: recommendation.rejected.map((item) => ({ id: item.id, rule_id: item.rule_id })),
        owners: recommendation.role_ownership,
        decisions: recommendation.decisions,
        audit: {
          verified_score: audit.verified_score,
          verified_maximum: audit.verified_maximum,
          maximum_score: audit.maximum_score,
          pending_checks: audit.pending_checks,
          blockers: audit.blockers,
        },
      };
    });
}

export function serializeSiteFixtures(fixtures = buildSiteFixtures()) {
  return `globalThis.ORCHESTRUI_FIXTURES = Object.freeze(${JSON.stringify(fixtures, null, 2)});\n`;
}

export function verifySiteFixtures({ write = false } = {}) {
  const serialized = serializeSiteFixtures();
  if (write) {
    fs.writeFileSync(destination, serialized);
    return true;
  }
  return fs.existsSync(destination)
    && fs.readFileSync(destination, "utf8").replaceAll("\r\n", "\n") === serialized;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const write = process.argv.includes("--write");
  if (verifySiteFixtures({ write })) {
    console.log(write ? "Rebuilt site fixture data." : "Site fixture data is reproducible.");
  } else {
    console.error("site/fixtures.js is stale; run npm run site:data:write.");
    process.exitCode = 1;
  }
}
