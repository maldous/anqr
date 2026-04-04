import { childProcess } from "./child-process.mjs";
import { logInfo } from "./log-info.mjs";
import { logWarn } from "./log-warn.mjs";
import { stopping, setStopping } from "./stopping.mjs";

export function handleSignal(signal) {
  return () => {
    if (stopping) return;
    setStopping(true);
    logInfo(`Received ${signal}, shutting down`);
    if (childProcess) {
      try {
        childProcess.kill(signal);
      } catch (err) {
        logWarn(`Failed to forward ${signal} to gateway: ${err.message}`);
      }
    }
  };
}
