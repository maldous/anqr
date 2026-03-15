import { EMVQRBuilder } from './emv';
import type { QRISParams } from '../../modules/payload-generators/types';
import { ISO_CURRENCY, PAYMENT_SCHEME_GUI } from '../../modules/payload-generators/types';

// ============================================
// NATIONAL EMV PAYMENT SCHEME GENERATORS
// ============================================

/**
 * Generate QRIS QR code (Indonesia)
 */
export function generateQRIS(params: QRISParams): string {
  const builder = EMVQRBuilder.create()
    .setPayloadFormatIndicator()
    .setPointOfInitiation(!params.amount);

  const maiData: Array<{ tag: string; value: string }> = [{ tag: '01', value: params.merchantID }];
  if (params.merchantCriteria) {
    maiData.push({ tag: '02', value: params.merchantCriteria });
  }
  if (params.nmid) {
    maiData.push({ tag: '03', value: params.nmid });
  }

  builder.addMerchantAccountInfo(26, PAYMENT_SCHEME_GUI.QRIS, maiData);

  if (params.merchantPAN) {
    builder.addMerchantAccountInfo(51, 'ID.CO.QRIS.WWW', [
      { tag: '01', value: params.merchantPAN },
    ]);
  }

  builder.setTransactionCurrency(ISO_CURRENCY.IDR);

  if (params.amount !== undefined && params.amount > 0) {
    builder.setTransactionAmount(params.amount, ISO_CURRENCY.IDR);
  }

  if (params.feeType === 'FIXED' && params.feeAmount) {
    builder.setTipIndicator('02', params.feeAmount);
  } else if (params.feeType === 'PERCENT' && params.feeAmount) {
    builder.setTipIndicator('03', params.feeAmount);
  }

  builder.setCountryCode('ID');
  builder.setMerchantName(params.merchantName);
  builder.setMerchantCity(params.merchantCity);

  if (params.postalCode) {
    builder.setPostalCode(params.postalCode);
  }

  if (params.terminalLabel) {
    builder.setAdditionalData({ terminalLabel: params.terminalLabel });
  }

  return builder.build();
}
