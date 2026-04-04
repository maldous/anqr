import { voiceSpeakTool } from "./voice-speak-tool.mjs";

export function voiceAnnounce(text) {
  voiceSpeakTool({ text }).catch(() => {});
}
