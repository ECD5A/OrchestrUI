import { valid, validRange, satisfies, subset, intersects } from "semver";

export type Compatibility = "compatible" | "incompatible" | "unknown";

// Exact versions are checked directly. A declared range is evidence only when
// every version it permits is compatible; partial overlap remains unknown.
export function semverCompatibility(value: string | undefined, range: string): Compatibility {
  if (!value || !validRange(range)) return "unknown";
  const exact = valid(value);
  if (exact) return satisfies(exact, range) ? "compatible" : "incompatible";
  const declared = validRange(value);
  if (!declared) return "unknown";
  if (subset(declared, range)) return "compatible";
  return intersects(declared, range) ? "unknown" : "incompatible";
}
