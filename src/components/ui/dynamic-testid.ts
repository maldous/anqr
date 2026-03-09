import * as React from 'react';

type TestIdProps = {
  'data-testid'?: string;
  id?: string;
  name?: string;
  title?: string;
  placeholder?: string;
  'aria-label'?: string;
};

type RegistryState = {
  usedBySource: Map<string, string>;
  countsByBase: Map<string, number>;
};

const REGISTRY_KEY = '__ANQR_DYNAMIC_TESTID_REGISTRY__';

function getRegistry(): RegistryState {
  const bag = globalThis as Record<string, unknown>;
  if (!bag[REGISTRY_KEY]) {
    bag[REGISTRY_KEY] = {
      usedBySource: new Map<string, string>(),
      countsByBase: new Map<string, number>(),
    } satisfies RegistryState;
  }
  return bag[REGISTRY_KEY] as RegistryState;
}

function normalizeToken(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-+|-+$/g, '')
    .replaceAll(/--+/g, '-');
}

function baseFromProps(props: TestIdProps, fallbackPrefix: string, reactId: string): string {
  if (props['data-testid']) return props['data-testid'];
  if (props.id) return normalizeToken(props.id);
  if (props.name) return normalizeToken(props.name);
  if (props['aria-label']) return `${fallbackPrefix}-${normalizeToken(props['aria-label'])}`;
  if (props.title) return `${fallbackPrefix}-${normalizeToken(props.title)}`;
  if (typeof props.placeholder === 'string' && props.placeholder.trim().length > 0) {
    return `${fallbackPrefix}-${normalizeToken(props.placeholder)}`;
  }
  return `${fallbackPrefix}-${normalizeToken(reactId.replaceAll(/[:]/g, '-'))}`;
}

function allocateUniqueId(base: string, sourceKey: string): string {
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

export const DynamicTestId = {
  resolve(base: string, sourceKey: string): string {
    return allocateUniqueId(base, sourceKey);
  },
};

export function useDynamicTestId(props: TestIdProps, fallbackPrefix: string): string {
  const reactId = React.useId();
  const sourceKeyRef = React.useRef<string>(`src-${reactId}`);

  return React.useMemo(() => {
    const base = baseFromProps(props, fallbackPrefix, reactId);
    return DynamicTestId.resolve(base, sourceKeyRef.current);
  }, [props, fallbackPrefix, reactId]);
}
