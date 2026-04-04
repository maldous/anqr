import {
  sendDiscordMessage,
  sendDiscordEmbed,
  streamDiscordUpdate,
  flushDiscordStream,
} from "../openclaw-discord.mjs";

import { testVoiceAnnouncement } from "./test-voice-announcement.mjs";
import { logInfo, logWarn } from "./logger.mjs";

export async function runTests() {
  logInfo("🧪 Discord Integration Test");
  logInfo("========================================\n");

  // Test 1: Simple text message
  logInfo("Test 1: Simple Discord text message...");
  const textResult = await sendDiscordMessage("🧪 Test message from OpenClaw Symphony Bridge");
  logInfo(`Result: ${textResult.sent ? "✅ PASS" : "❌ FAIL"} ${textResult.reason || ""}\n`);

  // Test 2: Embedded message
  logInfo("Test 2: Discord embedded message...");
  const embedResult = await sendDiscordEmbed({
    title: "🧪 Test Embedded Message",
    description: "This is a test of Discord webhook integration with embeds.",
    color: 0x5865f2,
    fields: [
      { name: "Status", value: "✅ Active", inline: true },
      { name: "Provider", value: "codebuff", inline: true },
    ],
    footer: "Symphony Bridge Test",
  });
  logInfo(`Result: ${embedResult.sent ? "✅ PASS" : "❌ FAIL"} ${embedResult.reason || ""}\n`);

  // Test 3: Progress update with flush
  logInfo("Test 3: Discord progress update (streaming with flush)...");
  await streamDiscordUpdate("Working on test task... ", {
    emoji: "⏳",
    timestamp: true,
    requestId: "test-flush",
  });
  // Add more to exceed buffer limit and trigger flush
  await streamDiscordUpdate("This is a progress update.", {
    emoji: "⏳",
    timestamp: true,
    requestId: "test-flush",
  });
  // Flush the remaining buffer
  const progressResult = await flushDiscordStream({
    emoji: "⏳",
    timestamp: true,
    requestId: "test-flush",
  });
  logInfo(
    `Result: ${progressResult.sent ? "✅ PASS" : "❌ FAIL"} ${progressResult.reason || ""}\n`,
  );

  // Test 4: Voice announcement
  logInfo("Test 4: Voice announcement via OpenClaw TTS...");
  const voiceResult = await testVoiceAnnouncement(
    "This is a test voice announcement from OpenClaw Symphony Bridge.",
  );
  logInfo(`Result: ${voiceResult.sent ? "✅ PASS" : "❌ FAIL"} ${voiceResult.reason || ""}\n`);

  // Summary
  logInfo("========================================");
  logInfo("Test Summary:");
  logInfo(`  Text message: ${textResult.sent ? "✅" : "❌"}`);
  logInfo(`  Embedded message: ${embedResult.sent ? "✅" : "❌"}`);
  logInfo(`  Progress update: ${progressResult.sent ? "✅" : "❌"}`);
  logInfo(`  Voice announcement: ${voiceResult.sent ? "✅" : "❌"}`);
  logInfo("========================================\n");

  const allPassed = textResult.sent && embedResult.sent && progressResult.sent && voiceResult.sent;
  if (allPassed) {
    logInfo("🎉 All tests PASSED!");
    process.exit(0);
  } else {
    logWarn("⚠️  Some tests FAILED - check configuration");
    process.exit(1);
  }
}
