import { DynamicTestId } from '@/infra/testing/dynamic-testid';

const INTERACTIVE_SELECTOR = [
  'button',
  'input',
  'textarea',
  'select',
  '[role="button"]',
  '[role="switch"]',
  '[role="slider"]',
  '[role="tab"]',
  '[role="combobox"]',
  '[role="option"]',
  'a[href]',
].join(',');

let autoCounter = 0;

const normalizeToken = (value: string): string => {
  const lower = value.trim().toLowerCase();
  let result = '';
  let prevDash = false;
  for (const ch of lower) {
    const isAlnum = (ch >= 'a' && ch <= 'z') || (ch >= '0' && ch <= '9');
    if (isAlnum) {
      result += ch;
      prevDash = false;
    } else if (!prevDash && result.length > 0) {
      result += '-';
      prevDash = true;
    }
  }
  if (result.endsWith('-')) result = result.slice(0, -1);
  return result;
};

const getElementToken = (el: Element): string => {
  const aria = el.getAttribute('aria-label');
  if (aria) return normalizeToken(aria);
  const title = el.getAttribute('title');
  if (title) return normalizeToken(title);
  const name = el.getAttribute('name');
  if (name) return normalizeToken(name);
  const id = el.getAttribute('id');
  if (id) return normalizeToken(id);
  const role = el.getAttribute('role');
  if (role) return normalizeToken(role);
  const text = el.textContent || '';
  const normalized = normalizeToken(text).slice(0, 40);
  if (normalized) return normalized;
  return normalizeToken(el.tagName);
};

const ensureElementTestId = (el: Element): void => {
  if ((el as HTMLElement).dataset?.testid !== undefined) return;

  const keyAttr = 'data-auto-testid-key';
  let sourceKey = el.getAttribute(keyAttr);
  if (!sourceKey) {
    sourceKey = `auto-${++autoCounter}`;
    el.setAttribute(keyAttr, sourceKey);
  }

  const tag = normalizeToken(el.tagName);
  const token = getElementToken(el);
  const base = `auto-${tag}-${token || 'control'}`;
  const resolved = DynamicTestId.resolve(base, sourceKey);
  (el as HTMLElement).dataset.testid = resolved;
};

const assignInTree = (root: ParentNode): void => {
  const elements = root.querySelectorAll(INTERACTIVE_SELECTOR);
  for (const el of elements) ensureElementTestId(el);
};

export function initAutoDynamicTestIds(): void {
  assignInTree(document);

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof Element)) continue;
        if (node.matches(INTERACTIVE_SELECTOR)) ensureElementTestId(node);
        assignInTree(node);
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}
