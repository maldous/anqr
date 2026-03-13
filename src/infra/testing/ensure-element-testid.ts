import { DynamicTestId } from '@/infra/testing/dynamic-testid';
import { autoTestIdState } from './auto-testid-state';
import { getElementToken } from './get-element-token';
import { normalizeToken } from './normalize-auto-testid-token';

export function ensureElementTestId(el: Element): void {
  if ((el as HTMLElement).dataset?.testid !== undefined) return;

  const keyAttr = 'data-auto-testid-key';
  let sourceKey = el.getAttribute(keyAttr);
  if (!sourceKey) {
    sourceKey = `auto-${++autoTestIdState.counter}`;
    el.setAttribute(keyAttr, sourceKey);
  }

  const tag = normalizeToken(el.tagName);
  const token = getElementToken(el);
  const base = `auto-${tag}-${token || 'control'}`;
  const resolved = DynamicTestId.resolve(base, sourceKey);
  (el as HTMLElement).dataset.testid = resolved;
}
