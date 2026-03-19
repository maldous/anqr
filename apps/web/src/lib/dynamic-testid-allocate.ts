import { getRegistry } from "./dynamic-testid-registry";

export function allocateUniqueId(base: string, sourceKey: string): string {
  const registry = getRegistry();
  const existing = registry.usedBySource.get(sourceKey);
  if (existing) return existing;

  if (!registry.countsByBase.has(base)) {
    registry.countsByBase.set(base, 1);
    registry.usedBySource.set(sourceKey, base);
    return base;
  }

  const next = (registry.countsByBase.get(base) || 1) + 1;
  registry.countsByBase.set(base, next);
  const unique = `${base}-${next}`;
  registry.usedBySource.set(sourceKey, unique);
  return unique;
}
