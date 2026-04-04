// Generated from ../../../../scripts/ops/integrations/model/symphony-session-state.mjs:57

export const DEFAULT_ADAPTIVE_PARAMS = {
  freeTurnLimit: {
    base: 10, // Default turns before rotating free providers
    perProvider: {}, // Provider-specific overrides (auto-tuned)
    min: 3,
    max: 25,
  },
  evalCycle: {
    requestThreshold: 200, // Sample new provider every N requests
    timeThreshold: 1 * 60 * 60 * 1000, // Or every 1 hour (changed from 6 hours per user request)
    lastEval: Date.now(),
    counter: 0,
  },
  samplingRate: {
    base: 50, // Every 50 requests, force-sample an underused provider
    counter: 0,
  },
  lastTuningAt: Date.now(),
  tuningInterval: 50, // Re-tune parameters every 50 requests
};
