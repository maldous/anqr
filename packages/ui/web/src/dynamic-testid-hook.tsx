import React from "react";
import type { TestIdProps } from "./dynamic-testid-props.types";
import { baseFromProps } from "./dynamic-testid-base-from-props";
import { allocateUniqueId } from "./dynamic-testid-allocate";

export function useDynamicTestId(props: TestIdProps, fallbackPrefix: string): string {
  const reactId = React.useId();
  const sourceKeyRef = React.useRef<string>(`src-${reactId}`);
  return React.useMemo(() => {
    const base = baseFromProps(props, fallbackPrefix, reactId);
    return allocateUniqueId(base, sourceKeyRef.current);
  }, [props, fallbackPrefix, reactId]);
}
