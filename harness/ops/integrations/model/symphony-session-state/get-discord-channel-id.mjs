import { isDiscordSessionKey } from "./is-discord-session-key.mjs";
import { DISCORD_PREFIX } from "./session-key-prefixes.mjs";

/**
 * Extract the Discord channel ID from a Discord session key.
 * Returns null if the key is not a Discord key.
 */
export function getDiscordChannelId(key) {
  if (!isDiscordSessionKey(key)) return null;
  const parts = key.slice(DISCORD_PREFIX.length).split(":");
  // Last segment is always the channel ID (guild:channel or just channel)
  return parts[parts.length - 1];
}
