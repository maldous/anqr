export function providerProbeStage(name, extra = {}) {
  return {
    name,
    at: new Date().toISOString(),
    ...extra,
  };
}
