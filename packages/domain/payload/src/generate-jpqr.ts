import { EMVQRBuilder } from "./emv";
import type { JPQRParams } from "./payload-generators/types";
import { ISO_CURRENCY, PAYMENT_SCHEME_GUI } from "./payload-generators/types";

/**
 * Generate JPQR code (Japan)
 */
export function generateJPQR(params: JPQRParams): string {
  const builder = EMVQRBuilder.create()
    .setPayloadFormatIndicator()
    .setPointOfInitiation(!params.amount);

  builder.addMerchantAccountInfo(26, PAYMENT_SCHEME_GUI.JPQR, [
    { tag: "01", value: params.storeId },
  ]);

  builder.setTransactionCurrency(ISO_CURRENCY.JPY);

  if (params.amount !== undefined && params.amount > 0) {
    builder.setTransactionAmount(params.amount, ISO_CURRENCY.JPY);
  }

  builder.setCountryCode("JP");
  builder.setMerchantName(params.merchantName);

  if (params.merchantCity) {
    builder.setMerchantCity(params.merchantCity);
  }

  return builder.build();
}
