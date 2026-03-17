export function undefinedIfFalsy<T>(value: T): T | undefined {
  return value || undefined;
}
