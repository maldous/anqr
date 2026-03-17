export function undefinedIfEqual<T>(value: T, defaultValue: T): T | undefined {
  return value === defaultValue ? undefined : value;
}
