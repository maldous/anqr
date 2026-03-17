import type { SvgAccessibilityAttr } from "./svg-accessibility-attr";

export function composeSvgAccessibilityAttr(
  value: unknown,
  defaultId: string,
): SvgAccessibilityAttr {
  let result: SvgAccessibilityAttr = { text: null, id: null };
  if (typeof value === "string") {
    result = { text: value, id: value ? defaultId : null };
  } else if (value && typeof value === "object") {
    result = value as SvgAccessibilityAttr;
  }
  result.text = result.text || null;
  result.id = result.text ? result.id || defaultId : null;
  return result;
}
