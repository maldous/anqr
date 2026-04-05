export function makeProviderProbeProgressCallback(state = {}) {
  const total = state.total || 0;
  const providerIndex = state.providerIndex || new Map();
  let lastLine = "";
  return function providerProbeProgress(event) {
    const index = providerIndex.get(event.providerName) || 0;
    const prefix = `[${index}/${total}] ${event.providerName}`;
    let line = "";
    if (event.type === "provider_started") {
      line = `${prefix} starting${event.toolCapable ? " [tools]" : ""}`;
    } else if (event.type === "stage") {
      line = `${prefix} ${event.stage.replaceAll(":", " ")}`;
    } else if (event.type === "provider_finished") {
      line = `${prefix} ${event.status} in ${event.durationMs}ms, ${event.reason}`;
    } else if (event.type === "tool_probe_started") {
      line = `${prefix} tool probe starting`;
    } else if (event.type === "tool_probe_skipped") {
      line = `${prefix} tool ${event.status}, ${event.reason}`;
    } else if (event.type === "tool_probe_finished") {
      const detail = event.answer ? `, answer=${JSON.stringify(event.answer)}` : "";
      line = `${prefix} tool ${event.status}, ${event.reason}${detail}`;
    }
    if (!line || line === lastLine) return;
    lastLine = line;
    console.log(line);
  };
}
