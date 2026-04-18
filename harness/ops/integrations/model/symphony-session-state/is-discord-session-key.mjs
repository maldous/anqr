import { DISCORD_PREFIX } from "./session-key-prefixes.mjs";

/**
 * Check if a session key is from a Discord source.
 */
export function isDiscordSessionKey(key) {
  return key?.startsWith(DISCORD_PREFIX) ?? false;
}
