/**
 * Generous safety cap for text that will be sent to an API or stored in a
 * field with a practical size limit.  Linear comments reject bodies exceeding
 * ~100K chars; HTTP error bodies can be megabytes of HTML.
 *
 * Provides a very generous cap (50,000 chars) that preserves virtually all
 * meaningful diagnostic content while protecting against API rejection or
 * unbounded memory use.
 *
 * For `addComment` calls, the full error text is also preserved in local
 * state (lastError, recordRetryEvent, sidecar files) which have no API limits.
 *
 * @param {string | null | undefined} text - Text to cap
 * @returns {string} Original text if within limit, otherwise capped with indicator
 */
const SAFETY_CAP = 50_000;

export function safetyCap(text) {
  if (!text) return "";
  if (text.length <= SAFETY_CAP) return text;
  return text.slice(0, SAFETY_CAP) + "\n[… truncated at 50K chars]";
}
