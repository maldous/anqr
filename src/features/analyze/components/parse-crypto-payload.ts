// ---------------------------------------------------------------------------
// 8. Crypto address parser
// ---------------------------------------------------------------------------
import { CRYPTO_NETWORK_CONFIG } from "./crypto-network-config";

export function parseCryptoPayload(payload: string): Record<string, string | null> {
  const result: Record<string, string | null> = {
    network: null,
    address: null,
    addressPreview: null,
    amount: null,
    label: null,
    message: null,
    explorerUrl: null,
    networkColor: null,
  };

  const lowerPayload = payload.toLowerCase();
  let network = "Unknown";
  let address = payload;
  let queryString = "";
  const networkConfig = CRYPTO_NETWORK_CONFIG.find(({ prefix }) => lowerPayload.startsWith(prefix));
  if (networkConfig) {
    network = networkConfig.name;
    result.networkColor = networkConfig.color;
    const content = payload.slice(networkConfig.prefix.length);
    [address, queryString] = content.split("?");
    result.explorerUrl = `${networkConfig.explorerBaseUrl}${address}`;
  }

  result.network = network;
  result.address = address;
  result.addressPreview =
    address.length > 20 ? `${address.slice(0, 10)}...${address.slice(-10)}` : address;

  if (queryString) {
    const params = new URLSearchParams(queryString);
    result.amount = params.get("amount");
    result.label = params.get("label");
    result.message = params.get("message") || params.get("memo");
  }

  return result;
}
