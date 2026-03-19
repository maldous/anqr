import { EMVQRBuilder } from "./emv";
import { finalizeEmvPayment } from "./finalize-emv-payment";
import type { HKQRParams } from "./payload-generators/types";
import { ISO_CURRENCY, PAYMENT_SCHEME_GUI } from "./payload-generators/types";

/**
 * Generate HKQR / FPS QR code (Hong Kong)
 */
export function generateHKQR(params: HKQRParams): string {
  const builder = EMVQRBuilder.create()
    .setPayloadFormatIndicator()
    .setPointOfInitiation(!params.amount);

  const maiData: Array<{ tag: string; value: string }> = [];
  if (params.fpsId) {
    maiData.push({ tag: "01", value: params.fpsId });
  }
  if (params.mobileNumber) {
    maiData.push({ tag: "02", value: params.mobileNumber });
  }
  if (params.email) {
    maiData.push({ tag: "03", value: params.email });
  }

  builder.addMerchantAccountInfo(26, PAYMENT_SCHEME_GUI.HKFPS, maiData);
  return finalizeEmvPayment(builder, {
    amount: params.amount,
    countryCode: "HK",
    currency: ISO_CURRENCY.HKD,
    merchantCity: params.merchantCity,
    merchantName: params.merchantName,
    reference: params.reference,
  });
}
