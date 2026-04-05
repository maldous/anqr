export function makeProviderProbeProgressCallback(state = {}) {
  const total = state.total || 0;
  const providerIndex = state.providerIndex || new Map();
  return function providerProbeProgress(event) {
    const index = providerIndex.get(event.providerName) || 0;
    const prefix = `[${index}/${total}] ${event.providerName}`;
    if (event.type === 'provider_started') {
      console.log(`${prefix} starting${event.toolCapable ? ' [tools]' : ''}`);
      return;
    }
    if (event.type === 'stage') {
      console.log(`${prefix} ${event.stage.replaceAll(':', ' ')}`);
      return;
    }
    if (event.type === 'provider_finished') {
      console.log(`${prefix} ${event.status} in ${event.durationMs}ms, ${event.reason}`);
      return;
    }
    if (event.type === 'tool_probe_started') {
      console.log(`${prefix} tool probe starting`);
      return;
    }
    if (event.type === 'tool_probe_finished') {
      console.log(`${prefix} tool ${event.status}, ${event.reason}`);
    }
  };
}
