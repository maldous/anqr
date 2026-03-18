import React from "react";

type TestIdProps = {
  testId?: string;
  label?: string;
  "aria-label"?: string;
  title?: string;
  name?: string;
  id?: string;
};

const REGISTRY_KEY = "__ANQR_DYNAMIC_TESTID_REGISTRY__";

type Registry = {
  usedBySource: Map<string, string>;
  countsByBase: Map<string, number>;
};

function getRegistry(): Registry {
  const bag = globalThis as Record<string, unknown>;
  if (!(REGISTRY_KEY in bag)) {
    bag[REGISTRY_KEY] = {
      usedBySource: new Map<string, string>(),
      countsByBase: new Map<string, number>(),
    } satisfies Registry;
  }
  return bag[REGISTRY_KEY] as Registry;
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

function normalizeToken(value: string): string {
  const lower = value.trim().toLowerCase();
  let result = "";
  let prevDash = false;
  for (const ch of lower) {
    const isAlnum = (ch >= "a" && ch <= "z") || (ch >= "0" && ch <= "9");
    if (isAlnum) {
      result += ch;
      prevDash = false;
    } else if (!prevDash && result.length > 0) {
      result += "-";
      prevDash = true;
    }
  }
  return result.endsWith("-") ? result.slice(0, -1) : result;
}

function baseFromProps(props: TestIdProps, fallbackPrefix: string, reactId: string): string {
  const explicit = props.testId?.trim();
  if (explicit) return explicit;
  const candidates = [props.label, props["aria-label"], props.title, props.name, props.id, reactId];
  const first = candidates.find((value): value is string => typeof value === "string" && value.trim().length > 0);
  const token = first ? normalizeToken(first) : "control";
  return `${fallbackPrefix}-${token}`;
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
