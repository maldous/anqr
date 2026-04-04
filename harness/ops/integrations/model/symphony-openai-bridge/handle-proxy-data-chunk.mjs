import { processSSELine } from "./process-sseline.mjs";

export function _handleProxyDataChunk(chunk, res, state, onDiscordChunk) {
  state.partialBuffer += chunk.toString();
  const lines = state.partialBuffer.split("\n");
  state.partialBuffer = lines.pop() || "";

  for (const line of lines) {
    const transformed = processSSELine(line, state, onDiscordChunk);
    if (transformed === null) continue;
    res.write(`${transformed}\n`);
  }
}
