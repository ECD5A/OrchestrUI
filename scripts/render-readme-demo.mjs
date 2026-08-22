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
const height = 540;
const frameDelay = 460;
const palette = [
  [7, 8, 16], [8, 9, 18], [10, 11, 21], [12, 14, 24], [15, 18, 30], [19, 21, 35],
  [26, 28, 44], [38, 40, 58], [61, 64, 83], [92, 96, 116], [126, 130, 149], [170, 174, 191],
  [209, 211, 222], [243, 244, 251], [161, 120, 255], [181, 140, 255], [114, 217, 237], [120, 229, 207],
  [72, 58, 112], [47, 39, 74], [31, 33, 50], [13, 31, 37], [19, 48, 54], [45, 85, 87],
  [96, 174, 163], [113, 88, 164], [104, 107, 126], [82, 86, 105], [55, 59, 76], [28, 53, 60],
  [11, 13, 22], [0, 0, 0],
];

const phases = [
  {
    code: "01 / INSPECT",
    name: "Inspect",
    title: "Read the host before choosing.",
    detail: "Structured project evidence replaces prompt-keyword guessing.",
    color: "#A178FF",
    output: ["base owner  /  inspected", "specialist  /  pending", "state       /  structured"],
  },
  {
    code: "02 / ROUTE",
    name: "Route",
    title: "Choose the smallest valid stack.",
    detail: "Keep shadcn/ui. Add Bklit only for the data-visualization gap.",
    color: "#72D9ED",
    output: ["base owner  /  shadcn/ui", "specialist  /  Bklit UI", "state       /  routed"],
  },
  {
    code: "03 / HARMONIZE",
    name: "Harmonize",
    title: "Give every major role one owner.",
    detail: "Preserved, selected, and rejected candidates carry rule evidence.",
    color: "#B58CFF",
    output: ["base owner  /  shadcn/ui", "charts      /  Bklit UI", "state       /  2 owners"],
  },
  {
    code: "04 / AUDIT",
    name: "Audit",
    title: "Report evidence, not confidence.",
    detail: "Verified checks score. Rendered-host checks stay pending.",
    color: "#78E5CF",
    output: ["verified    /  8 / 8", "pending     /  5", "blockers    /  0"],
  },
];

