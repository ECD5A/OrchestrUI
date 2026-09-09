/* Copyright (c) 2026 ECD5A; SPDX-License-Identifier: MIT */
import fs from "node:fs";
import path from "node:path";
import { valid, validRange } from "semver";
import { semverCompatibility } from "./compatibility.js";
import type { HostProfile, PackageManager } from "./types.js";

const within = (root: string, target: string) => {
  const relative = path.relative(root, target);
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative));
};

// Only fixed JSON metadata is read. No script, config module, network request,
// source traversal or package installation is executed by inspection.
export function inspectProject(relativePath = ".", root = process.cwd()) {
  const workspace = fs.realpathSync(root);
  const requested = path.resolve(workspace, relativePath);
  if (!within(workspace, requested)) throw new Error("Project path must stay within the MCP workspace.");
  const project = fs.realpathSync(requested);
  if (!within(workspace, project)) throw new Error("Project symlink leaves the MCP workspace.");
  const diagnostics: string[] = [];
  const evidence: Array<{ field: string; source: string; kind: string }> = [];
  const read = (name: string, required = false): Record<string, any> | undefined => {
    const file = path.join(project, name);
    if (!fs.existsSync(file)) {
      if (required) throw new Error(`Missing ${name}`);
      return undefined;
    }
    if (!within(project, fs.realpathSync(file))) throw new Error(`${name} leaves the project directory.`);
    const fd = fs.openSync(file, "r");
    try {
      const stat = fs.fstatSync(fd);
      if (!stat.isFile() || stat.size > 2 * 1024 * 1024) throw new Error(`${name} must be a JSON file under 2 MiB.`);
      const buffer = Buffer.alloc(stat.size + 1);
      const count = fs.readSync(fd, buffer, 0, buffer.length, 0);
      if (count > stat.size) throw new Error(`${name} changed during inspection.`);
      const value: unknown = JSON.parse(buffer.subarray(0, count).toString("utf8"));
      if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Expected an object");
      return value as Record<string, any>;
    } catch {
      throw new Error(`Cannot inspect ${name}: invalid, oversized or changing JSON metadata.`);
    } finally { fs.closeSync(fd); }
  };
  const manifest = read("package.json", true)!;
  const lock = read("package-lock.json");
  const components = read("components.json");
  const entries = Object.entries({ ...manifest.devDependencies, ...manifest.dependencies })
    .filter(([name, value]) => /^[a-z0-9@/_.-]{1,120}$/i.test(name) && typeof value === "string" && value.length <= 40
      && (validRange(value) !== null || /^(?:workspace:[*~^]|latest|next|beta|canary)$/.test(value)));
  diagnostics.push("Non-semver dependency URLs, local paths and custom specifications are omitted from the returned profile.");
  if (entries.length > 100) diagnostics.push("Only the first 100 declared dependencies are included; inspect remaining dependencies manually.");
  const dependencies = Object.fromEntries(entries.slice(0, 100)) as Record<string, string>;
  const version = (name: string) => {
    const declared = dependencies[name];
    if (!declared) return undefined;
    const locked = lock?.packages?.[`node_modules/${name}`]?.version;
    if (typeof locked === "string" && locked.length <= 40 && valid(locked) && semverCompatibility(locked, declared) === "compatible") {
      evidence.push({ field: name, source: "package-lock.json", kind: "locked-version-not-installed-proof" });
      return locked;
    }
    if (locked) diagnostics.push(`Lockfile version for ${name} does not verify the manifest declaration.`);
    evidence.push({ field: name, source: "package.json", kind: "declared-range" });
    return declared;
  };
  const frameworkEntry = [["next", "Next.js"], ["react", "React"], ["vue", "Vue"], ["svelte", "Svelte"]]
    .find(([name]) => dependencies[name!]);
  const frameworks = ["next", "vue", "svelte"].filter((name) => dependencies[name]);
  if (frameworks.length > 1) diagnostics.push("Multiple framework signals found; confirm the intended application workspace.");
  const baseSystems = [components ? "shadcn/ui" : undefined, dependencies.daisyui ? "daisyUI" : undefined,
    dependencies["@mui/material"] ? "MUI" : undefined, dependencies["@chakra-ui/react"] ? "Chakra UI" : undefined,
    dependencies["@mantine/core"] ? "Mantine" : undefined].filter((value): value is string => Boolean(value));
  if (baseSystems.length > 1) diagnostics.push(`Multiple base systems found: ${baseSystems.join(", ")}. Confirm ownership before routing.`);
  const manager = typeof manifest.packageManager === "string" ? manifest.packageManager.split("@")[0] : lock ? "npm" : undefined;
  const frameworkVersion = frameworkEntry ? version(frameworkEntry[0]!) : undefined;
  const reactVersion = version("react");
  const tailwindVersion = version("tailwindcss");
  const hostProfile: HostProfile = {
    framework: frameworkEntry?.[1] ?? "unspecified",
    ...(frameworkVersion ? { framework_version: frameworkVersion } : {}),
    ...(reactVersion ? { react_version: reactVersion } : {}),
    ...(tailwindVersion ? { tailwind_version: tailwindVersion } : {}),
    ...(manager ? { package_manager: (["npm", "pnpm", "yarn", "bun"].includes(manager) ? manager : "other") as PackageManager } : {}),
    dependencies,
    ...(baseSystems.length === 1 ? { design_system: baseSystems[0]! } : {}),
    component_primitives: Object.keys(dependencies).filter((name) => name.startsWith("@radix-ui/") || name === "radix-ui"),
    motion_stack: ["animejs", "motion", "framer-motion", "gsap"].filter((name) => dependencies[name]),
    chart_stack: ["recharts", "chart.js", "echarts", "d3", "@nivo/core", "@visx/shape"].filter((name) => dependencies[name]),
    tokens: components?.tailwind?.cssVariables === true ? ["CSS variables declared in components.json"] : [],
    accessibility_constraints: [],
  };
  diagnostics.push("Asset rights, rendered behavior, accessibility and installed dependency state require separate verification.");
  if (!frameworkEntry) diagnostics.push("No supported framework declaration found.");
  return { host_profile: hostProfile, ready_for_routing: baseSystems.length <= 1 && frameworks.length <= 1 && Boolean(frameworkEntry), evidence, diagnostics };
}
