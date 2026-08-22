/*
 * OrchestrUI — structured deterministic UI routing.
 * Copyright (c) 2026 ECD5A
 * Licensed under the MIT License.
 * https://github.com/ECD5A/OrchestrUI
 * SPDX-License-Identifier: MIT
 */

import { getLibrary } from "./catalog.js";
import type {
  AssetRights,
  HostProfile,
  OrchestrUiData,
  TaskProfile,
  UiCapability,
} from "./types.js";

const ALL_LIBRARY_IDS = [
  "kokonut-ui",
  "react-bits",
  "daisyui",
  "bklit-ui",
  "animejs",
  "rive",
  "magic-ui",
] as const;

type LoosePartial<T> = { [Key in keyof T]?: T[Key] | undefined };

type RecommendStackInput = {
  task?: string;
  existingStack?: string[];
  constraints?: string[];
  riveAssetRights?: AssetRights;
  hostProfile?: LoosePartial<HostProfile>;
  taskProfile?: LoosePartial<TaskProfile>;
};

type SelectedLibrary = {
  id: string;
  role: string;
  roles: string[];
  capability: UiCapability;
  capabilities: UiCapability[];
  reason: string;
  retrieval_method: string;
  already_present: boolean;
  evidence: string[];
};

type RejectedLibrary = {
  id: string;
  reason: string;
  rule_id: string;
  conflicting_owner?: string;
};

type RankingFactor = {
  id: string;
  score: number;
  evidence: string;
};

type CandidateRanking = {
  capability: UiCapability;
  role: string;
  candidate: string;
  score: number;
  rank: number;
  eligible: boolean;
  outcome: "pending" | "selected" | "lower-ranked" | "ineligible";
  factors: RankingFactor[];
  blocked_by?: string;
};

