/*
 * OrchestrUI — Agent-native UI orchestration for modern frontend stacks.
 * Copyright (c) 2026 ECD5A
 * Licensed under the MIT License.
 * https://github.com/ECD5A/OrchestrUI
 * SPDX-License-Identifier: MIT
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Resvg } from "@resvg/resvg-js";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const renders = [
  { source: "assets/readme-hero.svg", destination: "assets/readme-hero.png", width: 1200 },
  { source: "assets/social-preview.svg", destination: "assets/social-preview.png", width: 1280 },
];

for (const job of renders) {
  const source = path.join(projectRoot, job.source);
  const destination = path.join(projectRoot, job.destination);
  const svg = fs.readFileSync(source, "utf8");
  const renderer = new Resvg(svg, {
    fitTo: { mode: "width", value: job.width },
    font: {
      loadSystemFonts: true,
      defaultFontFamily: "Segoe UI",
    },
  });
  const png = renderer.render().asPng();
  fs.writeFileSync(destination, png);
  console.log(`Rendered ${job.destination} (${png.byteLength} bytes)`);
}
