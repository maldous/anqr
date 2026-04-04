// Generated from ../../../../scripts/ops/integrations/notifications/discord-webhook.mjs:38

export function trimToUndefined(value) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}
