/*
 * OrchestrUI — Agent-native UI orchestration for modern frontend stacks.
 * Copyright (c) 2026 ECD5A
 * Licensed under the MIT License.
 * https://github.com/ECD5A/OrchestrUI
 * SPDX-License-Identifier: MIT
 */

import type { ComponentItem } from "./types.js";
import { isIP } from "node:net";

export const DEFAULT_MAX_RESPONSE_BYTES = 512 * 1024;
export const DEFAULT_TIMEOUT_MS = 4_000;

type FetchLike = (input: string | URL, init?: RequestInit) => Promise<Response>;

type RegistryFetchOptions = {
  allowedUrls: ReadonlySet<string>;
  fetchImpl?: FetchLike;
  maxResponseBytes?: number;
  timeoutMs?: number;
  cacheTtlMs?: number;
};

type CacheEntry = { expiresAt: number; items: ComponentItem[] };
const registryCache = new Map<string, CacheEntry>();

function isNonPublicIpv4(hostname: string): boolean {
  const parts = hostname.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return true;
  const [a, b] = parts as [number, number, number, number];
  return a === 0
    || a === 10
    || a === 127
    || (a === 100 && b >= 64 && b <= 127)
    || (a === 169 && b === 254)
    || (a === 172 && b >= 16 && b <= 31)
    || (a === 192 && (b === 0 || b === 168))
    || (a === 198 && (b === 18 || b === 19 || (b === 51 && parts[2] === 100)))
    || (a === 203 && b === 0 && parts[2] === 113)
    || a >= 224;
}

function isNonPublicIpv6(hostname: string): boolean {
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

export function isPublicHttpsUrl(value: string): boolean {
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

function cleanText(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const cleaned = value
    .replace(/[\u0000-\u001f\u007f-\u009f\u061c\u200b-\u200f\u202a-\u202e\u2066-\u2069\ufeff]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return undefined;
  return cleaned.slice(0, maxLength);
}

function titleFromIdentifier(name: string): string {
  return name
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.length > 3 ? `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}` : part.toUpperCase())
    .join(" ")
    .slice(0, 160) || name;
}

function safeRegistryType(value: unknown): string | undefined {
  const type = cleanText(value, 80);
  return type && /^registry:(?:ui|component|block|hook|lib|page|file|style|theme|item)$/.test(type)
    ? type
    : undefined;
}

async function readBoundedBody(response: Response, maxBytes: number): Promise<string> {
  const declaredLength = Number(response.headers.get("content-length") ?? 0);
  if (declaredLength > maxBytes) throw new Error("Registry response exceeded the size limit");
  if (!response.body) throw new Error("Registry response had no body");

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      throw new Error("Registry response exceeded the size limit");
    }
    chunks.push(value);
  }

  const merged = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(merged);
}

function normalizeRegistry(payload: unknown): ComponentItem[] {
  if (!payload || typeof payload !== "object") throw new Error("Registry payload must be an object");
  const rawItems = (payload as { items?: unknown }).items;
  if (!Array.isArray(rawItems)) throw new Error("Registry payload has no items array");

  const normalized: ComponentItem[] = [];
  for (const raw of rawItems.slice(0, 2_000)) {
    if (!raw || typeof raw !== "object") continue;
    const record = raw as Record<string, unknown>;
    const name = cleanText(record.name, 120);
    if (!name || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(name)) continue;
    const title = titleFromIdentifier(name);
    const description = "Official registry item. Verify details at the cited upstream source.";
    const type = safeRegistryType(record.type);
    normalized.push(type ? { name, title, description, type } : { name, title, description });
  }
  return normalized;
}

export async function fetchRegistryItems(url: string, options: RegistryFetchOptions): Promise<ComponentItem[]> {
  if (!options.allowedUrls.has(url)) throw new Error("Registry URL is not allowlisted");
  if (!isPublicHttpsUrl(url)) throw new Error("Registry URL must use a public HTTPS host without credentials");

  const cached = registryCache.get(url);
  if (cached && cached.expiresAt > Date.now()) return cached.items;

  const timeoutMs = Math.min(Math.max(options.timeoutMs ?? DEFAULT_TIMEOUT_MS, 250), 10_000);
  const maxBytes = Math.min(
    Math.max(options.maxResponseBytes ?? DEFAULT_MAX_RESPONSE_BYTES, 1_024),
    DEFAULT_MAX_RESPONSE_BYTES,
  );
  const fetchImpl = options.fetchImpl ?? fetch;
  const response = await fetchImpl(url, {
    method: "GET",
    headers: { accept: "application/json", "user-agent": "OrchestrUI/0.1" },
    redirect: "error",
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) throw new Error(`Registry returned HTTP ${response.status}`);
  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.includes("application/json")) throw new Error("Registry returned a non-JSON response");

  const items = normalizeRegistry(JSON.parse(await readBoundedBody(response, maxBytes)));
  registryCache.set(url, {
    expiresAt: Date.now() + Math.min(options.cacheTtlMs ?? 300_000, 300_000),
    items,
  });
  while (registryCache.size > 8) {
    const oldest = registryCache.keys().next().value as string | undefined;
    if (!oldest) break;
    registryCache.delete(oldest);
  }
  return items;
}

export function clearRegistryCache(): void {
  registryCache.clear();
}
