import { EMVQRBuilder } from "./emv";
import type { BharatQRParams } from "../../modules/payload-generators/types";
import { ISO_CURRENCY, PAYMENT_SCHEME_GUI } from "../../modules/payload-generators/types";

/**
 * Generate BharatQR code (India)
 */
export function generateBharatQR(params: BharatQRParams): string {
  const builder = EMVQRBuilder.create()
    .setPayloadFormatIndicator()
    .setPointOfInitiation(!params.amount);

  const maiData: Array<{ tag: string; value: string }> = [];

  if (params.merchantVPA) {
    maiData.push({ tag: "01", value: params.merchantVPA });
  }
  if (params.merchantPAN) {
    maiData.push({ tag: "02", value: params.merchantPAN });
  }
  if (params.merchantID) {
    maiData.push({ tag: "03", value: params.merchantID });
  }

  builder.addMerchantAccountInfo(26, PAYMENT_SCHEME_GUI.BHARATQR, maiData);

  if (params.mcc) {
    builder.setMCC(params.mcc);
  }

  builder.setTransactionCurrency(ISO_CURRENCY.INR);

  if (params.amount !== undefined && params.amount > 0) {
    builder.setTransactionAmount(params.amount);
  }

  builder.setCountryCode("IN");
  builder.setMerchantName(params.merchantName);
  builder.setMerchantCity(params.merchantCity);

  const additionalData: Record<string, string> = {};
  if (params.referenceNumber) additionalData.referenceLabel = params.referenceNumber;
  if (params.terminalId) additionalData.terminalLabel = params.terminalId;
  if (Object.keys(additionalData).length > 0) {
    builder.setAdditionalData(additionalData);
  }

  return builder.build();
}
