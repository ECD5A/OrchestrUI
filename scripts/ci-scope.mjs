/* Copyright (c) 2026 ECD5A; SPDX-License-Identifier: MIT */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

export function classifyFiles(files) {
  return files.some((file) => /^(?:\.agents\/skills|skills)\//.test(file)
    || /(?:^|\/)AGENTS\.md$/i.test(file)
    || !/\.md$/i.test(file));
}

export function diffArguments(eventName, event) {
  if (eventName === "workflow_dispatch") return ["ls-files", "-z"];
  const sha = /^[a-f0-9]{40}$/i;
  if (eventName === "pull_request") {
    const base = event.pull_request?.base?.sha;
    const head = event.pull_request?.head?.sha;
    if (!sha.test(base ?? "") || !sha.test(head ?? "")) throw new Error("Missing PR revisions");
    return ["diff", "--name-only", "--no-renames", "-z", `${base}...${head}`, "--"];
  }
  if (eventName === "push") {
    if (!sha.test(event.before ?? "") || !sha.test(event.after ?? "")) throw new Error("Missing push revisions");
    if (/^0{40}$/.test(event.before)) return ["ls-files", "-z"];
    return ["diff", "--name-only", "--no-renames", "-z", event.before, event.after, "--"];
  }
  throw new Error(`Unsupported event: ${eventName}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const event = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, "utf8"));
  const files = execFileSync("git", diffArguments(process.env.GITHUB_EVENT_NAME, event), { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 }).split("\0").filter(Boolean);
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `code_changed=${classifyFiles(files)}\n`);
}
