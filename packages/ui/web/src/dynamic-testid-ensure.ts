import { allocateUniqueId } from "./dynamic-testid-allocate";
import { getElementToken } from "./dynamic-testid-element-token";
import { normalizeToken } from "./dynamic-testid-normalize";
import { autoTestIdState } from "./dynamic-testid-state";

export function ensureElementTestId(el: Element): void {
  if ((el as HTMLElement).dataset?.testid !== undefined) return;

  const keyAttr = "data-auto-testid-key";
  let sourceKey = el.getAttribute(keyAttr);
  if (!sourceKey) {
    sourceKey = `auto-${++autoTestIdState.counter}`;
    el.setAttribute(keyAttr, sourceKey);
  }

  const tag = normalizeToken(el.tagName);
  const token = getElementToken(el);
  const base = `auto-${tag}-${token || "control"}`;
  const resolved = allocateUniqueId(base, sourceKey);
  (el as HTMLElement).dataset.testid = resolved;
}
