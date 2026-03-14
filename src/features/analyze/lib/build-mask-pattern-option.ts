export function buildMaskPatternOption(
  maskToUse: number | undefined
): { maskPattern: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 } | Record<string, never> {
  if (typeof maskToUse === 'number' && maskToUse >= 0 && maskToUse <= 7) {
    return { maskPattern: maskToUse as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 };
  }

  return {};
}
