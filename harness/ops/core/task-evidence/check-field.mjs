import { getNestedValue } from "./get-nested-value.mjs";

/** Check a single field against its rule. */
export function checkField(record, check) {
  const value = getNestedValue(record, check.path);
  switch (check.rule) {
    case "truthy":
      return value != null && value !== "" && value !== false;
    case "boolean":
      return typeof value === "boolean";
    case "equals":
      return value === check.value;
    default:
      return value != null;
  }
}
