import type { TestIdProps } from "./dynamic-testid-props.types";
import { normalizeToken } from "./dynamic-testid-normalize";

export function baseFromProps(props: TestIdProps, fallbackPrefix: string, reactId: string): string {
  // Priority order: testId > data-testid > label > aria-label > title > name > id > placeholder > reactId
  if (props.testId) {
    const trimmed = props.testId.trim();
    if (trimmed) return trimmed;
  }
  if (props["data-testid"]) return props["data-testid"];
  if (props.label) return `${fallbackPrefix}-${normalizeToken(props.label)}`;
  if (props["aria-label"]) return `${fallbackPrefix}-${normalizeToken(props["aria-label"])}`;
  if (props.title) return `${fallbackPrefix}-${normalizeToken(props.title)}`;
  if (props.name) return `${fallbackPrefix}-${normalizeToken(props.name)}`;
  if (props.id) return `${fallbackPrefix}-${normalizeToken(props.id)}`;
  if (typeof props.placeholder === "string" && props.placeholder.trim().length > 0) {
    return `${fallbackPrefix}-${normalizeToken(props.placeholder)}`;
  }
  const normalizedReactId = reactId.replaceAll(":", "-");
  if (!normalizedReactId || normalizedReactId === "-") {
    return `${fallbackPrefix}-control`;
  }
  return `${fallbackPrefix}-${normalizedReactId}`;
}
