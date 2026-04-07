import { PROBE_CYCLE_INTERVAL_MS } from "../symphony-openai-bridge/probe-cycle-interval-ms.mjs";

export const PROBE_RESULT_TTL_MS = PROBE_CYCLE_INTERVAL_MS + 5 * 60 * 1000;
