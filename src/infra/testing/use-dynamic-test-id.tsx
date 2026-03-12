import React from 'react';
import { TestIdProps, baseFromProps } from './dynamic-testid._internal';
import { DynamicTestId } from './dynamic-test-id';

export function useDynamicTestId(props: TestIdProps, fallbackPrefix: string): string {
  const reactId = React.useId();
  const sourceKeyRef = React.useRef<string>(`src-${reactId}`);

  return React.useMemo(() => {
    const base = baseFromProps(props, fallbackPrefix, reactId);
    return DynamicTestId.resolve(base, sourceKeyRef.current);
  }, [props, fallbackPrefix, reactId]);
}
