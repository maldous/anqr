import { sanitizeDiscordEmbed } from "./sanitize-discord-embed.mjs";
import { trimToUndefined } from "./trim-to-undefined.mjs";

export function sanitizeDiscordPayload(payload = {}) {
  const content = trimToUndefined(payload.content);
  const embeds = Array.isArray(payload.embeds)
    ? payload.embeds.map(sanitizeDiscordEmbed).filter(Boolean)
    : [];

  if (!content && embeds.length === 0) return null;

  const sanitized = { ...payload };
  if (content) sanitized.content = content;
  else delete sanitized.content;
  if (embeds.length > 0) sanitized.embeds = embeds;
  else delete sanitized.embeds;
  return sanitized;
}
