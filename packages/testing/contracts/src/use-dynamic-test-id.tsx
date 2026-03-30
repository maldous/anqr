import React from "react";
import { baseFromProps } from "./base-from-props";
import type { TestIdProps } from "./test-id.types";
import { DynamicTestId } from "./dynamic-test-id";
import { getRegistry } from "@anqr/ui-web";

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
    
    return DynamicTestId.resolve(base, sourceKeyRef.current);
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
