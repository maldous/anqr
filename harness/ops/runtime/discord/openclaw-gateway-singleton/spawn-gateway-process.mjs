import { spawn } from "node:child_process";

import { CLI } from "./cli.mjs";
import { CONFIG_PATH } from "./config-path.mjs";
import { DEFAULT_CONFIG } from "./default-config.mjs";
import { HOST } from "./host.mjs";
import { PORT } from "./port.mjs";
import { WORKTREE_PATH } from "./worktree-path.mjs";
import { logError } from "./log-error.mjs";
import { logInfo } from "./log-info.mjs";
import { logWarn } from "./log-warn.mjs";
import { writeLockMetadata } from "./write-lock-metadata.mjs";

export function spawnGatewayProcess() {
  const args = ["gateway"];

  // This OpenClaw build reads .openclaw/openclaw.json from the working directory
  // and does not support CLI flags like --config. Keep the bridge pinned to the
  // selected worktree by running the gateway from that worktree path.
  if (CONFIG_PATH && CONFIG_PATH !== DEFAULT_CONFIG) {
    logWarn(
      `OPENCLAW_CONFIG_PATH is set to ${CONFIG_PATH}, but this OpenClaw build does not support --config; using cwd ${WORKTREE_PATH}`,
    );
  }
  if (process.env.OPENCLAW_GATEWAY_PROFILE) {
    logWarn(
      `OPENCLAW_GATEWAY_PROFILE=${process.env.OPENCLAW_GATEWAY_PROFILE} ignored because this OpenClaw build does not support --profile`,
    );
  }

  const env = {
    ...process.env,
    NO_COLOR: "1",
    OPENCLAW_DISABLE_BONJOUR: "1",
    OPENCLAW_BONJOUR_MODE: "off",
    OPENCLAW_DISABLE_ADVERTISER: "1",
    OPENCLAW_GATEWAY_ADVERTISE: "off",
    OPENCLAW_GATEWAY_HOST: HOST,
    OPENCLAW_GATEWAY_BIND: HOST,
    OPENCLAW_GATEWAY_PORT: String(PORT),
  };

  logInfo(`Starting OpenClaw gateway via ${CLI} on ${HOST}:${PORT}`);
  const child = spawn(CLI, args, {
    stdio: "inherit",
    env,
    cwd: WORKTREE_PATH,
  });

  child.once("spawn", () => {
    writeLockMetadata({ gatewayPid: child.pid }).catch(() => {});
  });

  child.on("error", (err) => {
    logError(`OpenClaw gateway failed to start: ${err.message}`);
  });

  return child;
}
