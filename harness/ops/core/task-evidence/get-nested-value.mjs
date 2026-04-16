/** Resolve a dot-path to a nested value. */
export function getNestedValue(obj, dotPath) {
  let current = obj;
  for (const part of dotPath.split(".")) {
    if (current == null) return undefined;
    current = current[part];
  }
  return current;
}
