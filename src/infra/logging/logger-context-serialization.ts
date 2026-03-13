export function safeJsonReplacer(_key: string, value: unknown): unknown {
  if (value instanceof Error) {
    return {
      __type: 'Error',
      name: value.name,
      message: value.message,
      stack: value.stack,
    };
  }
  if (value instanceof Set) {
    return { __type: 'Set', values: Array.from(value) };
  }
  if (value instanceof Map) {
    return { __type: 'Map', entries: Array.from(value.entries()) };
  }
  if (typeof value === 'function') {
    return '[Function]';
  }
  if (typeof HTMLElement !== 'undefined' && value instanceof HTMLElement) {
    return `[HTMLElement: ${value.tagName}]`;
  }
  if (typeof Node !== 'undefined' && value instanceof Node) {
    return `[Node: ${value.nodeName}]`;
  }
  if (ArrayBuffer.isView(value) && !(value instanceof DataView)) {
    return {
      __type: (value as Uint8Array).constructor.name,
      values: Array.from(value as Uint8Array),
    };
  }
  return value;
}

export function extractObjectProperties(obj: Record<string, unknown>): unknown {
  const result: Record<string, unknown> = {};
  try {
    for (const [key, value] of Object.entries(obj)) {
      try {
        if (value === null || value === undefined) {
          result[key] = value;
        } else if (typeof value === 'function') {
          result[key] = '[Function]';
        } else if (typeof value === 'object') {
          result[key] = structuredClone(value);
        } else {
          result[key] = value;
        }
      } catch {
        result[key] = `[Unserializable: ${typeof value}]`;
      }
    }
    return result;
  } catch {
    return '[Unserializable object]';
  }
}

export function safeSerializeContext(context: unknown): unknown {
  if (context === null || context === undefined) {
    return context;
  }

  try {
    return structuredClone(context);
  } catch {}

  try {
    const jsonStr = JSON.stringify(context, safeJsonReplacer);
    return JSON.parse(jsonStr);
  } catch {}

  if (typeof context === 'object') {
    return extractObjectProperties(context as Record<string, unknown>);
  }

  return '[Unserializable]';
}
