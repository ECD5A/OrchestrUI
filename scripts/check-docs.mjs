#!/usr/bin/env node
/*
 * OrchestrUI — documentation and skill consistency checks.
 * Copyright (c) 2026 ECD5A
 * Licensed under the MIT License.
 * https://github.com/ECD5A/OrchestrUI
 * SPDX-License-Identifier: MIT
 */

import fs from "node:fs";
import path from "node:path";

const fail = (message) => { throw new Error(message); };
const ignored = new Set([".git", "dist", "node_modules"]);

function filesUnder(root, relative = "") {
  const current = path.join(root, relative);
  return fs.readdirSync(current, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory() && ignored.has(entry.name)) return [];
    const next = path.join(relative, entry.name);
    return entry.isDirectory() ? filesUnder(root, next) : [next.replaceAll("\\", "/")];
  });
}

const markdownFiles = filesUnder(".").filter((file) => file.toLowerCase().endsWith(".md"));
for (const markdownFile of markdownFiles) {
  const markdown = fs.readFileSync(markdownFile, "utf8");
  for (const match of markdown.matchAll(/!?(?:\[[^\]]*\])\(([^)]+)\)/g)) {
    const rawTarget = match[1].trim();
    const targetWithFragment = rawTarget.startsWith("<")
      ? rawTarget.slice(1, rawTarget.indexOf(">"))
      : rawTarget.split(/\s+["']/)[0];
    if (/^(?:https?:|mailto:|#)/i.test(targetWithFragment)) continue;
    const target = decodeURIComponent(targetWithFragment.split(/[?#]/, 1)[0]);
    if (!target) continue;
    const resolved = path.resolve(path.dirname(markdownFile), target);
    if (!fs.existsSync(resolved)) fail(`${markdownFile} has a broken relative link: ${targetWithFragment}`);
  }
}

function validateSkillPair(skill) {
  for (const root of ["skills", ".agents/skills"]) {
    const file = path.join(root, skill, "SKILL.md");
    if (!fs.existsSync(file)) fail(`Missing skill file: ${file}`);
    const text = fs.readFileSync(file, "utf8").replaceAll("\r\n", "\n");
    if (!text.startsWith("---\n") || !text.includes("\n---\n", 4)) fail(`${file} has invalid frontmatter`);
    const frontmatter = text.slice(4, text.indexOf("\n---\n", 4));
    if (!new RegExp(`^name:\\s*${skill}$`, "m").test(frontmatter)) fail(`${file} name does not match its directory`);
    if (!/^description:\s*.+/m.test(frontmatter)) fail(`${file} is missing a description`);
  }
  const packaged = fs.readFileSync(path.join("skills", skill, "SKILL.md"), "utf8").replaceAll("\r\n", "\n");
  const agent = fs.readFileSync(path.join(".agents/skills", skill, "SKILL.md"), "utf8").replaceAll("\r\n", "\n");
  if (packaged !== agent) fail(`Packaged skill is out of sync: ${skill}`);
  const sourceFiles = filesUnder(path.join(".agents/skills", skill)).sort();
  const packageFiles = filesUnder(path.join("skills", skill)).sort();
  if (JSON.stringify(sourceFiles) !== JSON.stringify(packageFiles)) fail(`Skill file lists differ: ${skill}`);
  for (const file of sourceFiles) {
    const left = fs.readFileSync(path.join(".agents/skills", skill, file), "utf8").replaceAll("\r\n", "\n");
    const right = fs.readFileSync(path.join("skills", skill, file), "utf8").replaceAll("\r\n", "\n");
    if (left !== right) fail(`Skill reference is out of sync: ${skill}/${file}`);
  }
}

for (const skill of ["ui-library-router", "ui-orchestrator", "ui-quality-audit"]) validateSkillPair(skill);

const readme = fs.readFileSync("README.md", "utf8");
const readmeRu = fs.readFileSync("README_RU.md", "utf8");
if (!readme.includes("README_RU.md") || !readmeRu.includes("README.md")) {
  fail("README language links must remain reciprocal");
}

console.log(`Documentation checks passed (${markdownFiles.length} Markdown files, 3 skill pairs).`);
