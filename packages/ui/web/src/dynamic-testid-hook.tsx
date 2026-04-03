import React from "react";
import type { TestIdProps } from "./dynamic-testid-props.types";
import { baseFromProps } from "./dynamic-testid-base-from-props";
import { allocateUniqueId } from "./dynamic-testid-allocate";
import { getRegistry } from "./dynamic-testid-registry";

export function useDynamicTestId(props: TestIdProps, fallbackPrefix: string): string {
  const reactId = React.useId();
  const sourceKeyRef = React.useRef<string>(`src-${reactId}`);
  const previousBaseRef = React.useRef<string | null>(null);

  return React.useMemo(() => {
    const base = baseFromProps(props, fallbackPrefix, reactId);

    // If base changed, we need to update the registry mapping
    if (previousBaseRef.current !== null && previousBaseRef.current !== base) {
      const registry = getRegistry();
      registry.usedBySource.delete(sourceKeyRef.current);
    }
    previousBaseRef.current = base;

    return allocateUniqueId(base, sourceKeyRef.current);
  }, [
    props["data-testid"],
    props.id,
    props.name,
    props["aria-label"],
    props.title,
    props.placeholder,
    fallbackPrefix,
    reactId,
  ]);
}
