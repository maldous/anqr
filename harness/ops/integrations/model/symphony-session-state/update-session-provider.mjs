// Generated from ../../../../scripts/ops/integrations/model/symphony-session-state.mjs:151

import { TIER_FREE } from "./tier-free.mjs";
import { loadSessionState } from "./load-session-state.mjs";
import { saveSessionState } from "./save-session-state.mjs";

export function updateSessionProvider(sessionId, provider) {
  if (!sessionId) return;

  const state = loadSessionState();
  const existing = state[sessionId];

  if (existing && existing.provider === provider.name) {
    // Same provider - increment turn count
    existing.turnCount++;
    existing.lastUsed = Date.now();
    existing.mode = provider.mode || existing.mode;
    // Preserve messages and messageHash (if present)
  } else {
    // New provider - reset turn count but preserve existing messages if any
    state[sessionId] = {
      provider: provider.name,
      mode: provider.mode || "unknown",
      tier: provider.tier || TIER_FREE,
      turnCount: 1,
      lastUsed: Date.now(),
      // Preserve messages if switching provider within same session (conversation continuity)
      messages: existing?.messages,
      messageHash: existing?.messageHash,
    };
  }

  saveSessionState(state);
}
