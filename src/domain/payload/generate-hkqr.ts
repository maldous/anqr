import { EMVQRBuilder } from './emv';
import type { HKQRParams } from '../../modules/payload-generators/types';
import { ISO_CURRENCY, PAYMENT_SCHEME_GUI } from '../../modules/payload-generators/types';

/**
 * Generate HKQR / FPS QR code (Hong Kong)
 */
export function generateHKQR(params: HKQRParams): string {
  const builder = EMVQRBuilder.create()
    .setPayloadFormatIndicator()
    .setPointOfInitiation(!params.amount);

  const maiData: Array<{ tag: string; value: string }> = [];
  if (params.fpsId) {
    maiData.push({ tag: '01', value: params.fpsId });
  }
  if (params.mobileNumber) {
    maiData.push({ tag: '02', value: params.mobileNumber });
  }
  if (params.email) {
    maiData.push({ tag: '03', value: params.email });
  }

  builder.addMerchantAccountInfo(26, PAYMENT_SCHEME_GUI.HKFPS, maiData);

  builder.setTransactionCurrency(ISO_CURRENCY.HKD);

  if (params.amount !== undefined && params.amount > 0) {
    builder.setTransactionAmount(params.amount);
  }

  builder.setCountryCode('HK');
  builder.setMerchantName(params.merchantName);

  if (params.merchantCity) {
    builder.setMerchantCity(params.merchantCity);
  }

  if (params.reference) {
    builder.setAdditionalData({ referenceLabel: params.reference });
  }

  return builder.build();
}
