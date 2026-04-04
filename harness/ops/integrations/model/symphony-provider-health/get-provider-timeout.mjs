import { PROVIDER_TIMEOUTS } from "./provider-timeouts.mjs";
import { isLocalProvider } from "./is-local-provider.mjs";

export function getProviderTimeout(providerName, baseUrl = "") {
  return isLocalProvider(providerName, baseUrl)
    ? PROVIDER_TIMEOUTS.LOCAL
    : PROVIDER_TIMEOUTS.HOSTED;
}
