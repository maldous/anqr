export function safeJsonReplacer(_key: string, value: unknown): unknown {
  if (value instanceof Error) {
    return {
      __type: "Error",
      name: value.name,
      message: value.message,
      stack: value.stack,
    };
  }
  if (value instanceof Set) {
    return { __type: "Set", values: Array.from(value) };
  }
  if (value instanceof Map) {
    return { __type: "Map", entries: Array.from(value.entries()) };
  }
  if (typeof value === "function") {
    return "[Function]";
  }
  if (typeof HTMLElement !== "undefined" && value instanceof HTMLElement) {
    return `[HTMLElement: ${value.tagName}]`;
  }
  if (typeof Node !== "undefined" && value instanceof Node) {
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
