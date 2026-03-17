export function omitWhenEqual<T>(value: T, omitValue: T): T | undefined {
  return value === omitValue ? undefined : value;
}
