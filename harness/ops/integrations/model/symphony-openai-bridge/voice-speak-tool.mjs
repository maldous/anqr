// Generated from ../../../../scripts/ops/integrations/model/symphony-openai-bridge.mjs:1508

import http from "node:http";

import { OPENCLAW_GATEWAY_HOST } from "./openclaw-gateway-host.mjs";
import { OPENCLAW_GATEWAY_PORT } from "./openclaw-gateway-port.mjs";
import { OPENCLAW_GATEWAY_TOKEN } from "./openclaw-gateway-token.mjs";
import { isVoiceNoise } from "./is-voice-noise.mjs";
import { sanitizeTextForSpeech } from "./sanitize-text-for-speech.mjs";
import { logDebug, logInfo, logWarn } from "./logger.mjs";

export async function voiceSpeakTool({ text, guildId }) {
  if (!OPENCLAW_GATEWAY_TOKEN) {
    return {
      error: "OPENCLAW_GATEWAY_TOKEN not configured",
      message: "voice_speak requires OPENCLAW_GATEWAY_TOKEN to call the OpenClaw Gateway.",
      available: false,
    };
  }

  const rawText = (text || "").trim();
  if (!rawText) {
    return { error: "No text provided to speak" };
  }

  if (isVoiceNoise(rawText)) {
    logDebug(`🔊 voice_speak: skipping noise: "${rawText.slice(0, 80)}"`);
    return { ok: true, skipped: true, reason: "filtered as operational noise" };
  }

  const speakText = sanitizeTextForSpeech(rawText);
  if (!speakText) {
    logDebug(`🔊 voice_speak: nothing speakable after sanitization`);
    return { ok: true, skipped: true, reason: "no speakable content after sanitization" };
  }

  try {
    logInfo(`🔊 voice_speak: "${speakText.slice(0, 100)}"`);

    const args = { text: speakText };
    if (guildId) args.guildId = guildId;

    const requestBody = JSON.stringify({ tool: "voice_speak", args });

    const response = await new Promise((resolve, reject) => {
      const options = {
        hostname: OPENCLAW_GATEWAY_HOST,
        port: OPENCLAW_GATEWAY_PORT,
        path: "/tools/invoke",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(requestBody),
          Authorization: `Bearer ${OPENCLAW_GATEWAY_TOKEN}`,
        },
        timeout: 30000,
      };

      const req = http.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          if (res.statusCode === 200) {
            try {
              resolve(JSON.parse(data));
            } catch {
              resolve({ ok: true, raw: data });
            }
          } else {
            reject(new Error(`OpenClaw Gateway returned ${res.statusCode}: ${data.slice(0, 200)}`));
          }
        });
      });

      req.on("error", (err) => reject(err));
      req.on("timeout", () => {
        req.destroy();
        reject(new Error("OpenClaw Gateway request timed out"));
      });

      req.write(requestBody);
      req.end();
    });

    logInfo(`🔊 voice_speak result: ${JSON.stringify(response).slice(0, 200)}`);
    return response;
  } catch (error) {
    logWarn(`🔊 voice_speak failed: ${error.message}`);
    return { error: error.message, available: false };
  }
}
