import { ensureElementTestId } from "./dynamic-testid-ensure";

export function assignInTree(root: ParentNode, selector: string): void {
  const elements = root.querySelectorAll(selector);
  for (const el of elements) ensureElementTestId(el);
}
