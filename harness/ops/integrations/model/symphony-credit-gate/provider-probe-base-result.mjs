import { providerProbeRouteInfo } from './provider-probe-route-info.mjs';

export function providerProbeBaseResult(provider, apiKey) {
  return {
    providerName: provider.name,
    model: provider.model,
    driver: provider.driver || 'openai-compatible',
    tier: provider.tier || 'free-cloud',
    envVar: provider.envVar || null,
    hasCredential: Boolean(apiKey),
    routeInfo: providerProbeRouteInfo(provider),
  };
}
