import { EMVQRBuilder } from "./emv";
import { finalizeEmvPayment } from "./finalize-emv-payment";
import type { DuitNowParams } from "../../modules/payload-generators/types";
import { ISO_CURRENCY, PAYMENT_SCHEME_GUI } from "../../modules/payload-generators/types";

/**
 * Generate DuitNow QR code (Malaysia)
 */
export function generateDuitNow(params: DuitNowParams): string {
  const builder = EMVQRBuilder.create()
    .setPayloadFormatIndicator()
    .setPointOfInitiation(!params.amount);

  const proxyTypeMap: Record<string, string> = {
    NRIC: "01",
    MOBILE: "02",
    PASSPORT: "03",
    ARMY: "04",
    BUSINESS: "05",
    OTHERS: "99",
  };

  const maiData: Array<{ tag: string; value: string }> = [
    { tag: "01", value: proxyTypeMap[params.proxyType] },
    { tag: "02", value: params.proxyValue },
  ];

  builder.addMerchantAccountInfo(26, PAYMENT_SCHEME_GUI.DUITNOW, maiData);
  return finalizeEmvPayment(builder, {
    amount: params.amount,
    countryCode: "MY",
    currency: ISO_CURRENCY.MYR,
    merchantCity: params.merchantCity,
    merchantName: params.merchantName,
    reference: params.reference,
  });
}
