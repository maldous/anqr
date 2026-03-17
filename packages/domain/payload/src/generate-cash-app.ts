import type { CashAppParams } from "@/modules/payload-generators/types";

/**
 * Generate Cash App ($cashtag) payment link
 */
export function generateCashApp(params: CashAppParams): string {
  const cashtag = params.cashtag.replace(/^\$/, "");
  let url = `https://cash.app/$${cashtag}`;

  if (params.amount !== undefined && params.amount > 0) {
    url += `/${params.amount.toFixed(2)}`;
  }

  return url;
}
