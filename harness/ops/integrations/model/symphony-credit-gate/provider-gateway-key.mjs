export function providerGatewayKey(provider) {
  return [provider?.driver || 'openai-compatible', provider?.envVar || '', provider?.baseUrl || provider?.name || 'unknown'].join('|');
}
