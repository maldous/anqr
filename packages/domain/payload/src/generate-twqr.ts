import { EMVQRBuilder } from "./emv";
import type { TWQRParams } from "./payload-generators/types";
import { ISO_CURRENCY, PAYMENT_SCHEME_GUI } from "./payload-generators/types";

/**
 * Generate TWQR code (Taiwan)
 */
export function generateTWQR(params: TWQRParams): string {
  const builder = EMVQRBuilder.create()
    .setPayloadFormatIndicator()
    .setPointOfInitiation(!params.amount);

  const maiData: Array<{ tag: string; value: string }> = [{ tag: "01", value: params.merchantId }];
  if (params.taxId) {
    maiData.push({ tag: "02", value: params.taxId });
  }

  builder.addMerchantAccountInfo(26, PAYMENT_SCHEME_GUI.TWQR, maiData);

  builder.setTransactionCurrency(ISO_CURRENCY.TWD);

  if (params.amount !== undefined && params.amount > 0) {
    builder.setTransactionAmount(params.amount, ISO_CURRENCY.TWD);
  }

  builder.setCountryCode("TW");
  builder.setMerchantName(params.merchantName);

  if (params.merchantCity) {
    builder.setMerchantCity(params.merchantCity);
  }

  return builder.build();
}
