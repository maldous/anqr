export const discordStreamBuffers = new Map();

// Orphan cleanup — reap buffer entries older than 5 minutes.
// Protects the long-running executor from leaking state when
// finalizeDiscordStream is missed (timeout, disconnect, crash).
const ORPHAN_TTL_MS = 5 * 60 * 1000;
const REAP_INTERVAL_MS = 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [key, state] of discordStreamBuffers) {
    if (state.createdAt && now - state.createdAt > ORPHAN_TTL_MS) {
      if (state.timer) clearTimeout(state.timer);
      discordStreamBuffers.delete(key);
    }
  }
}, REAP_INTERVAL_MS).unref();
