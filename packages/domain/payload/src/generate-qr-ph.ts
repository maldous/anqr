import { EMVQRBuilder } from "./emv";
import type { QRPhParams } from "@/modules/payload-generators/types";
import { ISO_CURRENCY, PAYMENT_SCHEME_GUI } from "@/modules/payload-generators/types";

/**
 * Generate QR Ph code (Philippines)
 */
export function generateQRPh(params: QRPhParams): string {
  const builder = EMVQRBuilder.create()
    .setPayloadFormatIndicator()
    .setPointOfInitiation(!params.amount);

  builder.addMerchantAccountInfo(26, PAYMENT_SCHEME_GUI.QRPH, [
    { tag: "01", value: params.accountNumber },
  ]);

  builder.setTransactionCurrency(ISO_CURRENCY.PHP);

  if (params.amount !== undefined && params.amount > 0) {
    builder.setTransactionAmount(params.amount);
  }

  builder.setCountryCode("PH");
  builder.setMerchantName(params.merchantName);
  builder.setMerchantCity(params.merchantCity);

  if (params.reference) {
    builder.setAdditionalData({ referenceLabel: params.reference });
  }

  return builder.build();
}
