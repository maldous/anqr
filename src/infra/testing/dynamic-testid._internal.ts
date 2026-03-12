export type TestIdProps = {
  'data-testid'?: string;
  id?: string;
  name?: string;
  title?: string;
  placeholder?: string;
  'aria-label'?: string;
};

export type RegistryState = {
  usedBySource: Map<string, string>;
  countsByBase: Map<string, number>;
};

export const REGISTRY_KEY = '__ANQR_DYNAMIC_TESTID_REGISTRY__';

export function getRegistry(): RegistryState {
  const bag = globalThis as Record<string, unknown>;
  if (!bag[REGISTRY_KEY]) {
    bag[REGISTRY_KEY] = {
      usedBySource: new Map<string, string>(),
      countsByBase: new Map<string, number>(),
    } satisfies RegistryState;
  }
  return bag[REGISTRY_KEY] as RegistryState;
}

export function normalizeToken(value: string): string {
  const lower = value.trim().toLowerCase();
  let result = '';
  let prevDash = false;
  for (const ch of lower) {
    const isAlnum = (ch >= 'a' && ch <= 'z') || (ch >= '0' && ch <= '9');
    if (isAlnum) {
      result += ch;
      prevDash = false;
    } else if (!prevDash && result.length > 0) {
      result += '-';
      prevDash = true;
    }
  }
  if (result.endsWith('-')) result = result.slice(0, -1);
  return result;
}

export function baseFromProps(props: TestIdProps, fallbackPrefix: string, reactId: string): string {
  if (props['data-testid']) return props['data-testid'];
  if (props.id) return normalizeToken(props.id);
  if (props.name) return normalizeToken(props.name);
  if (props['aria-label']) return `${fallbackPrefix}-${normalizeToken(props['aria-label'])}`;
  if (props.title) return `${fallbackPrefix}-${normalizeToken(props.title)}`;
  if (typeof props.placeholder === 'string' && props.placeholder.trim().length > 0) {
    return `${fallbackPrefix}-${normalizeToken(props.placeholder)}`;
  }
  return `${fallbackPrefix}-${normalizeToken(reactId.replaceAll(':', '-'))}`;
}

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

