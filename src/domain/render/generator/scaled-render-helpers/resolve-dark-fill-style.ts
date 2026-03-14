export function resolveDarkFillStyle(
  forceBinary: boolean,
  effectiveFgColor: string,
  useGradient: boolean,
  gradientFill: string | CanvasGradient | null
): string | CanvasGradient {
  if (forceBinary) return effectiveFgColor;
  return useGradient && gradientFill ? gradientFill : effectiveFgColor;
}
