import type { TestIdProps } from "./dynamic-testid-props.types";
import { normalizeToken } from "./dynamic-testid-normalize";

export function baseFromProps(props: TestIdProps, fallbackPrefix: string, reactId: string): string {
  const explicit = props.testId?.trim();
  if (explicit) return explicit;
  const candidates = [props.label, props["aria-label"], props.title, props.name, props.id, reactId];
  const first = candidates.find(
    (value): value is string => typeof value === "string" && value.trim().length > 0,
  );
  const token = first ? normalizeToken(first) : "control";
  return `${fallbackPrefix}-${token}`;
}
