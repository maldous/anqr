// Generated from ../../../../scripts/ops/runtime/symphony/watchdog-monitor.mjs:35

import { args } from "./args.mjs";

export const bridgeArg = args.find((a) => a.startsWith("--bridge="))?.split("=")[1] || "both";
