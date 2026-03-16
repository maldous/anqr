import type { PayPalMeParams } from "../../modules/payload-generators/types";

/**
 * Generate PayPal.Me payment link
 */
export function generatePayPalMe(params: PayPalMeParams): string {
  let url = `https://paypal.me/${params.username}`;

  if (params.amount !== undefined && params.amount > 0) {
    url += `/${params.amount.toFixed(2)}`;
    if (params.currencyCode) {
      url += params.currencyCode.toUpperCase();
    }
  }

  return url;
}
