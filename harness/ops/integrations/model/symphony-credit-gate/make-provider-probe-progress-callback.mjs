function buildToolTag(event) {
  if (event.toolSupportHint) return ` [tools:${event.toolSupportHint}]`;
  if (event.toolCapable) return " [tools]";
  return "";
}

export function makeProviderProbeProgressCallback(state = {}) {
  const total = state.total || 0;
  const providerIndex = state.providerIndex || new Map();
  return function providerProbeProgress(event) {
    const index = providerIndex.get(event.providerName) || 0;
    const prefix = `[${index}/${total}] ${event.providerName}`;
    const detail = event.detail ? `, detail=${JSON.stringify(String(event.detail))}` : "";
    const answer = event.answer ? `, answer=${JSON.stringify(String(event.answer))}` : "";
    if (event.type === "provider_started") {
      const tag = buildToolTag(event);
      console.log(`${prefix} starting${tag}${detail}`);
      return;
    }
    if (event.type === "stage") {
      console.log(`${prefix} ${event.stage.replaceAll(":", " ")}${detail}`);
      return;
    }
    if (event.type === "provider_finished") {
      console.log(`${prefix} ${event.status} in ${event.durationMs}ms, ${event.reason}${detail}`);
      return;
    }
    if (event.type === "tool_probe_started") {
      console.log(`${prefix} tool probe starting`);
      return;
    }
    if (event.type === "tool_probe_skipped") {
      console.log(`${prefix} tool skipped, ${event.reason}${detail}`);
      return;
    }
    if (event.type === "tool_probe_finished") {
      console.log(`${prefix} tool ${event.status}, ${event.reason}${detail}${answer}`);
    }
  };
}
