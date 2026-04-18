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

import { DISCORD_PREFIX, LINEAR_PREFIX, HEADER_PREFIX } from "./session-key-prefixes.mjs";

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
