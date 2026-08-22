/*
 * OrchestrUI — Agent-native UI orchestration for modern frontend stacks.
 * Copyright (c) 2026 ECD5A
 * Licensed under the MIT License.
 * https://github.com/ECD5A/OrchestrUI
 * SPDX-License-Identifier: MIT
 */

import fs from "node:fs";
import { isIP } from "node:net";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ignoredDirectories = new Set([".git", "dist", "node_modules"]);
const checkedExtensions = new Set([".md", ".json", ".yml", ".yaml"]);
const packageVersion = JSON.parse(fs.readFileSync(new URL("../package.json", import.meta.url), "utf8")).version;

function isNonPublicIpv4(hostname) {
  const parts = hostname.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return true;
  const [a, b, c] = parts;
  return a === 0
    || a === 10
    || a === 127
    || (a === 100 && b >= 64 && b <= 127)
    || (a === 169 && b === 254)
    || (a === 172 && b >= 16 && b <= 31)
    || (a === 192 && (b === 0 || b === 168))
    || (a === 198 && (b === 18 || b === 19 || (b === 51 && c === 100)))
    || (a === 203 && b === 0 && c === 113)
    || a >= 224;
}

function isNonPublicIpv6(hostname) {
  const value = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  return value === "::"
    || value === "::1"
    || value.startsWith("fc")
    || value.startsWith("fd")
    || /^fe[89ab]/.test(value)
    || value.startsWith("ff")
    || value.startsWith("2001:db8:")
    || value.startsWith("::ffff:");
}

export function isPublicHttpsUrl(value) {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase().replace(/\.$/, "");
    if (url.protocol !== "https:" || url.username || url.password || !hostname) return false;
    if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local")) return false;
    const addressType = isIP(hostname.replace(/^\[|\]$/g, ""));
    if (addressType === 4) return !isNonPublicIpv4(hostname);
    if (addressType === 6) return !isNonPublicIpv6(hostname);
    return hostname.includes(".");
  } catch {
    return false;
  }
}

function listFiles(root = ".", relative = "") {
  return fs.readdirSync(path.join(root, relative), { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) return [];
    const next = path.join(relative, entry.name);
    return entry.isDirectory() ? listFiles(root, next) : [next];
  });
}

export async function checkExternalUrl(url, fetchImpl = fetch) {
  try {
    if (!isPublicHttpsUrl(url)) throw new Error("rejected non-public HTTPS destination");
    const requestUrl = url.endsWith(".git") ? url.slice(0, -4) : url;
    const response = await fetchImpl(requestUrl, {
      method: "HEAD",
      redirect: "error",
      headers: { "user-agent": `OrchestrUI-release-check/${packageVersion}` },
      signal: AbortSignal.timeout(12_000),
    });
    return { url, status: response.status };
  } catch (error) {
    return { url, status: 0, detail: error instanceof Error ? error.message : String(error) };
  }
}

export function isDeferredCanonicalUrl(value) {
  try {
    const url = new URL(value);
    const pathName = url.pathname.toLowerCase();
    return (url.hostname === "github.com" && pathName.startsWith("/ecd5a/orchestrui"))
      || (url.hostname === "raw.githubusercontent.com" && pathName.startsWith("/ecd5a/orchestrui/"))
      || (url.hostname === "ecd5a.github.io" && (pathName === "/orchestrui" || pathName.startsWith("/orchestrui/")));
  } catch {
    return false;
  }
}

export async function runExternalLinkCheck(root = ".", {
  allowPrivateCanonical = process.env.ORCHESTRUI_PUBLICATION_DEFERRED === "1",
} = {}) {
  const urls = new Map();
  for (const file of listFiles(root).filter((candidate) => checkedExtensions.has(path.extname(candidate).toLowerCase()))) {
    if (path.basename(file) === "package-lock.json") continue;
    const text = fs.readFileSync(path.join(root, file), "utf8");
    for (const match of text.matchAll(/https:\/\/[^\s<>()|`"']+/g)) {
      const url = match[0].replace(/[.,;:!?]+$/, "");
      if (url.includes("{") || url.includes("}")) continue;
      const key = url.replace(/#.*$/, "");
      if (!urls.has(key)) urls.set(key, new Set());
      urls.get(key).add(file.replaceAll("\\", "/"));
    }
  }

  const entries = [...urls.keys()].sort();
  const results = [];
  for (let index = 0; index < entries.length; index += 6) {
    results.push(...await Promise.all(entries.slice(index, index + 6).map((url) => checkExternalUrl(url))));
  }

  const deferred = results.filter(({ url, status }) => allowPrivateCanonical
    && status === 404
    && isDeferredCanonicalUrl(url));
  const deferredUrls = new Set(deferred.map(({ url }) => url));
  const broken = results.filter(({ url, status }) => (status === 404 || status === 410) && !deferredUrls.has(url));
  const inconclusive = results.filter(({ status }) => status === 0
    || status === 401
    || status === 403
    || status === 429
    || status >= 500);
  for (const result of broken) {
    console.error(`BROKEN ${result.status} ${result.url} (${[...urls.get(result.url)].join(", ")})`);
  }
  for (const result of deferred) {
    console.warn(`DEFERRED ${result.status} ${result.url} — canonical project URL is hidden while the repository is private`);
  }
  for (const result of inconclusive) {
    console.warn(`WARN ${result.status || "network"} ${result.url}${result.detail ? ` — ${result.detail}` : ""}`);
  }
  console.log(`External link check: ${entries.length} unique URLs; ${broken.length} broken; ${deferred.length} deferred; ${inconclusive.length} inconclusive.`);
  if (broken.length) process.exitCode = 1;
  return { checked: entries.length, broken: broken.length, deferred: deferred.length, inconclusive: inconclusive.length };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  await runExternalLinkCheck();
}
