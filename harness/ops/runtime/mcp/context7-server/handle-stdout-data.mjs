import { handleJsonRpcMessage } from "./handle-json-rpc-message.mjs";
import { stdoutBuffer, setStdoutBuffer } from "./stdout-buffer.mjs";
import { logDebug, logWarn } from "./logger.mjs";

export function handleStdoutData(chunk) {
  setStdoutBuffer(stdoutBuffer + chunk);

  // Process all complete lines (newline-delimited JSON-RPC)
  let newlineIdx;
  while ((newlineIdx = stdoutBuffer.indexOf("\n")) !== -1) {
    const line = stdoutBuffer.slice(0, newlineIdx).trim();
    setStdoutBuffer(stdoutBuffer.slice(newlineIdx + 1));

    if (!line) continue;

    try {
      const message = JSON.parse(line);
      logDebug("Received JSON-RPC message", { id: message.id, method: message.method });
      handleJsonRpcMessage(message);
    } catch (err) {
      logWarn(`Failed to parse JSON-RPC message: ${err.message}`, { raw: line.slice(0, 200) });
    }
  }
}
