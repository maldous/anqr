import { EMVQRBuilder } from "./emv";
import type { PIXParams } from "../../modules/payload-generators/types";
import { ISO_CURRENCY, PAYMENT_SCHEME_GUI } from "../../modules/payload-generators/types";

/**
 * Generate PIX QR code (Brazil)
 */
export function generatePIX(params: PIXParams): string {
  const builder = EMVQRBuilder.create()
    .setPayloadFormatIndicator()
    .setPointOfInitiation(!params.amount);

  const maiData: Array<{ tag: string; value: string }> = [{ tag: "01", value: params.key }];
  if (params.description) {
    maiData.push({ tag: "02", value: params.description.substring(0, 72) });
  }
  if (params.url) {
    maiData.push({ tag: "25", value: params.url });
  }

  builder.addMerchantAccountInfo(26, PAYMENT_SCHEME_GUI.PIX, maiData);
  builder.setMCC("0000");
  builder.setTransactionCurrency(ISO_CURRENCY.BRL);

  if (params.amount !== undefined && params.amount > 0) {
    builder.setTransactionAmount(params.amount);
  }

  builder.setCountryCode("BR");

  if (params.name) {
    builder.setMerchantName(params.name);
  }
  if (params.city) {
    builder.setMerchantCity(params.city);
  }
  if (params.postalCode) {
    builder.setPostalCode(params.postalCode);
  }

  if (params.txid) {
    builder.setAdditionalData({ referenceLabel: params.txid });
  }

  return builder.build();
}
