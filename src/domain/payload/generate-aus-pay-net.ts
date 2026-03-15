import { EMVQRBuilder } from './emv';
import { finalizeEmvPayment } from './finalize-emv-payment';
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
  return finalizeEmvPayment(builder, {
    amount: params.amount,
    countryCode: 'AU',
    currency: ISO_CURRENCY.AUD,
    merchantCity: params.merchantCity,
    merchantName: params.merchantName,
    reference: params.reference,
  });
}
