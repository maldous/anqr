import { ensureElementTestId } from './ensure-element-testid';

export function assignInTree(root: ParentNode, selector: string): void {
  const elements = root.querySelectorAll(selector);
  for (const el of elements) ensureElementTestId(el);
}
