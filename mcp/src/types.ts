export type Integration = {
  type: string;
  example: string;
  namespace?: string;
  registry_pattern?: string;
  agent_skill?: string;
  note?: string;
};

export type Library = {
  id: string;
  name: string;
  roles: string[];
  homepage: string;
  docs: string;
  repository: string;
  license_note: string;
  redistribution: string;
  integration: Integration;
  compatibility: {
    frameworks: string[];
    styling: string[];
    base_role: string;
    conflicts: string[];
  };
  source_provenance: {
    verified_at: string;
    docs: string;
    license: string;
    registry_index?: string;
  };
  use_when: string[];
  avoid_when: string[];
  mcp_docs?: string;
  mcp_repository?: string;
  skills_docs?: string;
};

export type LibraryCatalog = {
  schema_version: number;
  project: "OrchestrUI";
  verified_at: string;
  policy: Record<string, boolean>;
  libraries: Library[];
};

export type PackageManager = "npm" | "pnpm" | "yarn" | "bun" | "other";
export type UiSurface = "application" | "marketing" | "hybrid";
export type InteractionComplexity = "low" | "medium" | "high";
export type DataVisualizationNeed = "none" | "basic" | "advanced";
export type MotionRequirement = "none" | "native" | "bespoke" | "interactive-vector";
export type AssetRights = "confirmed" | "unconfirmed" | "not-applicable";

export type UiCapability =
  | "forms-controls"
  | "product-polish"
  | "data-visualization"
  | "marketing-motion"
  | "signature-creative-effect"
  | "bespoke-motion"
  | "interactive-vector";

export type HostProfile = {
  framework: string;
  framework_version?: string;
  react_version?: string;
  tailwind_version?: string;
  package_manager?: PackageManager;
  design_system?: string;
  component_primitives: string[];
  motion_stack: string[];
  chart_stack: string[];
  tokens: string[];
  accessibility_constraints: string[];
};

export type TaskProfile = {
  surface: UiSurface;
  required_capabilities: UiCapability[];
  interaction_complexity: InteractionComplexity;
  data_visualization: DataVisualizationNeed;
  motion_requirement: MotionRequirement;
  rive_asset_rights: AssetRights;
  constraints: string[];
};

export type RoutingRolePolicy = {
  description: string;
  exclusive: boolean;
  host_profile_field?: "design_system" | "motion_stack" | "chart_stack";
};

export type CapabilityRoute = {
  priority: number;
  role: string;
  candidates: string[];
  requirements?: Array<{
    field: "rive_asset_rights";
    equals: AssetRights;
    reason: string;
  }>;
};

export type RoutingPolicyCatalog = {
  schema_version: number;
  rules: Array<{ id: string; priority: number; text: string }>;
  roles: Record<string, RoutingRolePolicy>;
  capability_routes: Record<UiCapability, CapabilityRoute>;
  host_conflicts: Array<{
    rule_id: string;
    candidate: string;
    field: "design_system" | "motion_stack" | "chart_stack";
    patterns: string[];
    reason: string;
  }>;
  selected_conflicts: Array<{
    rule_id: string;
    libraries: [string, string];
    reason: string;
  }>;
};

export type ComponentItem = {
  name: string;
  title: string;
  description: string;
  type?: string;
};

export type ComponentLibrary = {
  source: string;
  registry_index?: string;
  items: ComponentItem[];
};

export type ComponentCatalog = {
  schema_version: number;
  verified_at: string;
  policy: {
    metadata_only: boolean;
    public_sources_only: boolean;
    max_live_response_bytes: number;
    live_timeout_ms: number;
  };
  libraries: Record<string, ComponentLibrary>;
};

export type OrchestrUiData = {
  catalog: LibraryCatalog;
  components: ComponentCatalog;
  routing: RoutingPolicyCatalog;
  version: string;
};

export type Provenance = {
  source: string;
  verified_at: string;
  mode: "catalog" | "live-registry" | "catalog-fallback";
};
