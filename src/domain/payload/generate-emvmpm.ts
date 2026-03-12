import { EMVQRBuilder } from './emv';
import type { EMVMPMParams } from '../../modules/payload-generators/types';
import { resolveTipValue, buildEMVAdditionalData } from './payments._internal';

/**
 * Generate a generic EMV MPM QR code
 */
export function generateEMVMPM(params: EMVMPMParams): string {
  const builder = EMVQRBuilder.create()
    .setPayloadFormatIndicator()
    .setPointOfInitiation(params.isStatic ?? true);

  if (params.merchantAccounts) {
    for (const account of params.merchantAccounts) {
      builder.addMerchantAccountInfo(account.tag, account.gui, account.data);
    }
  }

  if (params.mcc) {
    builder.setMCC(params.mcc);
  }

  builder.setTransactionCurrency(params.currencyCode);

  if (params.amount !== undefined && params.amount > 0) {
    builder.setTransactionAmount(params.amount, params.currencyCode);
  }

  if (params.tipIndicator) {
    builder.setTipIndicator(params.tipIndicator, resolveTipValue(params));
  }

  builder.setCountryCode(params.countryCode);
  builder.setMerchantName(params.merchantName);
  builder.setMerchantCity(params.merchantCity);

  if (params.postalCode) {
    builder.setPostalCode(params.postalCode);
  }

  const additionalData = buildEMVAdditionalData(params);
  if (Object.keys(additionalData).length > 0) {
    builder.setAdditionalData(additionalData);
  }

  return builder.build();
}
