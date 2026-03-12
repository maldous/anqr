import { normalizeToken } from './normalize-token';
import type { TestIdProps } from './test-id-props';

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
