/**
 * Resolve tip value based on tip indicator
 */
export function resolveTipValue(params: {
  tipIndicator?: "01" | "02" | "03";
  tipFixed?: number;
  tipPercentage?: number;
}): number | undefined {
  if (params.tipIndicator === "02") return params.tipFixed;
  if (params.tipIndicator === "03") return params.tipPercentage;
  return undefined;
}
