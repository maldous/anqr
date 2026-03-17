const REGISTRY_KEY = "__ANQR_DYNAMIC_TESTID_REGISTRY__";

function getRegistry(): { usedBySource: Map<string, string>; countsByBase: Map<string, number> } {
  const bag = globalThis as Record<string, unknown>;
  if (!(REGISTRY_KEY in bag)) {
    bag[REGISTRY_KEY] = {
      usedBySource: new Map<string, string>(),
      countsByBase: new Map<string, number>(),
    };
  }
  return bag[REGISTRY_KEY] as { usedBySource: Map<string, string>; countsByBase: Map<string, number> };
}

function allocateUniqueId(base: string, sourceKey: string): string {
  const registry = getRegistry();
  const existing = registry.usedBySource.get(sourceKey);
  if (existing) return existing;

  if (!registry.countsByBase.has(base)) {
    registry.countsByBase.set(base, 1);
    registry.usedBySource.set(sourceKey, base);
    return base;
  }

  const next = (registry.countsByBase.get(base) || 1) + 1;
  registry.countsByBase.set(base, next);
  const unique = `${base}-${next}`;
  registry.usedBySource.set(sourceKey, unique);
  return unique;
}

function normalizeToken(value: string): string {
  const lower = value.trim().toLowerCase();
  let result = "";
  let prevDash = false;
  for (const ch of lower) {
    const isAlnum = (ch >= "a" && ch <= "z") || (ch >= "0" && ch <= "9");
    if (isAlnum) {
      result += ch;
      prevDash = false;
    } else if (!prevDash && result.length > 0) {
      result += "-";
      prevDash = true;
    }
  }
  if (result.endsWith("-")) result = result.slice(0, -1);
  return result;
}

function getElementToken(el: Element): string {
  const aria = el.getAttribute("aria-label");
  if (aria) return normalizeToken(aria);
  const title = el.getAttribute("title");
  if (title) return normalizeToken(title);
  const name = el.getAttribute("name");
  if (name) return normalizeToken(name);
  const id = el.getAttribute("id");
  if (id) return normalizeToken(id);
  const role = el.getAttribute("role");
  if (role) return normalizeToken(role);
  const text = el.textContent || "";
  const normalized = normalizeToken(text).slice(0, 40);
  if (normalized) return normalized;
  return normalizeToken(el.tagName);
}

const autoTestIdState = {
  counter: 0,
};

function ensureElementTestId(el: Element): void {
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
  const resolved = DynamicTestId.resolve(base, sourceKey);
  (el as HTMLElement).dataset.testid = resolved;
}

function assignInTree(root: ParentNode, selector: string): void {
  const elements = root.querySelectorAll(selector);
  for (const el of elements) ensureElementTestId(el);
}

export const DynamicTestId = {
  resolve(base: string, sourceKey: string): string {
    return allocateUniqueId(base, sourceKey);
  },
};

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
