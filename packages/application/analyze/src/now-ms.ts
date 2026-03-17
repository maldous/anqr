export const nowMs = (): number => {
  return typeof globalThis.performance?.now === "function"
    ? globalThis.performance.now()
    : Date.now();
};
