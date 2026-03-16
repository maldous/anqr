export function elapsedMs(startMs: number): number {
  const now =
    typeof globalThis.performance?.now === "function" ? globalThis.performance.now() : Date.now();
  return Math.round((now - startMs) * 100) / 100;
}