function esc(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function phaseSvg(phaseIndex, localProgress) {
  const phase = phases[phaseIndex];
  const nodes = [120, 360, 600, 840];
  const progress = (phaseIndex + localProgress) / (phases.length - 1);
  const signalX = Math.min(nodes[3], nodes[0] + (nodes[3] - nodes[0]) * progress);
  const outputOpacity = phaseIndex === 0 ? .44 + localProgress * .32 : 1;
  const orbit = Math.round(localProgress * 220 + phaseIndex * 70);
  const nodeMarkup = phases.map((item, index) => {
    const active = index === phaseIndex;
    const complete = index < phaseIndex;
    const nodeColor = active ? phase.color : complete ? "#78E5CF" : "#4D5062";
    const glow = active ? `<circle cx="${nodes[index]}" cy="179" r="20" fill="${phase.color}" fill-opacity=".07"/>` : "";
    return `${glow}
      <circle cx="${nodes[index]}" cy="179" r="13" fill="#0B0C15" stroke="${nodeColor}" stroke-width="${active ? 2 : 1}"/>
      <circle cx="${nodes[index]}" cy="179" r="3" fill="${nodeColor}"/>
      <text x="${nodes[index]}" y="151" fill="${active ? "#F3F4FB" : "#686C7E"}" font-family="Segoe UI, Arial, sans-serif" font-size="12" font-weight="700" text-anchor="middle">${item.name}</text>
      <text x="${nodes[index]}" y="209" fill="${active ? nodeColor : "#45495A"}" font-family="Consolas, monospace" font-size="9" text-anchor="middle">0${index + 1}</text>`;
  }).join("");
  const outputRows = phase.output.map((row, index) => `<text x="697" y="329" dy="${index * 33}" fill="#C9CCD8" font-family="Consolas, monospace" font-size="13" opacity="${outputOpacity}">${esc(row)}</text>`).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="960" y2="540" gradientUnits="userSpaceOnUse">
        <stop stop-color="#160E28"/><stop offset=".48" stop-color="#080912"/><stop offset="1" stop-color="#061A20"/>
      </linearGradient>
      <radialGradient id="violetGlow" cx="0" cy="0" r="1" gradientTransform="translate(80 20) rotate(39) scale(400 330)" gradientUnits="userSpaceOnUse"><stop stop-color="#6B36AE" stop-opacity=".42"/><stop offset="1" stop-color="#6B36AE" stop-opacity="0"/></radialGradient>
      <radialGradient id="mintGlow" cx="0" cy="0" r="1" gradientTransform="translate(920 530) rotate(-132) scale(390 330)" gradientUnits="userSpaceOnUse"><stop stop-color="#087988" stop-opacity=".34"/><stop offset="1" stop-color="#087988" stop-opacity="0"/></radialGradient>
      <linearGradient id="route" x1="120" y1="0" x2="840" y2="0" gradientUnits="userSpaceOnUse"><stop stop-color="#A178FF"/><stop offset=".5" stop-color="#72D9ED"/><stop offset="1" stop-color="#78E5CF"/></linearGradient>
      <filter id="soft"><feGaussianBlur stdDeviation="8"/></filter>
      <pattern id="grain" width="96" height="96" patternUnits="userSpaceOnUse"><path d="M8 17h1M56 7h1M74 49h1M22 71h1M91 83h1M43 41h1" stroke="#F3F4FB" stroke-opacity=".06"/></pattern>
    </defs>

    <rect width="960" height="540" fill="url(#bg)"/>
    <rect width="960" height="540" fill="url(#violetGlow)"/>
    <rect width="960" height="540" fill="url(#mintGlow)"/>
    <rect width="960" height="540" fill="url(#grain)"/>

    <g transform="translate(48 48)">
      <circle cx="12" cy="12" r="10" fill="none" stroke="#B897FF" stroke-width="1" opacity=".6"/>
      <circle cx="12" cy="12" r="5" fill="none" stroke="#B897FF" stroke-width="1.4"/>
      <circle cx="12" cy="12" r="1.4" fill="#B897FF"/>
      <text x="34" y="17" fill="#F3F4FB" font-family="Segoe UI, Arial, sans-serif" font-size="17" font-weight="700">OrchestrUI</text>
    </g>
    <g transform="translate(720 47)">
      <rect width="124" height="26" rx="13" fill="#FFFFFF" fill-opacity=".025" stroke="#B4C0DC" stroke-opacity=".18"/>
      <circle cx="15" cy="13" r="3" fill="#78E5CF"/>
      <text x="25" y="17" fill="#BFC2CF" font-family="Consolas, monospace" font-size="10" font-weight="700" letter-spacing=".8">READ-ONLY MCP</text>
      <rect x="132" width="80" height="26" rx="13" fill="#FFFFFF" fill-opacity=".025" stroke="#B4C0DC" stroke-opacity=".18"/>
      <text x="172" y="17" fill="#BFC2CF" font-family="Consolas, monospace" font-size="10" font-weight="700" text-anchor="middle" letter-spacing=".7">SKILLS</text>
    </g>

    <text x="48" y="115" fill="#A995D9" font-family="Consolas, monospace" font-size="10" font-weight="700" letter-spacing="1.8">LIVE POLICY TRACE</text>
    <text x="912" y="115" fill="${phase.color}" font-family="Consolas, monospace" font-size="10" font-weight="700" text-anchor="end" letter-spacing="1">${phase.code}</text>

    <path d="M120 179H840" stroke="#B4C0DC" stroke-opacity=".14"/>
    <path d="M120 179H${signalX}" stroke="url(#route)" stroke-width="2"/>
    <circle cx="${signalX}" cy="179" r="4" fill="#F3F4FB"/>
    <circle cx="${signalX}" cy="179" r="10" fill="${phase.color}" fill-opacity=".11"/>
    ${nodeMarkup}

    <rect x="48" y="246" width="244" height="177" rx="13" fill="#090B14" fill-opacity=".7" stroke="#B4C0DC" stroke-opacity=".14"/>
    <text x="70" y="277" fill="#777C8F" font-family="Consolas, monospace" font-size="10" font-weight="700" letter-spacing="1.3">INPUT</text>
    <path d="M70 295H270" stroke="#B4C0DC" stroke-opacity=".12"/>
    <text x="70" y="325" fill="#555A6E" font-family="Consolas, monospace" font-size="11">framework</text><text x="270" y="325" fill="#D1D3DE" font-family="Consolas, monospace" font-size="11" text-anchor="end">Next.js 15</text>
    <text x="70" y="356" fill="#555A6E" font-family="Consolas, monospace" font-size="11">base owner</text><text x="270" y="356" fill="#D1D3DE" font-family="Consolas, monospace" font-size="11" text-anchor="end">shadcn/ui</text>
    <text x="70" y="387" fill="#555A6E" font-family="Consolas, monospace" font-size="11">capability gap</text><text x="270" y="387" fill="#D1D3DE" font-family="Consolas, monospace" font-size="11" text-anchor="end">data-viz</text>

    <rect x="318" y="226" width="324" height="217" rx="15" fill="#0B0C15" fill-opacity=".76" stroke="#B4C0DC" stroke-opacity=".16"/>
    <circle cx="480" cy="303" r="44" fill="none" stroke="${phase.color}" stroke-opacity=".18"/>
    <g transform="translate(480 303) rotate(${orbit})"><circle r="34" fill="none" stroke="${phase.color}" stroke-width="1.5" stroke-dasharray="56 158" stroke-linecap="round"/></g>
    <circle cx="480" cy="303" r="18" fill="${phase.color}" fill-opacity=".06" stroke="${phase.color}" stroke-opacity=".7"/>
    <circle cx="480" cy="303" r="5" fill="none" stroke="${phase.color}" stroke-width="1.4"/>
    <circle cx="480" cy="303" r="1.5" fill="${phase.color}"/>
    <text x="480" y="374" fill="#F3F4FB" font-family="Segoe UI, Arial, sans-serif" font-size="19" font-weight="700" text-anchor="middle">${esc(phase.title)}</text>
    <text x="480" y="399" fill="#858A9D" font-family="Segoe UI, Arial, sans-serif" font-size="11" text-anchor="middle">${esc(phase.detail)}</text>
    <rect x="420" y="413" width="120" height="18" rx="9" fill="${phase.color}" fill-opacity=".09" stroke="${phase.color}" stroke-opacity=".25"/>
    <text x="480" y="425" fill="${phase.color}" font-family="Consolas, monospace" font-size="8" font-weight="700" text-anchor="middle" letter-spacing="1">${phase.name.toUpperCase()}</text>

    <rect x="668" y="246" width="244" height="177" rx="13" fill="#090B14" fill-opacity=".7" stroke="${phase.color}" stroke-opacity=".25"/>
    <text x="692" y="277" fill="${phase.color}" font-family="Consolas, monospace" font-size="10" font-weight="700" letter-spacing="1.3">DECISION</text>
    <path d="M692 295H888" stroke="${phase.color}" stroke-opacity=".18"/>
    ${outputRows}

    <text x="48" y="498" fill="#575B6D" font-family="Consolas, monospace" font-size="9">one owner per role</text>
    <circle cx="166" cy="495" r="1.5" fill="#665177"/><text x="180" y="498" fill="#575B6D" font-family="Consolas, monospace" font-size="9">public upstream only</text>
    <circle cx="306" cy="495" r="1.5" fill="#665177"/><text x="320" y="498" fill="#575B6D" font-family="Consolas, monospace" font-size="9">no install execution</text>
    <text x="912" y="498" fill="#656A7C" font-family="Consolas, monospace" font-size="9" text-anchor="end">Inspect → Route → Harmonize → Audit</text>
  </svg>`;
}

const encoder = GIFEncoder();
let frameCount = 0;
let stillFrame;

for (let phaseIndex = 0; phaseIndex < phases.length; phaseIndex += 1) {
  for (const step of [0, .58, 1]) {
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
