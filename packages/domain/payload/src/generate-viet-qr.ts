import { EMVQRBuilder } from "./emv";
import type { VietQRParams } from "./payload-generators/types";
import { ISO_CURRENCY, PAYMENT_SCHEME_GUI } from "./payload-generators/types";

/**
 * Generate VietQR code (Vietnam)
 */
export function generateVietQR(params: VietQRParams): string {
  const builder = EMVQRBuilder.create()
    .setPayloadFormatIndicator()
    .setPointOfInitiation(!params.amount);

  const maiData: Array<{ tag: string; value: string }> = [
    { tag: "01", value: params.bankBin },
    { tag: "02", value: params.accountNumber },
  ];
  if (params.serviceCode) {
    maiData.push({ tag: "03", value: params.serviceCode });
  }

  builder.addMerchantAccountInfo(38, PAYMENT_SCHEME_GUI.VIETQR, maiData);

  builder.setTransactionCurrency(ISO_CURRENCY.VND);

  if (params.amount !== undefined && params.amount > 0) {
    builder.setTransactionAmount(params.amount, ISO_CURRENCY.VND);
  }

  builder.setCountryCode("VN");

  if (params.accountName) {
    builder.setMerchantName(params.accountName);
  }

  if (params.description) {
    builder.setAdditionalData({ purposeOfTransaction: params.description });
  }

  return builder.build();
}
