export function computeDitherLightBlendParams(isExtreme: boolean): {
  maxBlend: number;
  whiteBase: number;
  whitePush: number;
} {
  if (isExtreme) return { maxBlend: 0.28, whiteBase: 0.84, whitePush: 0.14 };
  return { maxBlend: 0.16, whiteBase: 0.92, whitePush: 0.06 };
}
