export const maybeGC = typeof globalThis.gc === "function" ? () => globalThis.gc() : () => {};
