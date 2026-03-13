import { generateEMVMPM } from '@/modules/payload-generators';
import type { PayloadData } from './payload-data';

export function serializeEMVGeneric(payload: PayloadData): string {
  const emv = payload.emvGeneric;
  if (!(emv.merchantName && emv.countryCode && emv.currencyCode)) return '';
  const tipIndicatorMap: Record<string, '01' | '02' | '03' | undefined> = {
    prompt: '01',
    fixed: '02',
    percent: '03',
    none: undefined,
  };
  return generateEMVMPM({
    merchantName: emv.merchantName,
    merchantCity: emv.merchantCity,
    countryCode: emv.countryCode,
    currencyCode: emv.currencyCode,
    amount: emv.amount,
    isStatic: emv.isStatic,
    tipIndicator: emv.tipIndicator ? tipIndicatorMap[emv.tipIndicator] : undefined,
    tipFixed: emv.tipAmount,
    tipPercentage: emv.tipPercent,
    storeLabel: emv.storeLabel,
    customerLabel: emv.customerLabel,
    terminalLabel: emv.terminalLabel,
    loyaltyNumber: emv.loyaltyNumber,
    referenceLabel: emv.reference,
    purposeOfTransaction: emv.purposeOfTransaction,
    postalCode: emv.postalCode,
    mcc: emv.mcc,
  });
}
