import { LOCAL_PROVIDER_PATTERNS } from "./local-provider-patterns.mjs";

export function isLocalProvider(providerName, baseUrl = "") {
  return LOCAL_PROVIDER_PATTERNS.some(
    (pattern) => pattern.test(providerName) || pattern.test(baseUrl),
  );
}
