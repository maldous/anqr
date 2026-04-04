// Generated from ../../../../scripts/ops/integrations/model/symphony-openai-bridge.mjs:1593

import { voiceSpeakTool } from "./voice-speak-tool.mjs";

export function voiceAnnounce(text) {
  voiceSpeakTool({ text }).catch(() => {});
}
