import { EMVQRBuilder } from "./emv";
import { finalizeEmvPayment } from "./finalize-emv-payment";
import type { PayNowParams } from "../../modules/payload-generators/types";
import { ISO_CURRENCY, PAYMENT_SCHEME_GUI } from "../../modules/payload-generators/types";

/**
 * Generate PayNow QR code (Singapore)
 */
export function generatePayNow(params: PayNowParams): string {
  const builder = EMVQRBuilder.create()
    .setPayloadFormatIndicator()
    .setPointOfInitiation(!params.amount);

  const proxyTypeCode = {
    mobile: "0",
    uen: "2",
    nric: "1",
  }[params.type];

  const maiData: Array<{ tag: string; value: string }> = [
    { tag: "01", value: proxyTypeCode },
    { tag: "02", value: params.value },
    { tag: "03", value: params.editable ? "1" : "0" },
  ];
  if (params.expiryDate) {
    maiData.push({ tag: "04", value: params.expiryDate });
  }

  builder.addMerchantAccountInfo(26, PAYMENT_SCHEME_GUI.PAYNOW, maiData);
  return finalizeEmvPayment(builder, {
    amount: params.amount,
    countryCode: "SG",
    currency: ISO_CURRENCY.SGD,
    merchantCity: params.merchantCity,
    merchantName: params.merchantName,
    reference: params.reference,
  });
}
