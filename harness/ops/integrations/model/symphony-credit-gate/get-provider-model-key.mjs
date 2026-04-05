import { providerGatewayKey } from "./provider-gateway-key.mjs";

export function getProviderModelKey(provider) {
  return `${providerGatewayKey(provider)}::${provider?.model || provider?.name || "unknown"}`;
}
