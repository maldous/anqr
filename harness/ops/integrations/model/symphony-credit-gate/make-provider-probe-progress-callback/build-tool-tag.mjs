export function buildToolTag(event) {
  if (event.toolSupportHint) return ` [tools:${event.toolSupportHint}]`;
  if (event.toolCapable) return " [tools]";
  return "";
}
