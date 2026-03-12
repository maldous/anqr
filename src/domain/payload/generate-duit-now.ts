import { EMVQRBuilder } from './emv';
import type { DuitNowParams } from '../../modules/payload-generators/types';
import { ISO_CURRENCY, PAYMENT_SCHEME_GUI } from '../../modules/payload-generators/types';

/**
 * Generate DuitNow QR code (Malaysia)
 */
export function generateDuitNow(params: DuitNowParams): string {
  const builder = EMVQRBuilder.create()
    .setPayloadFormatIndicator()
    .setPointOfInitiation(!params.amount);

  const proxyTypeMap: Record<string, string> = {
    NRIC: '01',
    MOBILE: '02',
    PASSPORT: '03',
    ARMY: '04',
    BUSINESS: '05',
    OTHERS: '99',
  };

  const maiData: Array<{ tag: string; value: string }> = [
    { tag: '01', value: proxyTypeMap[params.proxyType] },
    { tag: '02', value: params.proxyValue },
  ];

  builder.addMerchantAccountInfo(26, PAYMENT_SCHEME_GUI.DUITNOW, maiData);

  builder.setTransactionCurrency(ISO_CURRENCY.MYR);

  if (params.amount !== undefined && params.amount > 0) {
    builder.setTransactionAmount(params.amount);
  }

  builder.setCountryCode('MY');
  builder.setMerchantName(params.merchantName);

  if (params.merchantCity) {
    builder.setMerchantCity(params.merchantCity);
  }

  if (params.reference) {
    builder.setAdditionalData({ referenceLabel: params.reference });
  }

  return builder.build();
}
