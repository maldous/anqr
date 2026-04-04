// Generated from ../../../../scripts/ops/runtime/discord/openclaw-gateway-singleton.mjs:218

import { HOST } from "./host.mjs";
import { PORT } from "./port.mjs";
import { RESTART_BACKOFF_MS } from "./restart-backoff-ms.mjs";
import { childProcess, setChildProcess } from "./child-process.mjs";
import { isLockStillOurs } from "./is-lock-still-ours.mjs";
import { isPortListening } from "./is-port-listening.mjs";
import { lockHeld, setLockHeld } from "./lock-held.mjs";
import { logWarn } from "./log-warn.mjs";
import { monitorExternalGateway } from "./monitor-external-gateway.mjs";
import { sleep } from "./sleep.mjs";
import { spawnGatewayProcess } from "./spawn-gateway-process.mjs";
import { stopping } from "./stopping.mjs";
import { writeLockMetadata } from "./write-lock-metadata.mjs";

export async function runGatewayOwnerLoop() {
  while (!stopping) {
    const portInUse = await isPortListening(HOST, PORT);
    if (portInUse) {
      const shouldStop = await monitorExternalGateway();
      if (shouldStop || stopping) break;
      if (!(await isLockStillOurs())) {
        logWarn("Lock was taken during external gateway monitoring; returning to follower mode");
        setLockHeld(false);
        return;
      }
      continue;
    }

    await writeLockMetadata();
    setChildProcess(spawnGatewayProcess());
    const exitInfo = await new Promise((resolve) => {
      childProcess.once("exit", (code, signal) => {
        resolve({ code, signal });
      });
      childProcess.once("error", (err) => {
        resolve({ error: err });
      });
    });
    setChildProcess(null);

    if (stopping) break;

    if (exitInfo.error) {
      logWarn(`Gateway launch error; retrying in ${RESTART_BACKOFF_MS}ms`);
    } else {
      logWarn(
        `Gateway exited (code ${exitInfo.code ?? "?"}, signal ${exitInfo.signal ?? "?"}); restarting in ${RESTART_BACKOFF_MS}ms`,
      );
    }

    const backoff = RESTART_BACKOFF_MS + Math.floor(Math.random() * 5000);
    await sleep(backoff);

    if (!(await isLockStillOurs())) {
      logWarn("Lock was taken by another runner during backoff; returning to follower mode");
      setLockHeld(false);
      return;
    }
  }
}
