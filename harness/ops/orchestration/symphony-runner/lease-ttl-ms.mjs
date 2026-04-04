// Generated from ../../../scripts/ops/orchestration/symphony-runner.mjs:204

import { RUNNER_STUCK_THRESHOLD_MS } from "../../symphony-config.mjs";

export const LEASE_TTL_MS = Number(
  process.env.ANQR_SYMPHONY_LEASE_MS || Math.max(RUNNER_STUCK_THRESHOLD_MS, 20 * 60 * 1000),
);
