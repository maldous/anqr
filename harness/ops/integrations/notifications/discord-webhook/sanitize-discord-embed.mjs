// Generated from ../../../../scripts/ops/integrations/notifications/discord-webhook.mjs:44

import { trimToUndefined } from "./trim-to-undefined.mjs";

export function sanitizeDiscordEmbed(embed = {}) {
  const title = trimToUndefined(embed.title);
  const description = trimToUndefined(embed.description);
  const fields = Array.isArray(embed.fields)
    ? embed.fields
        .map((field) => ({
          name: trimToUndefined(field?.name),
          value: trimToUndefined(field?.value),
          inline: Boolean(field?.inline),
        }))
        .filter((field) => field.name && field.value)
    : [];

  if (!title && !description && fields.length === 0) return null;

  const sanitized = { ...embed };
  if (title) sanitized.title = title;
  else delete sanitized.title;
  if (description) sanitized.description = description;
  else delete sanitized.description;
  if (fields.length > 0) sanitized.fields = fields;
  else delete sanitized.fields;
  return sanitized;
}
