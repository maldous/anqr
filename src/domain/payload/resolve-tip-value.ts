import type { EMVMPMParams } from '../../modules/payload-generators/types';

export function resolveTipValue(params: EMVMPMParams): number | undefined {
  if (params.tipIndicator === '02') return params.tipFixed;
  if (params.tipIndicator === '03') return params.tipPercentage;
  return undefined;
}
