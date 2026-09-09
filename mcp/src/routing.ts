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
  rank: number | null;
  eligible: boolean;
  outcome: "pending" | "selected" | "lower-ranked" | "ineligible";
  factors: RankingFactor[];
  blocked_by?: string;
};

type CapabilityCoverage = {
  capability: UiCapability;
  role: string;
  status: "selected" | "preserved" | "unmet";
  owner?: string;
  evidence: string[];
};

type ProfileDiagnostic = {
  id: string;
  severity: "error" | "warning" | "info";
  message: string;
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

function profileDiagnostics(inputMode: string, host: HostProfile, task: TaskProfile, data: OrchestrUiData): ProfileDiagnostic[] {
  const diagnostics: ProfileDiagnostic[] = [];
  if (host.framework === "unspecified") {
    diagnostics.push({ id: "missing-framework", severity: "warning", message: "HostProfile.framework is unspecified; framework compatibility cannot be narrowed." });
  }
  if (inputMode !== "structured-profiles") {
    diagnostics.push({ id: "inferred-profile", severity: "warning", message: "Routing inferred part of the profile; provide both HostProfile and TaskProfile for stronger evidence." });
  }
  if (!task.required_capabilities.length) {
    diagnostics.push({ id: "missing-capabilities", severity: "info", message: "No explicit task capability was supplied; the recommendation will preserve the host stack." });
  }
  const constrainedFields = new Set(task.required_capabilities.flatMap((capability) => (
    data.routing.capability_routes[capability]?.candidates ?? []
  )).flatMap((candidate) => data.routing.candidate_profiles[candidate]?.version_constraints ?? []).map((constraint) => constraint.host_field));
  for (const field of constrainedFields) {
    if (!host[field]) diagnostics.push({ id: `missing-${field}`, severity: "info", message: `HostProfile.${field} was not supplied; related semver compatibility remains unknown.` });
  }
  return diagnostics;
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

type Semver = [number, number, number];

function parseVersion(value: string): Semver | undefined {
  const match = value.trim().match(/^v?(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/);
  if (!match) return undefined;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function compareVersions(left: Semver, right: Semver): number {
  for (let index = 0; index < 3; index += 1) {
    const difference = (left[index] ?? 0) - (right[index] ?? 0);
    if (difference) return difference;
  }
  return 0;
}

function nextMajor(version: Semver): Semver {
  return [version[0] + 1, 0, 0];
}

function nextMinor(version: Semver): Semver {
  return [version[0], version[1] + 1, 0];
}

function comparatorMatches(actual: Semver, operator: string, expected: Semver): boolean {
  const comparison = compareVersions(actual, expected);
  if (operator === ">=") return comparison >= 0;
  if (operator === "<=") return comparison <= 0;
  if (operator === ">") return comparison > 0;
  if (operator === "<") return comparison < 0;
  return comparison === 0;
}

function semverClauseMatches(actual: Semver, clause: string): boolean | undefined {
  const tokens = clause.replaceAll(",", " ").trim().split(/\s+/).filter(Boolean);
  if (!tokens.length) return undefined;
  for (const token of tokens) {
    const caret = token.match(/^\^(\d+)\.(\d+)\.(\d+)$/);
    if (caret) {
      const lower: Semver = [Number(caret[1]), Number(caret[2]), Number(caret[3])];
      const upper: Semver = lower[0] > 0
        ? nextMajor(lower)
        : lower[1] > 0
          ? [0, lower[1] + 1, 0]
          : [0, 0, lower[2] + 1];
      if (!comparatorMatches(actual, ">=", lower) || !comparatorMatches(actual, "<", upper)) return false;
      continue;
    }
    const tilde = token.match(/^~(\d+)\.(\d+)\.(\d+)$/);
    if (tilde) {
      const lower: Semver = [Number(tilde[1]), Number(tilde[2]), Number(tilde[3])];
      if (!comparatorMatches(actual, ">=", lower) || !comparatorMatches(actual, "<", nextMinor(lower))) return false;
      continue;
    }
    const comparator = token.match(/^(>=|<=|>|<|=)?(\d+)\.(\d+)\.(\d+)$/);
    if (!comparator) return undefined;
    if (!comparatorMatches(actual, comparator[1] ?? "=", [Number(comparator[2]), Number(comparator[3]), Number(comparator[4])])) return false;
  }
  return true;
}

function semverCompatibility(value: string | undefined, range: string): "compatible" | "incompatible" | "unknown" {
  if (!value) return "unknown";
  const actual = parseVersion(value);
  if (!actual) return "unknown";
  const clauses = range.split("||").map((clause) => semverClauseMatches(actual, clause));
  if (clauses.some((result) => result === true)) return "compatible";
  if (clauses.some((result) => result === undefined)) return "unknown";
  return "incompatible";
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
    const compatibility = semverCompatibility(supplied, constraint.range);
    if (compatibility === "incompatible") {
      return {
        reason: constraint.reason,
        evidence: `HostProfile.${constraint.host_field} is ${supplied}; required range is ${constraint.range}.`,
      };
    }
    if (supplied && compatibility === "unknown") {
      return {
        reason: `HostProfile.${constraint.host_field} could not be verified against ${constraint.range}.`,
        evidence: `HostProfile.${constraint.host_field} is ${supplied}; the declared range ${constraint.range} is not safely evaluable.`,
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
  const taskCoverage = (candidate: string) => task.required_capabilities
    .filter((required) => data.routing.capability_routes[required]?.candidates.includes(candidate)).length;
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
      { id: "task-coverage", score: 30 * Math.max(0, taskCoverage(candidate) - 1), evidence: taskCoverage(candidate) > 1
        ? `${candidate} is a candidate for ${taskCoverage(candidate)} required capabilities, reducing the task-wide library set.`
        : `${candidate} is a candidate for one required capability.` },
    ];
    for (const constraint of profile.version_constraints ?? []) {
      const supplied = host[constraint.host_field];
      const compatibility = semverCompatibility(supplied, constraint.range);
      factors.push({
        id: "semver-compatibility",
        score: compatibility === "compatible" ? 20 : 0,
        evidence: supplied
          ? `HostProfile.${constraint.host_field} ${supplied} is ${compatibility} for ${constraint.range}.`
          : `HostProfile.${constraint.host_field} was not supplied; ${constraint.range} remains an implementation check.`,
      });
    }
    return {
      capability,
      role,
      candidate,
      score: factors.reduce((sum, factor) => sum + factor.score, 0),
      rank: null,
      eligible: true,
      outcome: "pending" as const,
      factors,
    };
  });
  rankings.sort((left, right) => right.score - left.score || candidates.indexOf(left.candidate) - candidates.indexOf(right.candidate));
  return rankings;
}

type CandidateGate = {
  eligible: boolean;
  blocked_by?: string;
  reason?: string;
  evidence: string[];
  conflicting_owner?: string;
  risk?: string;
};

function assessCandidate(
  candidate: string,
  route: { role: string; requirements?: Array<{ field: "rive_asset_rights"; equals: AssetRights; reason: string }> },
  rolePolicy: { exclusive: boolean },
  host: HostProfile,
  task: TaskProfile,
  data: OrchestrUiData,
  selected: Map<string, SelectedLibrary>,
  ownership: Map<string, { role: string; owner: string; source: "host-profile" | "selected-library"; evidence: string }>,
): CandidateGate {
  const library = getLibrary(data, candidate);
  const currentOwner = ownership.get(route.role);
  if (!supportsFramework(library.compatibility.frameworks, host.framework)) {
    return {
      eligible: false,
      blocked_by: "framework-compatibility",
      reason: `${library.name} does not declare compatibility with ${host.framework}.`,
      evidence: [`HostProfile.framework is ${host.framework}.`, `${library.name} declares: ${library.compatibility.frameworks.join(", ")}.`],
    };
  }
  const semverFailure = versionFailure(host, data.routing.candidate_profiles[candidate]?.version_constraints);
  if (semverFailure) {
    return { eligible: false, blocked_by: "version-compatibility", reason: semverFailure.reason, evidence: [semverFailure.evidence] };
  }
  const requirementFailure = route.requirements?.find((requirement) => task[requirement.field] !== requirement.equals);
  if (requirementFailure) {
    return {
      eligible: false,
      blocked_by: "rive-purpose",
      reason: requirementFailure.reason,
      evidence: [`TaskProfile.${requirementFailure.field} is ${task[requirementFailure.field]}, expected ${requirementFailure.equals}.`],
      risk: requirementFailure.reason,
    };
  }
  const hostConflict = data.routing.host_conflicts.find((conflict) => conflict.candidate === candidate
    && fieldValues(host, conflict.field).some((value) => containsAny(value.toLowerCase(), conflict.patterns)));
  if (hostConflict) {
    return {
      eligible: false,
      blocked_by: hostConflict.rule_id,
      reason: hostConflict.reason,
      evidence: [hostConflict.reason],
      ...(currentOwner ? { conflicting_owner: currentOwner.owner } : {}),
    };
  }
  const selectedConflict = data.routing.selected_conflicts.find((conflict) => conflict.libraries.includes(candidate)
    && conflict.libraries.some((id) => id !== candidate && selected.has(id)));
  if (selectedConflict) {
    const conflictingOwner = selectedConflict.libraries.find((id) => id !== candidate && selected.has(id)) as string;
    return {
      eligible: false,
      blocked_by: selectedConflict.rule_id,
      reason: selectedConflict.reason,
      evidence: [selectedConflict.reason, `${conflictingOwner} was selected by a higher-priority capability route.`],
      conflicting_owner: conflictingOwner,
    };
  }
  if (rolePolicy.exclusive && currentOwner && currentOwner.owner !== candidate) {
    const reason = `${route.role} is already owned by ${currentOwner.owner}; a second owner is rejected.`;
    return {
      eligible: false,
      blocked_by: "base-system-conflict",
      reason,
      evidence: [currentOwner.evidence, reason],
      conflicting_owner: currentOwner.owner,
    };
  }
  return { eligible: true, evidence: [] };
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
  const capabilityCoverage: CapabilityCoverage[] = [];
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

    // Apply every hard compatibility and ownership gate before ranking. This keeps
    // the reported rank meaningful: only admissible candidates receive a rank.
    for (const ranking of routeRankings) {
      const gate = assessCandidate(ranking.candidate, route, rolePolicy, host, task, data, selected, ownership);
      if (gate.eligible) continue;
      ranking.eligible = false;
      ranking.outcome = "ineligible";
      ranking.rank = null;
      if (gate.blocked_by) ranking.blocked_by = gate.blocked_by;
      rejected.set(ranking.candidate, {
        id: ranking.candidate,
        reason: gate.reason ?? "Candidate failed a routing gate.",
        rule_id: gate.blocked_by ?? "candidate-gate",
        ...(gate.conflicting_owner ? { conflicting_owner: gate.conflicting_owner } : {}),
      });
      decisions.push({
        outcome: "rejected",
        subject: ranking.candidate,
        rule_id: gate.blocked_by ?? "candidate-gate",
        evidence: gate.evidence,
      });
      if (gate.risk) risks.push(gate.risk);
    }
    const eligibleRankings = routeRankings.filter((ranking) => ranking.eligible);
    eligibleRankings.forEach((ranking, index) => { ranking.rank = index + 1; });
    if (!eligibleRankings.length) {
      const owner = ownership.get(route.role);
      capabilityCoverage.push(owner
        ? { capability, role: route.role, status: "preserved", owner: owner.owner, evidence: [owner.evidence] }
        : {
          capability,
          role: route.role,
          status: "unmet",
          evidence: routeRankings.map((ranking) => `${ranking.candidate}: ${ranking.blocked_by ?? "ineligible"}`),
        });
      if (!owner) risks.push(`No eligible candidate satisfies the required capability ${capability}.`);
    }

    for (const ranking of routeRankings) {
      if (!ranking.eligible) continue;
      const candidate = ranking.candidate;
      const library = getLibrary(data, candidate);
      const currentOwner = ownership.get(route.role);
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
        `Candidate score ${ranking.score}; eligible rank ${ranking.rank}/${eligibleRankings.length}.`,
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
      capabilityCoverage.push({
        capability,
        role: route.role,
        status: alreadyPresent ? "preserved" : "selected",
        owner: candidate,
        evidence: selectionEvidence,
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
  const unmetRequirements = capabilityCoverage
    .filter((coverage) => coverage.status === "unmet")
    .map((coverage) => ({
      capability: coverage.capability,
      role: coverage.role,
      reason: `No eligible candidate passed the hard gates for ${coverage.capability}.`,
      evidence: coverage.evidence,
    }));
  const planMetrics = [...selected.keys()].reduce((metrics, id) => {
    const profile = data.routing.candidate_profiles[id];
    if (!profile) return metrics;
    metrics.dependency_cost += profile.dependency_cost;
    metrics.bundle_cost += profile.bundle_cost;
    for (const group of profile.overlap_groups) metrics.overlap_groups.add(group);
    return metrics;
  }, {
    dependency_cost: 0,
    bundle_cost: 0,
    overlap_groups: new Set<string>(),
  });
  return {
    input_mode: inputMode,
    summary: unmetRequirements.length
      ? `Resolve ${unmetRequirements.length} unmet task requirement${unmetRequirements.length === 1 ? "" : "s"} before implementation.`
      : additions
      ? `Add ${additions} ecosystem${additions === 1 ? "" : "s"}; preserve every compatible host owner.`
      : "Preserve the existing host system without adding an OrchestrUI ecosystem.",
    profiles: { host, task },
    profile_diagnostics: profileDiagnostics(inputMode, host, task, data),
    selected: [...selected.values()],
    rejected: [...rejected.values()],
    role_ownership: [...ownership.values()],
    decisions,
    candidate_rankings: candidateRankings,
    capability_coverage: capabilityCoverage,
    unmet_requirements: unmetRequirements,
    plan_metrics: {
      library_count: selected.size,
      additions,
      dependency_cost: planMetrics.dependency_cost,
      bundle_cost: planMetrics.bundle_cost,
      overlap_group_count: planMetrics.overlap_groups.size,
      reused_library_count: [...selected.values()].filter((entry) => entry.capabilities.length > 1).length,
    },
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
