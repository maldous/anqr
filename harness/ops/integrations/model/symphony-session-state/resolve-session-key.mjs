/**
 * Canonical session key resolver.
 *
 * The session key is the stable identity for a conversation or task across
 * follow-up requests, model switches, and worktree routing. It must be:
 * - Deterministic: same inputs always produce the same key
 * - Unique: Discord and Linear keys never collide
 * - Durable: survives process restarts and worktree changes
 *
 * Key formats:
 * - Discord:  discord:<guildId>:<channelId>
 * - Linear:   linear:<issueIdentifier>
 * - Fallback: header:<x-openclaw-session-value>
 */

const DISCORD_PREFIX = "discord:";
const LINEAR_PREFIX = "linear:";
const HEADER_PREFIX = "header:";

/**
 * Resolve a canonical session key from request context.
 *
 * @param {{
 *   discordGuildId?: string|null,
 *   discordChannelId?: string|null,
 *   linearIssueIdentifier?: string|null,
 *   headerSessionKey?: string|null,
 * }} source
 * @returns {string|null} Canonical session key, or null if no identity available
 */
export function resolveSessionKey(source) {
  // Discord: guild + channel uniquely identifies a conversation thread
  if (source.discordGuildId && source.discordChannelId) {
    return `${DISCORD_PREFIX}${source.discordGuildId}:${source.discordChannelId}`;
  }
  // Discord: channel alone (DMs or missing guild header)
  if (source.discordChannelId) {
    return `${DISCORD_PREFIX}${source.discordChannelId}`;
  }
  // Linear: issue identifier (e.g. ANQ-1234)
  if (source.linearIssueIdentifier) {
    return `${LINEAR_PREFIX}${source.linearIssueIdentifier}`;
  }
  // Fallback: use the header-provided session key if available
  if (source.headerSessionKey) {
    return `${HEADER_PREFIX}${source.headerSessionKey}`;
  }
  return null;
}

/**
 * Check if a session key is from a Discord source.
 */
export function isDiscordSessionKey(key) {
  return key?.startsWith(DISCORD_PREFIX) ?? false;
}

/**
 * Check if a session key is from a Linear source.
 */
export function isLinearSessionKey(key) {
  return key?.startsWith(LINEAR_PREFIX) ?? false;
}

/**
 * Extract the Linear issue identifier from a Linear session key.
 * Returns null if the key is not a Linear key.
 */
export function getLinearIssueId(key) {
  if (!isLinearSessionKey(key)) return null;
  return key.slice(LINEAR_PREFIX.length);
}

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
