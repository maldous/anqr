// Generated from ../../../../scripts/ops/integrations/model/symphony-bridge-truncation.mjs:151

import { MESSAGE_TRUNCATION_MARKER } from "./message-truncation-marker.mjs";

export function validateContextCoherence(messages, providerName) {
  const warnings = [];

  // Check for system message
  const hasSystemMessage = messages.some((m) => m.role === "system");
  if (!hasSystemMessage) {
    warnings.push(`No system message found for ${providerName} — context may lack instructions`);
  }

  // Check role alternation (allow multiple system messages, but user/assistant should alternate)
  let lastNonSystemRole = null;
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (msg.role === "system") continue;

    if (lastNonSystemRole && lastNonSystemRole === msg.role) {
      warnings.push(
        `Role alternation broken at message ${i}: consecutive ${msg.role} messages (provider: ${providerName})`,
      );
      break; // Only report first violation
    }
    lastNonSystemRole = msg.role;
  }

  // Check for truncation markers in last message (indicates incomplete context)
  const lastMsg = messages[messages.length - 1];
  if (lastMsg && typeof lastMsg.content === "string") {
    if (lastMsg.content.includes(MESSAGE_TRUNCATION_MARKER)) {
      warnings.push(
        `Last message contains truncation marker — final turn may be incomplete (provider: ${providerName})`,
      );
    }
  }

  return {
    valid: warnings.length === 0,
    warnings,
  };
}