function normalizedText(parts: string[]): string {
  return parts.join(" ").toLowerCase().replace(/[^a-z0-9а-яё+.#/-]+/giu, " ");
}

function containsAny(haystack: string, needles: string[]): boolean {
  return needles.some((needle) => haystack.includes(needle));
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

function inferLegacyCapabilities(task: string, constraints: string[]): UiCapability[] {
  const context = normalizedText([task, ...constraints]);
  const capabilities: UiCapability[] = [];
  const add = (capability: UiCapability) => capabilities.push(capability);

  if (containsAny(context, ["chart", "dashboard", "analytics", "data viz", "data-viz", "график", "дашборд", "аналит"])) {
    add("data-visualization");
  }
  if (containsAny(context, ["landing", "marketing", "hero", "лендинг", "маркетинг", "промо"])) {
    add("marketing-motion");
  }
  if (containsAny(context, ["signature", "creative", "portfolio", "text effect", "background effect", "креатив", "портфолио", "эффект"])) {
    add("signature-creative-effect");
  }
  if (containsAny(context, ["timeline", "svg animation", "scroll choreography", "bespoke animation", "таймлайн", "svg анимац", "скролл анимац"])) {
    add("bespoke-motion");
  }
  if (containsAny(context, ["rive", ".riv", "state machine", "interactive mascot", "интерактивн", "маскот"])) {
    add("interactive-vector");
  }
  if (containsAny(context, ["admin", "settings", "form", "crud", "админ", "настрой", "форм"])) {
    add("forms-controls");
  }
  if (containsAny(context, ["product ui", "app ui", "micro interaction", "polish", "saas", "приложен", "микроинтерак"])) {
    add("product-polish");
  }

  return unique(capabilities);
}

function inferredFramework(existingStack: string[]): string {
  const stack = normalizedText(existingStack);
  if (stack.includes("next")) return "Next.js";
  if (stack.includes("react")) return "React";
  if (stack.includes("vue")) return "Vue";
  if (stack.includes("svelte")) return "Svelte";
  return "unspecified";
}

function matchingEntries(values: string[], patterns: string[]): string[] {
  return values.filter((value) => containsAny(value.toLowerCase(), patterns));
}

function normalizeHostProfile(input: RecommendStackInput): HostProfile {
  const existing = input.existingStack ?? [];
  const supplied = input.hostProfile;
  const designSystem = supplied?.design_system
    ?? existing.find((value) => containsAny(value.toLowerCase(), ["shadcn", "radix", "daisyui", "daisy ui", "chakra", "mui", "mantine"]));
  const motionStack = supplied?.motion_stack
    ?? matchingEntries(existing, ["anime", "framer", "motion", "gsap"]);
  const chartStack = supplied?.chart_stack
    ?? matchingEntries(existing, ["bklit", "recharts", "chart.js", "echarts", "d3", "nivo", "visx"]);

  return {
    framework: supplied?.framework?.trim() || inferredFramework(existing),
    ...(supplied?.framework_version ? { framework_version: supplied.framework_version } : {}),
    ...(supplied?.react_version ? { react_version: supplied.react_version } : {}),
    ...(supplied?.tailwind_version ? { tailwind_version: supplied.tailwind_version } : {}),
    ...(supplied?.package_manager ? { package_manager: supplied.package_manager } : {}),
    dependencies: Object.fromEntries(Object.entries(supplied?.dependencies ?? {}).slice(0, 100)),
    ...(designSystem ? { design_system: designSystem } : {}),
    component_primitives: unique(supplied?.component_primitives ?? []),
    motion_stack: unique(motionStack),
    chart_stack: unique(chartStack),
    tokens: unique(supplied?.tokens ?? []),
    accessibility_constraints: unique(supplied?.accessibility_constraints ?? []),
  };
}

function normalizeTaskProfile(input: RecommendStackInput, structured: boolean): TaskProfile {
  const supplied = input.taskProfile;
  const explicit = supplied?.required_capabilities ?? [];
  const derived: UiCapability[] = [];
  if (supplied?.data_visualization && supplied.data_visualization !== "none") derived.push("data-visualization");
  if (supplied?.motion_requirement === "bespoke") derived.push("bespoke-motion");
  if (supplied?.motion_requirement === "interactive-vector") derived.push("interactive-vector");

  const requiredCapabilities = structured
    ? unique([...explicit, ...derived])
    : inferLegacyCapabilities(input.task ?? "", input.constraints ?? []);

  return {
    surface: supplied?.surface ?? "application",
    required_capabilities: requiredCapabilities,
    interaction_complexity: supplied?.interaction_complexity ?? "medium",
    data_visualization: supplied?.data_visualization ?? (requiredCapabilities.includes("data-visualization") ? "basic" : "none"),
    motion_requirement: supplied?.motion_requirement ?? (requiredCapabilities.includes("bespoke-motion") ? "bespoke" : requiredCapabilities.includes("interactive-vector") ? "interactive-vector" : "native"),
    rive_asset_rights: supplied?.rive_asset_rights ?? input.riveAssetRights ?? "not-applicable",
    constraints: unique([...(supplied?.constraints ?? []), ...(input.constraints ?? [])]),
  };
}

function fieldValues(host: HostProfile, field: "design_system" | "motion_stack" | "chart_stack"): string[] {
  const value = host[field];
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
}

function knownOwner(value: string): string {
  const normalized = value.toLowerCase();
  const aliases: Array<[string, string[]]> = [
    ["kokonut-ui", ["kokonut"]],
    ["react-bits", ["react bits", "react-bits"]],
    ["daisyui", ["daisy"]],
    ["bklit-ui", ["bklit"]],
    ["animejs", ["anime"]],
    ["rive", ["rive"]],
    ["magic-ui", ["magic ui", "magic-ui"]],
  ];
  const match = aliases.find(([, patterns]) => containsAny(normalized, patterns));
  if (match) return match[0];
  const slug = normalized.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "existing-stack";
  return `host:${slug}`;
}

function selectionReason(libraryName: string, role: string, capability: UiCapability): string {
  return `${libraryName} is the policy owner for ${role} because the task explicitly requires ${capability}.`;
}

function supportsFramework(frameworks: string[], hostFramework: string): boolean {
  const host = hostFramework.toLowerCase();
  if (!host || host === "unspecified") return true;
  const declared = frameworks.join(" ").toLowerCase();
  if (declared.includes("framework-agnostic")) return true;
  if (host.includes("next")) return declared.includes("next") || declared.includes("react");
  if (host.includes("react")) return declared.includes("react");
  if (host.includes("vue")) return declared.includes("vue");
  if (host.includes("svelte")) return declared.includes("svelte");
  return declared.includes(host);
}

function parseVersion(value: string): [number, number, number] | undefined {
  const match = value.match(/(?:^|[^0-9])(\d+)(?:\.(\d+))?(?:\.(\d+))?/);
  if (!match) return undefined;
  return [Number(match[1]), Number(match[2] ?? 0), Number(match[3] ?? 0)];
}

function compareVersions(left: [number, number, number], right: [number, number, number]): number {
  for (let index = 0; index < 3; index += 1) {
    const difference = (left[index] ?? 0) - (right[index] ?? 0);
    if (difference) return difference;
  }
  return 0;
}

function satisfiesBoundedRange(value: string, range: string): boolean {
  const actual = parseVersion(value);
  const expected = parseVersion(range);
  if (!actual || !expected) return false;
  const comparison = compareVersions(actual, expected);
  const operator = range.match(/^(>=|<=|>|<|=)/)?.[1] ?? "=";
  if (operator === ">=") return comparison >= 0;
  if (operator === "<=") return comparison <= 0;
  if (operator === ">") return comparison > 0;
  if (operator === "<") return comparison < 0;
  return comparison === 0;
}

function candidatePresenceEvidence(host: HostProfile, candidate: string, packageNames: string[]): string[] {
  const evidence: string[] = [];
  const hostSignals = [
    ...(host.design_system ? [host.design_system] : []),
    ...host.component_primitives,
    ...host.motion_stack,
    ...host.chart_stack,
  ];
  if (hostSignals.some((value) => knownOwner(value) === candidate)) {
    evidence.push(`HostProfile already identifies ${candidate} in its UI stacks or primitives.`);
  }
  const dependencyNames = new Set(Object.keys(host.dependencies).map((name) => name.toLowerCase()));
  const matchedPackage = packageNames.find((name) => dependencyNames.has(name.toLowerCase()));
  if (matchedPackage) {
    evidence.push(`HostProfile.dependencies includes ${matchedPackage}@${host.dependencies[matchedPackage] ?? "declared"}.`);
  }
  return evidence;
}

function versionFailure(
  host: HostProfile,
  constraints: Array<{ host_field: "framework_version" | "react_version" | "tailwind_version"; range: string; reason: string }> = [],
) {
  for (const constraint of constraints) {
    const supplied = host[constraint.host_field];
    if (supplied && !satisfiesBoundedRange(supplied, constraint.range)) {
      return {
        reason: constraint.reason,
        evidence: `HostProfile.${constraint.host_field} is ${supplied}; required range is ${constraint.range}.`,
      };
    }
  }
  return undefined;
}

function rankCandidates(
  capability: UiCapability,
  role: string,
  candidates: string[],
  host: HostProfile,
  task: TaskProfile,
  data: OrchestrUiData,
  selected: Map<string, SelectedLibrary>,
): CandidateRanking[] {
  const lowBundle = task.constraints.some((constraint) => /low bundle|bundle budget|minimal bundle/i.test(constraint));
  const selectedGroups = new Set([...selected.keys()].flatMap((id) => data.routing.candidate_profiles[id]?.overlap_groups ?? []));
  const rankings = candidates.map((candidate, index) => {
    const profile = data.routing.candidate_profiles[candidate];
    if (!profile) throw new Error(`Missing candidate ranking profile for ${candidate}`);
    const presence = candidatePresenceEvidence(host, candidate, profile.package_names);
    const overlaps = profile.overlap_groups.filter((group) => selectedGroups.has(group)).length;
    const factors: RankingFactor[] = [
      { id: "policy-order", score: 1000 - (index * 100), evidence: `${candidate} is policy candidate ${index + 1} for ${capability}.` },
      { id: "installed-evidence", score: presence.length ? 180 : 0, evidence: presence[0] ?? "No installed candidate evidence was supplied." },
      { id: "current-plan-reuse", score: selected.has(candidate) ? 40 : 0, evidence: selected.has(candidate) ? `${candidate} is already in the current recommendation.` : `${candidate} is not yet in the current recommendation.` },
      { id: "dependency-cost", score: -10 * profile.dependency_cost, evidence: `Declared dependency cost is ${profile.dependency_cost}/5.` },
      { id: "bundle-cost", score: -(lowBundle ? 20 : 5) * profile.bundle_cost, evidence: `Declared bundle cost is ${profile.bundle_cost}/5${lowBundle ? " under a low-bundle constraint" : ""}.` },
      { id: "role-overlap", score: -25 * overlaps, evidence: overlaps ? `${overlaps} overlap group(s) are already represented.` : "No selected overlap group is duplicated." },
    ];
    for (const constraint of profile.version_constraints ?? []) {
      const supplied = host[constraint.host_field];
      factors.push({
        id: "semver-compatibility",
        score: 0,
        evidence: supplied
          ? `HostProfile.${constraint.host_field} ${supplied} is checked against ${constraint.range}.`
          : `HostProfile.${constraint.host_field} was not supplied; ${constraint.range} remains an implementation check.`,
      });
    }
    return {
      capability,
      role,
      candidate,
      score: factors.reduce((sum, factor) => sum + factor.score, 0),
      rank: 0,
      eligible: true,
      outcome: "pending" as const,
      factors,
    };
  });
  rankings.sort((left, right) => right.score - left.score || candidates.indexOf(left.candidate) - candidates.indexOf(right.candidate));
  rankings.forEach((ranking, index) => { ranking.rank = index + 1; });
  return rankings;
}

export function recommendStack(input: RecommendStackInput, data: OrchestrUiData) {
  const inputMode = input.hostProfile && input.taskProfile
    ? "structured-profiles"
    : input.hostProfile || input.taskProfile
      ? "hybrid-profile-inference"
      : "legacy-text-inference";
  const host = normalizeHostProfile(input);
  const task = normalizeTaskProfile(input, Boolean(input.taskProfile));
  const selected = new Map<string, SelectedLibrary>();
  const rejected = new Map<string, RejectedLibrary>();
  const ownership = new Map<string, { role: string; owner: string; source: "host-profile" | "selected-library"; evidence: string }>();
  const decisions: Array<{ outcome: "selected" | "rejected" | "preserved"; subject: string; rule_id: string; evidence: string[] }> = [];
  const candidateRankings: CandidateRanking[] = [];
  const risks: string[] = [];

  for (const [role, policy] of Object.entries(data.routing.roles)) {
    if (!policy.host_profile_field) continue;
    const values = fieldValues(host, policy.host_profile_field);
    if (!values.length) continue;
    const owner = knownOwner(values[0] as string);
    ownership.set(role, {
      role,
      owner,
      source: "host-profile",
      evidence: `HostProfile.${policy.host_profile_field} declares ${values.join(", ")}.`,
    });
    decisions.push({
      outcome: "preserved",
      subject: owner,
      rule_id: "existing-stack-first",
      evidence: [`${role} is already owned by ${values.join(", ")}.`],
    });
  }

  const orderedCapabilities = [...task.required_capabilities].sort((left, right) => (
    data.routing.capability_routes[left].priority - data.routing.capability_routes[right].priority
  ));

  for (const capability of orderedCapabilities) {
    const route = data.routing.capability_routes[capability];
    const rolePolicy = data.routing.roles[route.role];
    if (!rolePolicy) throw new Error(`Routing capability ${capability} references unknown role ${route.role}`);

    const routeRankings = rankCandidates(capability, route.role, route.candidates, host, task, data, selected);
    candidateRankings.push(...routeRankings);

    for (const ranking of routeRankings) {
      const candidate = ranking.candidate;
      const library = getLibrary(data, candidate);
      if (!supportsFramework(library.compatibility.frameworks, host.framework)) {
        ranking.eligible = false;
        ranking.outcome = "ineligible";
        ranking.blocked_by = "framework-compatibility";
        const reason = `${library.name} does not declare compatibility with ${host.framework}.`;
        rejected.set(candidate, {
          id: candidate,
          reason,
          rule_id: "framework-compatibility",
        });
        decisions.push({
          outcome: "rejected",
          subject: candidate,
          rule_id: "framework-compatibility",
          evidence: [
            `HostProfile.framework is ${host.framework}.`,
            `${library.name} declares: ${library.compatibility.frameworks.join(", ")}.`,
          ],
        });
        continue;
      }
      const semverFailure = versionFailure(host, data.routing.candidate_profiles[candidate]?.version_constraints);
      if (semverFailure) {
        ranking.eligible = false;
        ranking.outcome = "ineligible";
        ranking.blocked_by = "version-compatibility";
        rejected.set(candidate, {
          id: candidate,
          reason: semverFailure.reason,
          rule_id: "version-compatibility",
        });
        decisions.push({
          outcome: "rejected",
          subject: candidate,
          rule_id: "version-compatibility",
          evidence: [semverFailure.evidence],
        });
        continue;
      }
      const requirementFailure = route.requirements?.find((requirement) => task[requirement.field] !== requirement.equals);
      if (requirementFailure) {
        ranking.eligible = false;
        ranking.outcome = "ineligible";
        ranking.blocked_by = "rive-purpose";
        rejected.set(candidate, {
          id: candidate,
          reason: requirementFailure.reason,
          rule_id: "rive-purpose",
        });
        decisions.push({
          outcome: "rejected",
          subject: candidate,
          rule_id: "rive-purpose",
          evidence: [`TaskProfile.${requirementFailure.field} is ${task[requirementFailure.field]}, expected ${requirementFailure.equals}.`],
        });
        risks.push(requirementFailure.reason);
        continue;
      }

      const hostConflict = data.routing.host_conflicts.find((conflict) => conflict.candidate === candidate
        && fieldValues(host, conflict.field).some((value) => containsAny(value.toLowerCase(), conflict.patterns)));
      if (hostConflict) {
        ranking.eligible = false;
        ranking.outcome = "ineligible";
        ranking.blocked_by = hostConflict.rule_id;
        const existingOwner = ownership.get(route.role)?.owner;
        rejected.set(candidate, {
          id: candidate,
          reason: hostConflict.reason,
          rule_id: hostConflict.rule_id,
          ...(existingOwner ? { conflicting_owner: existingOwner } : {}),
        });
        decisions.push({
          outcome: "rejected",
          subject: candidate,
          rule_id: hostConflict.rule_id,
          evidence: [hostConflict.reason],
        });
        continue;
      }

      const selectedConflict = data.routing.selected_conflicts.find((conflict) => conflict.libraries.includes(candidate)
        && conflict.libraries.some((id) => id !== candidate && selected.has(id)));
      if (selectedConflict) {
        ranking.eligible = false;
        ranking.outcome = "ineligible";
        ranking.blocked_by = selectedConflict.rule_id;
        const conflictingOwner = selectedConflict.libraries.find((id) => id !== candidate && selected.has(id)) as string;
        rejected.set(candidate, {
          id: candidate,
          reason: selectedConflict.reason,
          rule_id: selectedConflict.rule_id,
          conflicting_owner: conflictingOwner,
        });
        decisions.push({
          outcome: "rejected",
          subject: candidate,
          rule_id: selectedConflict.rule_id,
          evidence: [selectedConflict.reason, `${conflictingOwner} was selected by a higher-priority capability route.`],
        });
        continue;
      }

      const currentOwner = ownership.get(route.role);
      if (rolePolicy.exclusive && currentOwner && currentOwner.owner !== candidate) {
        ranking.eligible = false;
        ranking.outcome = "ineligible";
        ranking.blocked_by = "base-system-conflict";
        const reason = `${route.role} is already owned by ${currentOwner.owner}; a second owner is rejected.`;
        rejected.set(candidate, {
          id: candidate,
          reason,
          rule_id: "base-system-conflict",
          conflicting_owner: currentOwner.owner,
        });
        decisions.push({
          outcome: "rejected",
          subject: candidate,
          rule_id: "base-system-conflict",
          evidence: [currentOwner.evidence, reason],
        });
        continue;
      }

      const presenceEvidence = candidatePresenceEvidence(
        host,
        candidate,
        data.routing.candidate_profiles[candidate]?.package_names ?? [],
      );
      const alreadyPresent = currentOwner?.owner === candidate || presenceEvidence.length > 0;
      const existingSelection = selected.get(candidate);
      const selectionEvidence = [
        `TaskProfile.required_capabilities includes ${capability}.`,
        alreadyPresent
          ? (currentOwner?.evidence ?? presenceEvidence[0] as string)
          : `Policy route ${capability} -> ${route.role} ranked ${candidate} first among admissible candidates.`,
        `Candidate score ${ranking.score}; rank ${ranking.rank}/${routeRankings.length}.`,
      ];
      selected.set(candidate, existingSelection ? {
        ...existingSelection,
        roles: unique([...existingSelection.roles, route.role]),
        capabilities: unique([...existingSelection.capabilities, capability]),
        already_present: existingSelection.already_present || alreadyPresent,
        evidence: unique([...existingSelection.evidence, ...selectionEvidence]),
      } : {
        id: candidate,
        role: route.role,
        roles: [route.role],
        capability,
        capabilities: [capability],
        reason: alreadyPresent
          ? `${library.name} is already present and can own ${route.role}; preserve it.`
          : selectionReason(library.name, route.role, capability),
        retrieval_method: library.integration.type,
        already_present: alreadyPresent,
        evidence: selectionEvidence,
      });
      rejected.delete(candidate);
      ownership.set(route.role, {
        role: route.role,
        owner: candidate,
        source: alreadyPresent ? "host-profile" : "selected-library",
        evidence: alreadyPresent
          ? (currentOwner?.evidence ?? presenceEvidence[0] as string)
          : `${candidate} selected for ${capability}.`,
      });
      decisions.push({
        outcome: alreadyPresent ? "preserved" : "selected",
        subject: candidate,
        rule_id: alreadyPresent ? "existing-stack-first" : "candidate-ranking",
        evidence: selected.get(candidate)?.evidence ?? [],
      });
      ranking.outcome = "selected";
      for (const other of routeRankings) {
        if (other.outcome === "pending") other.outcome = "lower-ranked";
      }
      break;
    }
  }

  if (selected.has("react-bits")) {
    risks.push("React Bits source must be retrieved from official upstream and never redistributed by OrchestrUI.");
  }
  if (inputMode !== "structured-profiles") {
    risks.push("Profile inference was used. Supply both HostProfile and TaskProfile for fully evidence-based routing.");
  }
  if (!selected.size) {
    risks.push("No new OrchestrUI library is justified; preserve the existing host stack.");
  }

  for (const ranking of candidateRankings) {
    if (ranking.outcome !== "lower-ranked" || selected.has(ranking.candidate) || rejected.has(ranking.candidate)) continue;
    rejected.set(ranking.candidate, {
      id: ranking.candidate,
      reason: `A higher-ranked admissible candidate owns ${ranking.role}.`,
      rule_id: "candidate-ranking",
    });
  }

  for (const id of ALL_LIBRARY_IDS) {
    if (selected.has(id) || rejected.has(id)) continue;
    rejected.set(id, {
      id,
      reason: "No explicit task capability routes to this library.",
      rule_id: "minimum-set",
    });
  }

  const additions = [...selected.values()].filter((entry) => !entry.already_present).length;
  return {
    input_mode: inputMode,
    summary: additions
      ? `Add ${additions} ecosystem${additions === 1 ? "" : "s"}; preserve every compatible host owner.`
      : "Preserve the existing host system without adding an OrchestrUI ecosystem.",
    profiles: { host, task },
    selected: [...selected.values()],
    rejected: [...rejected.values()],
    role_ownership: [...ownership.values()],
    decisions,
    candidate_rankings: candidateRankings,
    risks: unique(risks),
    validation_plan: [
      "Verify selected component IDs and installation guidance against cited official sources.",
      "Map typography, spacing, radius, colors, surfaces, shadows, icons and motion to host tokens.",
      "Test keyboard/focus behavior, responsive layouts and prefers-reduced-motion behavior.",
      "Run the host project's lint, typecheck, tests and production build.",
      "Run ui-quality-audit and resolve every fail; pending checks do not raise the verified score.",
    ],
    provenance: [
      { source: "catalog/libraries.json", verified_at: data.catalog.verified_at, mode: "catalog" as const },
      { source: "catalog/routing-rules.json", verified_at: data.catalog.verified_at, mode: "catalog" as const },
    ],
  };
}
