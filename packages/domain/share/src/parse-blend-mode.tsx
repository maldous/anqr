export function parseBlendMode(params: URLSearchParams): "overlay" | "dither" | undefined {
  const mode = params.get("blendPresMode");
  if (mode === "dither" || mode === "overlay") return mode;
  return undefined;
}
