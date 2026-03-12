import { EMVQRBuilder } from './emv';
import type { AusPayNetParams } from '../../modules/payload-generators/types';
import { ISO_CURRENCY, PAYMENT_SCHEME_GUI } from '../../modules/payload-generators/types';

/**
 * Generate AusPayNet/NPP PayID QR code (Australia)
 */
export function generateAusPayNet(params: AusPayNetParams): string {
  const builder = EMVQRBuilder.create()
    .setPayloadFormatIndicator()
    .setPointOfInitiation(!params.amount);

  const maiData: Array<{ tag: string; value: string }> = [];

  if (params.payId && params.payIdType) {
    maiData.push({ tag: '01', value: params.payIdType }, { tag: '02', value: params.payId });
  }

  if (params.bsb && params.accountNumber) {
    maiData.push({ tag: '03', value: params.bsb }, { tag: '04', value: params.accountNumber });
  }

  builder.addMerchantAccountInfo(26, PAYMENT_SCHEME_GUI.AUSPAYNET, maiData);

  builder.setTransactionCurrency(ISO_CURRENCY.AUD);

  if (params.amount !== undefined && params.amount > 0) {
    builder.setTransactionAmount(params.amount);
  }

  builder.setCountryCode('AU');

  if (params.merchantName) {
    builder.setMerchantName(params.merchantName);
  }

  if (params.merchantCity) {
    builder.setMerchantCity(params.merchantCity);
  }

  if (params.reference) {
    builder.setAdditionalData({ referenceLabel: params.reference });
  }

  return builder.build();
}
