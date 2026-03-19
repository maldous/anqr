import { ensureElementTestId } from "./dynamic-testid-ensure";
import { assignInTree } from "./dynamic-testid-assign";

export function initAutoDynamicTestIds(): void {
  const interactiveSelector = [
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

  assignInTree(document, interactiveSelector);

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof Element)) continue;
        if (node.matches(interactiveSelector)) ensureElementTestId(node);
        assignInTree(node, interactiveSelector);
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}
