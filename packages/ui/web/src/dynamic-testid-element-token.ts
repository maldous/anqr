import { normalizeToken } from "./dynamic-testid-normalize";

export function getElementToken(el: Element): string {
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
