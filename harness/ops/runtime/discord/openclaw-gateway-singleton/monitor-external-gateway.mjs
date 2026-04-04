import { HOST } from "./host.mjs";
import { PORT } from "./port.mjs";
import { PORT_CHECK_INTERVAL_MS } from "./port-check-interval-ms.mjs";
import { isPortListening } from "./is-port-listening.mjs";
import { logInfo } from "./log-info.mjs";
import { sleep } from "./sleep.mjs";
import { stopping } from "./stopping.mjs";

export async function monitorExternalGateway() {
  logInfo(`External gateway detected on ${HOST}:${PORT}; monitoring until it goes down`);
  while (!stopping) {
    await sleep(PORT_CHECK_INTERVAL_MS);
    if (stopping) return true;
    const alive = await isPortListening(HOST, PORT);
    if (!alive) {
      logInfo(`External gateway on ${HOST}:${PORT} is no longer listening; will spawn`);
      return false;
    }
  }
  return true;
}
