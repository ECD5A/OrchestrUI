/*
 * OrchestrUI — animated README preview.
 * Copyright (c) 2026 ECD5A
 * Licensed under the MIT License.
 * SPDX-License-Identifier: MIT
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Resvg } from "@resvg/resvg-js";
import gifenc from "gifenc";

const { GIFEncoder, applyPalette } = gifenc;

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const width = 960;
const height = 480;
const frameDelay = 440;
const palette = [
  [7, 16, 29], [11, 23, 41], [13, 23, 40], [20, 36, 58], [38, 54, 80], [65, 81, 108],
  [103, 121, 144], [148, 163, 184], [168, 179, 199], [201, 210, 225], [248, 250, 252],
  [34, 211, 238], [45, 212, 191], [118, 103, 244], [103, 232, 249], [94, 234, 212],
  [169, 158, 255], [31, 44, 64], [51, 67, 91], [84, 100, 123], [111, 129, 152],
  [28, 53, 72], [20, 58, 70], [42, 39, 85], [19, 42, 58], [26, 65, 77],
  [231, 253, 255], [220, 252, 231], [237, 233, 254], [14, 31, 50], [9, 21, 34], [0, 0, 0],
];

const phases = [
  {
    code: "01 / PROFILE",
    title: "Normalize explicit project evidence",
    copy: "HostProfile and TaskProfile replace prompt-keyword guessing.",
    status: "STRUCTURED",
    values: ["mode  /  structured", "base  /  shadcn/ui", "need  /  data-viz"],
    color: "#22D3EE",
  },
  {
    code: "02 / ROUTE",
    title: "Apply the deterministic policy matrix",
    copy: "Keep the existing base and add only the missing specialist.",
    status: "ROUTED",
    values: ["selected  /  Bklit UI", "rejected  /  6", "owners  /  2"],
    color: "#2DD4BF",
  },
  {
    code: "03 / EVIDENCE",
    title: "Explain ownership and rejection",
    copy: "Every decision carries a rule ID and inspectable evidence.",
    status: "EXPLICIT",
    values: ["role  /  data-viz", "rule  /  ownership", "base  /  preserved"],
    color: "#7667F4",
  },
  {
    code: "04 / AUDIT",
    title: "Score only verified checks",
    copy: "Rendered-host checks stay pending until evidence is attached.",
    status: "5 PENDING",
    values: ["verified  /  8/8", "pending  /  5", "blockers  /  0"],
    color: "#67E8F9",
  },
];

function esc(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function phaseSvg(phaseIndex, localProgress) {
  const phase = phases[phaseIndex];
  const pulseX = 318 + localProgress * 328;
  const rightPulseX = 648 + localProgress * 95;
  const orbit = Math.round(localProgress * 360);
  const checkOpacity = phaseIndex === 0 ? 0.25 : 0.45 + localProgress * 0.55;
  const outputOpacity = phaseIndex === 0 ? 0.42 + localProgress * 0.24 : 1;
  const progressWidth = 180 + (phaseIndex + localProgress) * 112;
  const rows = phase.values.map((value, index) => `<text x="${684}" y="${212 + index * 38}" fill="#D7E1EF" font-family="Segoe UI, Arial, sans-serif" font-size="15" opacity="${outputOpacity}">${esc(value)}</text>`).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="960" y2="480" gradientUnits="userSpaceOnUse"><stop stop-color="#122039"/><stop offset="1" stop-color="#07101D"/></linearGradient>
      <linearGradient id="route" x1="318" y1="0" x2="743" y2="0" gradientUnits="userSpaceOnUse"><stop stop-color="#22D3EE"/><stop offset="0.52" stop-color="#2DD4BF"/><stop offset="1" stop-color="#7667F4"/></linearGradient>
      <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="#94A3B8" stroke-opacity="0.055"/></pattern>
    </defs>
    <rect width="960" height="480" fill="url(#bg)"/>
    <rect width="960" height="480" fill="url(#grid)"/>
    <rect x="25" y="25" width="910" height="430" rx="28" fill="#0B1729" fill-opacity="0.74" stroke="#263650" stroke-width="2"/>
    <text x="62" y="76" fill="#E7FDFF" font-family="Segoe UI, Arial, sans-serif" font-size="32" font-weight="700" letter-spacing="-1">OrchestrUI</text>
    <text x="62" y="104" fill="#8FA0B8" font-family="Consolas, monospace" font-size="13" letter-spacing="1.5">STRUCTURED INPUT, EXPLICIT POLICY EVIDENCE</text>
    <text x="780" y="76" fill="${phase.color}" font-family="Consolas, monospace" font-size="13" font-weight="700" text-anchor="end">${phase.code}</text>

    <rect x="62" y="150" width="228" height="236" rx="16" fill="#0D1728" stroke="#2C425F"/>
    <text x="86" y="187" fill="#67E8F9" font-family="Consolas, monospace" font-size="12" font-weight="700" letter-spacing="1.5">FIXTURE INPUT</text>
    <text x="86" y="228" fill="#F8FAFC" font-family="Segoe UI, Arial, sans-serif" font-size="20" font-weight="700">Next.js dashboard</text>
    <text x="86" y="267" fill="#A8B3C7" font-family="Consolas, monospace" font-size="15">base     / shadcn/ui</text>
    <text x="86" y="300" fill="#A8B3C7" font-family="Consolas, monospace" font-size="15">tokens   / detected</text>
    <text x="86" y="333" fill="#A8B3C7" font-family="Consolas, monospace" font-size="15">gap      / charts</text>

    <path d="M290 268H650" fill="none" stroke="#41516C" stroke-width="4" stroke-linecap="round"/>
    <path d="M290 268H${progressWidth}" fill="none" stroke="url(#route)" stroke-width="6" stroke-linecap="round"/>
    <circle cx="${pulseX}" cy="268" r="9" fill="#F8FAFC" stroke="${phase.color}" stroke-width="5"/>
    <circle cx="${rightPulseX}" cy="268" r="5" fill="${phase.color}" opacity="${0.25 + localProgress * 0.75}"/>

    <g transform="translate(470 268) rotate(${orbit})">
      <circle r="63" fill="#0D1728" stroke="#263650" stroke-width="5"/>
      <path d="M0-57A57 57 0 ${localProgress > 0.5 ? 1 : 0} 1 ${Math.round(57 * Math.sin(localProgress * Math.PI * 2))} ${Math.round(-57 * Math.cos(localProgress * Math.PI * 2))}" fill="none" stroke="${phase.color}" stroke-width="6" stroke-linecap="round"/>
    </g>
    <circle cx="470" cy="268" r="38" fill="#122039" stroke="${phase.color}" stroke-width="2"/>
    <path d="M453 268L465 280L489 252" fill="none" stroke="#F8FAFC" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" opacity="${checkOpacity}"/>
    <text x="470" y="354" fill="${phase.color}" font-family="Consolas, monospace" font-size="12" font-weight="700" text-anchor="middle">${phase.status}</text>

    <rect x="650" y="150" width="228" height="236" rx="16" fill="#0D1728" stroke="#2C425F"/>
    <text x="674" y="187" fill="#A99EFF" font-family="Consolas, monospace" font-size="12" font-weight="700" letter-spacing="1.5">POLICY OUTPUT</text>
    ${rows}
    <rect x="674" y="334" width="154" height="29" rx="14.5" fill="${phase.color}" fill-opacity="0.14" stroke="${phase.color}" stroke-opacity="0.5"/>
    <text x="751" y="354" fill="${phase.color}" font-family="Consolas, monospace" font-size="12" font-weight="700" text-anchor="middle">${phase.status}</text>

    <text x="62" y="422" fill="#F8FAFC" font-family="Segoe UI, Arial, sans-serif" font-size="21" font-weight="650">${esc(phase.title)}</text>
    <text x="62" y="445" fill="#8FA0B8" font-family="Segoe UI, Arial, sans-serif" font-size="14">${esc(phase.copy)}</text>
  </svg>`;
}

const encoder = GIFEncoder();
let frameCount = 0;
let stillFrame;
for (let phaseIndex = 0; phaseIndex < phases.length; phaseIndex += 1) {
  for (const step of [0, 0.55, 1]) {
    const image = new Resvg(phaseSvg(phaseIndex, step), {
      fitTo: { mode: "width", value: width },
      font: { loadSystemFonts: true, defaultFontFamily: "Segoe UI" },
    }).render();
    encoder.writeFrame(applyPalette(image.pixels, palette), width, height, {
      palette: frameCount === 0 ? palette : undefined,
      delay: frameDelay,
      repeat: 0,
    });
    frameCount += 1;
    if (phaseIndex === phases.length - 1 && step === 1) stillFrame = image.asPng();
  }
}
encoder.finish();

const destination = path.join(root, "assets", "readme-demo.gif");
const stillDestination = path.join(root, "assets", "readme-demo.png");
fs.writeFileSync(destination, encoder.bytes());
fs.writeFileSync(stillDestination, stillFrame);
console.log(`Rendered ${path.relative(root, destination)} (${fs.statSync(destination).size} bytes, ${frameCount} frames)`);
console.log(`Rendered ${path.relative(root, stillDestination)} (${fs.statSync(stillDestination).size} bytes)`);
