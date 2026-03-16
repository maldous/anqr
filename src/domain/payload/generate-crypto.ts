import type { CryptoHelper } from "../../modules/payload-generators/types";

/**
 * Generate cryptocurrency payment URI (BIP-21 for Bitcoin, etc.)
 */
export function generateCrypto(params: CryptoHelper): string {
  const scheme = params.type.toLowerCase();
  let uri = `${scheme}:${params.address}`;

  const queryParams = new URLSearchParams();
  if (params.amount !== undefined && params.amount > 0) {
    queryParams.set("amount", params.amount.toString());
  }
  if (params.label) {
    queryParams.set("label", params.label);
  }

  const paramStr = queryParams.toString();
  if (paramStr) {
    uri += `?${paramStr}`;
  }

  return uri;
}
