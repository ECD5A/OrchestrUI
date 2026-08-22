#!/usr/bin/env node
/*
 * OrchestrUI — Agent-native UI orchestration for modern frontend stacks.
 * Copyright (c) 2026 ECD5A
 * Licensed under the MIT License.
 * https://github.com/ECD5A/OrchestrUI
 * SPDX-License-Identifier: MIT
 */

import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import * as z from "zod/v4";

import { loadOrchestrUiData } from "./catalog.js";
import {
  auditPlan,
  getInstallInstructions,
  getLibraryGuidance,
  listLibraries,
  recommendStack,
  searchComponents,
} from "./tools.js";
import type { OrchestrUiData } from "./types.js";

const READ_ONLY_ANNOTATIONS = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
} as const;

type FetchLike = (input: string | URL, init?: RequestInit) => Promise<Response>;

function result(value: object) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }],
    structuredContent: { result: value },
  };
}

function errorResult(error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected OrchestrUI error";
  return {
    isError: true,
    content: [{ type: "text" as const, text: message.slice(0, 500) }],
  };
}

function guarded<T extends object>(handler: () => T) {
  try {
    return result(handler());
  } catch (error) {
    return errorResult(error);
  }
}

async function guardedAsync<T extends object>(handler: () => Promise<T>) {
  try {
    return result(await handler());
  } catch (error) {
    return errorResult(error);
  }
}

