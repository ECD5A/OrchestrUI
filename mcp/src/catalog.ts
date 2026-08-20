/*
 * OrchestrUI — Agent-native UI orchestration for modern frontend stacks.
 * Copyright (c) 2026 ECD5A
 * Licensed under the MIT License.
 * https://github.com/ECD5A/OrchestrUI
 * SPDX-License-Identifier: MIT
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, join, parse } from "node:path";
import { fileURLToPath } from "node:url";

import type { ComponentCatalog, LibraryCatalog, OrchestrUiData } from "./types.js";

function findProjectRoot(start = dirname(fileURLToPath(import.meta.url))): string {
  let current = start;
  const root = parse(current).root;

  while (true) {
    const packagePath = join(current, "package.json");
    if (existsSync(packagePath)) {
      const manifest = JSON.parse(readFileSync(packagePath, "utf8")) as { name?: string };
      if (manifest.name === "orchestrui") return current;
    }
    if (current === root) break;
    current = dirname(current);
  }

  throw new Error("Unable to locate the OrchestrUI project root");
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

export function loadOrchestrUiData(projectRoot = findProjectRoot()): OrchestrUiData {
  const catalog = readJson<LibraryCatalog>(join(projectRoot, "catalog", "libraries.json"));
  const components = readJson<ComponentCatalog>(join(projectRoot, "catalog", "components.json"));

  if (catalog.project !== "OrchestrUI" || catalog.libraries.length !== 7) {
    throw new Error("Invalid OrchestrUI library catalog");
  }
  if (Object.keys(components.libraries).length !== 7) {
    throw new Error("Invalid OrchestrUI component catalog");
  }

  return { catalog, components };
}

export function getLibrary(data: OrchestrUiData, id: string) {
  const library = data.catalog.libraries.find((candidate) => candidate.id === id);
  if (!library) throw new Error(`Unknown library id: ${id}`);
  return library;
}
