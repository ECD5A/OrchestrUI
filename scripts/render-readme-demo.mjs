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

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const width = 960;
const height = 480;
const frameDelay = 32;
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
    code: "01 / INSPECT",
    title: "Read the host project",
    copy: "Detect the base system and the actual capability gap.",
    status: "SCANNING",
    values: ["base  /  pending", "charts  /  pending", "conflicts  /  —"],
    color: "#22D3EE",
  },
  {
    code: "02 / ROUTE",
    title: "Select one owner per role",
    copy: "Keep the existing base. Add only the missing specialist.",
    status: "ROUTED",
    values: ["base  /  shadcn/ui", "charts  /  Bklit UI", "rejected  /  daisyUI"],
    color: "#2DD4BF",
  },
  {
    code: "03 / HARMONIZE",
    title: "Map to the host tokens",
    copy: "Typography, spacing, color, and motion stay coherent.",
    status: "NORMALIZED",
    values: ["base  /  shadcn/ui", "charts  /  Bklit UI", "tokens  /  mapped"],
    color: "#7667F4",
  },
  {
    code: "04 / AUDIT",
    title: "Verify the rendered result",
    copy: "Check accessibility, motion, licensing, and overlap.",
    status: "READY",
    values: ["base  /  shadcn/ui", "charts  /  Bklit UI", "conflicts  /  0"],
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
    <text x="62" y="104" fill="#8FA0B8" font-family="Consolas, monospace" font-size="13" letter-spacing="1.5">ONE UI DECISION, MADE EXPLICIT</text>
    <text x="780" y="76" fill="${phase.color}" font-family="Consolas, monospace" font-size="13" font-weight="700" text-anchor="end">${phase.code}</text>

    <rect x="62" y="150" width="228" height="236" rx="16" fill="#0D1728" stroke="#2C425F"/>
    <text x="86" y="187" fill="#67E8F9" font-family="Consolas, monospace" font-size="12" font-weight="700" letter-spacing="1.5">HOST PROJECT</text>
    <text x="86" y="228" fill="#F8FAFC" font-family="Segoe UI, Arial, sans-serif" font-size="20" font-weight="700">React dashboard</text>
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
    <text x="674" y="187" fill="#A99EFF" font-family="Consolas, monospace" font-size="12" font-weight="700" letter-spacing="1.5">PLAN OUTPUT</text>
    ${rows}
    <rect x="674" y="334" width="154" height="29" rx="14.5" fill="${phase.color}" fill-opacity="0.14" stroke="${phase.color}" stroke-opacity="0.5"/>
    <text x="751" y="354" fill="${phase.color}" font-family="Consolas, monospace" font-size="12" font-weight="700" text-anchor="middle">${phase.status}</text>

    <text x="62" y="422" fill="#F8FAFC" font-family="Segoe UI, Arial, sans-serif" font-size="21" font-weight="650">${esc(phase.title)}</text>
    <text x="62" y="445" fill="#8FA0B8" font-family="Segoe UI, Arial, sans-serif" font-size="14">${esc(phase.copy)}</text>
  </svg>`;
}

function quantize(pixels) {
  const indexes = new Uint8Array(width * height);
  for (let index = 0, offset = 0; index < indexes.length; index += 1, offset += 4) {
    let bestIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;
    for (let paletteIndex = 0; paletteIndex < palette.length; paletteIndex += 1) {
      const [red, green, blue] = palette[paletteIndex];
      const distance = (pixels[offset] - red) ** 2 + (pixels[offset + 1] - green) ** 2 + (pixels[offset + 2] - blue) ** 2;
      if (distance < bestDistance) {
        bestIndex = paletteIndex;
        bestDistance = distance;
      }
    }
    indexes[index] = bestIndex;
  }
  return indexes;
}

function lzw(indexes, minimumCodeSize) {
  const clearCode = 1 << minimumCodeSize;
  const endCode = clearCode + 1;
  let codeSize = minimumCodeSize + 1;
  let nextCode = endCode + 1;
  let bitBuffer = 0;
  let bitLength = 0;
  const bytes = [];
  const dictionary = new Map();

  const write = (code) => {
    bitBuffer |= code << bitLength;
    bitLength += codeSize;
    while (bitLength >= 8) {
      bytes.push(bitBuffer & 0xff);
      bitBuffer >>>= 8;
      bitLength -= 8;
    }
  };
  const reset = () => {
    dictionary.clear();
    codeSize = minimumCodeSize + 1;
    nextCode = endCode + 1;
  };

  reset();
  write(clearCode);
  let prefix = indexes[0];
  for (let index = 1; index < indexes.length; index += 1) {
    const value = indexes[index];
    const key = (prefix << 8) | value;
    const known = dictionary.get(key);
    if (known !== undefined) {
      prefix = known;
      continue;
    }
    write(prefix);
    if (nextCode < 4096) {
      dictionary.set(key, nextCode);
      nextCode += 1;
      if (nextCode === (1 << codeSize) && codeSize < 12) codeSize += 1;
    } else {
      write(clearCode);
      reset();
    }
    prefix = value;
  }
  write(prefix);
  write(endCode);
  if (bitLength > 0) bytes.push(bitBuffer & 0xff);
  return Buffer.from(bytes);
}

function gif(frames) {
  const bytes = [];
  const push = (...values) => bytes.push(...values);
  const short = (value) => push(value & 0xff, (value >> 8) & 0xff);
  const ascii = (value) => push(...Buffer.from(value, "ascii"));

  ascii("GIF89a");
  short(width);
  short(height);
  push(0xf4, 0, 0);
  for (const color of palette) push(...color);
  push(0x21, 0xff, 0x0b);
  ascii("NETSCAPE2.0");
  push(0x03, 0x01, 0x00, 0x00, 0x00);

  for (const frame of frames) {
    push(0x21, 0xf9, 0x04, 0x04);
    short(frameDelay);
    push(0x00, 0x00);
    push(0x2c);
    short(0);
    short(0);
    short(width);
    short(height);
    push(0x00, 0x05);
    const compressed = lzw(frame, 5);
    for (let offset = 0; offset < compressed.length; offset += 255) {
      const block = compressed.subarray(offset, offset + 255);
      push(block.length, ...block);
    }
    push(0x00);
  }
  push(0x3b);
  return Buffer.from(bytes);
}

const frames = [];
let stillFrame;
for (let phaseIndex = 0; phaseIndex < phases.length; phaseIndex += 1) {
  for (const step of [0, 0.34, 0.68, 1]) {
    const image = new Resvg(phaseSvg(phaseIndex, step), {
      fitTo: { mode: "width", value: width },
      font: { loadSystemFonts: true, defaultFontFamily: "Segoe UI" },
    }).render();
    frames.push(quantize(image.pixels));
    if (phaseIndex === phases.length - 1 && step === 1) stillFrame = image.asPng();
  }
}

const destination = path.join(root, "assets", "readme-demo.gif");
const stillDestination = path.join(root, "assets", "readme-demo.png");
fs.writeFileSync(destination, gif(frames));
fs.writeFileSync(stillDestination, stillFrame);
console.log(`Rendered ${path.relative(root, destination)} (${fs.statSync(destination).size} bytes, ${frames.length} frames)`);
console.log(`Rendered ${path.relative(root, stillDestination)} (${fs.statSync(stillDestination).size} bytes)`);
