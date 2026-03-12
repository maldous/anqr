/*
 * Generated scaffold from split manifest.
 * Source: src/hooks/useQRGenerator.ts
 * Notes: Deep-clone plain serializable values.
 */

export function clonePlainSerializable(value: unknown): unknown {
  if (
    value == null ||
    typeof value === 'string' ||
    typeof value === 'boolean' ||
    typeof value === 'number'
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((entry) => clonePlainSerializable(entry));
  }

  if (typeof value !== 'object') {
    return undefined;
  }

  const proto = Object.getPrototypeOf(value);
  if (proto !== Object.prototype && proto !== null) {
    return undefined;
  }

  const source = value as Record<string, unknown>;
  const target: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(source)) {
    const cloned = clonePlainSerializable(entry);
    if (cloned !== undefined) {
      target[key] = cloned;
    }
  }
  return target;
}
