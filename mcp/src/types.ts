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
};

export type Provenance = {
  source: string;
  verified_at: string;
  mode: "catalog" | "live-registry" | "catalog-fallback";
};