export function createOrchestrUiServer(options: { data?: OrchestrUiData; fetchImpl?: FetchLike } = {}) {
  const data = options.data ?? loadOrchestrUiData();
  const server = new McpServer({ name: "orchestrui", version: data.version });

  server.registerTool(
    "list_libraries",
    {
      title: "List OrchestrUI libraries",
      description: "List the seven supported UI ecosystems and optionally filter by role. Returns metadata only.",
      inputSchema: z.object({
        role: z.string().trim().max(80).optional().describe("Optional role fragment such as charts or marketing-ui."),
      }),
      annotations: READ_ONLY_ANNOTATIONS,
    },
    ({ role }) => guarded(() => listLibraries({ role }, data)),
  );

  server.registerTool(
    "recommend_stack",
    {
      title: "Recommend a minimal UI stack",
      description: "Compute a minimal UI composition from structured host/task profiles, with task text supported as a legacy inference path.",
      inputSchema: z.object({
        task: z.string().trim().max(500).default(""),
        existing_stack: z.array(z.string().trim().min(1).max(80)).max(20).default([]),
        constraints: z.array(z.string().trim().min(1).max(160)).max(20).default([]),
        rive_asset_rights: z.enum(["confirmed", "unconfirmed", "not-applicable"]).default("not-applicable"),
        host_profile: z.object({
          framework: z.string().trim().min(1).max(80),
          framework_version: z.string().trim().min(1).max(40).optional(),
          react_version: z.string().trim().min(1).max(40).optional(),
          tailwind_version: z.string().trim().min(1).max(40).optional(),
          package_manager: z.enum(["npm", "pnpm", "yarn", "bun", "other"]).optional(),
          dependencies: z.record(
            z.string().trim().min(1).max(120),
            z.string().trim().min(1).max(80),
          ).refine((value) => Object.keys(value).length <= 100, "At most 100 dependencies are accepted.").default({}),
          design_system: z.string().trim().min(1).max(100).optional(),
          component_primitives: z.array(z.string().trim().min(1).max(80)).max(30).default([]),
          motion_stack: z.array(z.string().trim().min(1).max(80)).max(20).default([]),
          chart_stack: z.array(z.string().trim().min(1).max(80)).max(20).default([]),
          tokens: z.array(z.string().trim().min(1).max(80)).max(30).default([]),
          accessibility_constraints: z.array(z.string().trim().min(1).max(160)).max(20).default([]),
        }).optional(),
        task_profile: z.object({
          surface: z.enum(["application", "marketing", "hybrid"]).default("application"),
          required_capabilities: z.array(z.enum([
            "forms-controls",
            "product-polish",
            "data-visualization",
            "marketing-motion",
            "signature-creative-effect",
            "bespoke-motion",
            "interactive-vector",
          ])).max(7).default([]),
          interaction_complexity: z.enum(["low", "medium", "high"]).default("medium"),
          data_visualization: z.enum(["none", "basic", "advanced"]).default("none"),
          motion_requirement: z.enum(["none", "native", "bespoke", "interactive-vector"]).default("native"),
          rive_asset_rights: z.enum(["confirmed", "unconfirmed", "not-applicable"]).default("not-applicable"),
          constraints: z.array(z.string().trim().min(1).max(160)).max(20).default([]),
        }).optional(),
      }),
      annotations: READ_ONLY_ANNOTATIONS,
    },
    ({ task, existing_stack, constraints, rive_asset_rights, host_profile, task_profile }) => guarded(() => recommendStack({
      task,
      existingStack: existing_stack,
      constraints,
      riveAssetRights: rive_asset_rights,
      ...(host_profile ? { hostProfile: host_profile } : {}),
      ...(task_profile ? { taskProfile: task_profile } : {}),
    }, data)),
  );

  server.registerTool(
    "get_library_guidance",
    {
      title: "Get library guidance",
      description: "Return use, avoid, compatibility, legal and official-source guidance for one ecosystem.",
      inputSchema: z.object({
        library_id: z.string().trim().min(1).max(80),
      }),
      annotations: READ_ONLY_ANNOTATIONS,
    },
    ({ library_id }) => guarded(() => getLibraryGuidance({ libraryId: library_id }, data)),
  );

  server.registerTool(
    "search_components",
    {
      title: "Search official component metadata",
      description: "Search a selected library's public official registry when available, with a verified metadata-only fallback.",
      inputSchema: z.object({
        library_id: z.string().trim().min(1).max(80),
        query: z.string().trim().max(100).default(""),
        limit: z.number().int().min(1).max(20).default(10),
        live: z.boolean().default(true),
      }),
      annotations: { ...READ_ONLY_ANNOTATIONS, openWorldHint: true },
    },
    ({ library_id, query, limit, live }) => guardedAsync(() => searchComponents(
      { libraryId: library_id, query, limit, live },
      data,
      options.fetchImpl ? { fetchImpl: options.fetchImpl } : {},
    )),
  );

  server.registerTool(
    "get_install_instructions",
    {
      title: "Get install instructions",
      description: "Return an official install command as inert text. This tool never executes shell or package-manager commands.",
      inputSchema: z.object({
        library_id: z.string().trim().min(1).max(80),
        component: z.string().trim().min(1).max(120).optional(),
      }),
      annotations: READ_ONLY_ANNOTATIONS,
    },
    ({ library_id, component }) => guarded(() => getInstallInstructions({ libraryId: library_id, component }, data)),
  );

  server.registerTool(
    "audit_plan",
    {
      title: "Audit an OrchestrUI plan",
      description: "Score a proposed library plan against the nine OrchestrUI quality and licensing categories.",
      inputSchema: z.object({
        selected_libraries: z.array(z.string().trim().min(1).max(80)).max(7).default([]),
        existing_stack: z.array(z.string().trim().min(1).max(80)).max(20).default([]),
        rive_asset_rights: z.enum(["confirmed", "unconfirmed", "not-applicable"]).default("not-applicable"),
        includes_paid_content: z.boolean().default(false),
        redistributes_react_bits: z.boolean().default(false),
        verifications: z.array(z.object({
          category: z.enum([
            "visual coherence",
            "library discipline",
            "accessibility",
            "responsiveness",
            "motion/reduced-motion",
            "data-viz readability",
            "Rive lifecycle/asset rights",
            "engineering checks/dependencies/secrets",
            "licensing/Pro/React Bits",
          ]),
          status: z.enum(["pass", "fail"]),
          evidence: z.string().trim().min(1).max(500),
        })).max(9).default([]),
      }),
      annotations: READ_ONLY_ANNOTATIONS,
    },
    ({ selected_libraries, existing_stack, rive_asset_rights, includes_paid_content, redistributes_react_bits, verifications }) => guarded(() => auditPlan({
      selectedLibraries: selected_libraries,
      existingStack: existing_stack,
      riveAssetRights: rive_asset_rights,
      includesPaidContent: includes_paid_content,
      redistributesReactBits: redistributes_react_bits,
      verifications,
    }, data)),
  );

  return server;
}

function isMainModule(): boolean {
  const entry = process.argv[1];
  return Boolean(entry) && fileURLToPath(import.meta.url) === resolve(entry as string);
}

if (isMainModule()) {
  serveStdio(() => createOrchestrUiServer(), {
    onerror: (error) => console.error(`[orchestrui-mcp] ${error.message}`),
    maxSubscriptions: 16,
  });
}
