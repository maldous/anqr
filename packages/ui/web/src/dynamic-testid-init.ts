import { assignInTree } from "./dynamic-testid-assign";
import { ensureElementTestId } from "./dynamic-testid-ensure";

const INTERACTIVE_SELECTOR = [
  "button",
  "input",
  "textarea",
  "select",
  '[role="button"]',
  '[role="switch"]',
  '[role="slider"]',
  '[role="tab"]',
  '[role="combobox"]',
  '[role="option"]',
  "a[href]",
].join(",");

export function initAutoDynamicTestIds(): void {
  assignInTree(document, INTERACTIVE_SELECTOR);

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof Element)) continue;
        if (node.matches(INTERACTIVE_SELECTOR)) ensureElementTestId(node);
        assignInTree(node, INTERACTIVE_SELECTOR);
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}
