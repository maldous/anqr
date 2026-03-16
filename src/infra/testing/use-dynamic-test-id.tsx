import { useId, useRef, useMemo } from 'react';
import { baseFromProps } from './base-from-props';
import type { TestIdProps } from './test-id-props';
import { DynamicTestId } from './dynamic-test-id';

export function useDynamicTestId(props: TestIdProps, fallbackPrefix: string): string {
  const reactId = useId();
  const sourceKeyRef = useRef<string>(`src-${reactId}`);

  return useMemo(() => {
    const base = baseFromProps(props, fallbackPrefix, reactId);
    return DynamicTestId.resolve(base, sourceKeyRef.current);
  }, [props, fallbackPrefix, reactId]);
}
