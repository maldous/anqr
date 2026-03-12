import { EMVQRBuilder } from './emv';
import type { PromptPayParams } from '../../modules/payload-generators/types';
import { ISO_CURRENCY, PAYMENT_SCHEME_GUI } from '../../modules/payload-generators/types';

/**
 * Generate PromptPay QR code (Thailand)
 */
export function generatePromptPay(params: PromptPayParams): string {
  const builder = EMVQRBuilder.create()
    .setPayloadFormatIndicator()
    .setPointOfInitiation(!params.amount);

  const aidMap = {
    mobile: PAYMENT_SCHEME_GUI.PROMPTPAY_MOBILE,
    id: PAYMENT_SCHEME_GUI.PROMPTPAY_TAX_ID,
    ewallet: PAYMENT_SCHEME_GUI.PROMPTPAY_EWALLET,
    billpay: PAYMENT_SCHEME_GUI.PROMPTPAY_BILLPAY,
  };
  const aid = aidMap[params.type];

  let formattedValue = params.value.replaceAll(/[\s-]/g, '');
  if (params.type === 'mobile' && formattedValue.startsWith('0')) {
    formattedValue = `66${formattedValue.substring(1)}`;
  }

  const maiData: Array<{ tag: string; value: string }> = [{ tag: '01', value: formattedValue }];

  if (params.type === 'billpay') {
    if (params.ref1) maiData.push({ tag: '02', value: params.ref1 });
    if (params.ref2) maiData.push({ tag: '03', value: params.ref2 });
  }

  builder.addMerchantAccountInfo(29, aid, maiData);

  if (params.type === 'billpay' && params.ref3) {
    builder.addMerchantAccountInfo(30, PAYMENT_SCHEME_GUI.PROMPTPAY_BILLPAY, [
      { tag: '01', value: params.ref3 },
    ]);
  }

  if (params.mcc) {
    builder.setMCC(params.mcc);
  }

  builder.setTransactionCurrency(ISO_CURRENCY.THB);

  if (params.amount !== undefined && params.amount > 0) {
    builder.setTransactionAmount(params.amount);
  }

  builder.setCountryCode(params.countryCode || 'TH');

  if (params.merchantName) {
    builder.setMerchantName(params.merchantName);
  }
  if (params.merchantCity) {
    builder.setMerchantCity(params.merchantCity);
  }

  return builder.build();
}
