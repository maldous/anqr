#!/usr/bin/env node

/**
 * test-discord.mjs — Test Discord webhook and voice announcements
 * 
 * Usage: node scripts/ops/integrations/notifications/test-discord.mjs
 */

import { sendDiscordMessage, sendDiscordEmbed, streamDiscordUpdate } from './discord-webhook.mjs';
import http from 'node:http';
import { createLogger } from '../../lib/logger.mjs';

const { logInfo, logWarn, logError } = createLogger('test-discord');

const OPENCLAW_GATEWAY_HOST = process.env.OPENCLAW_GATEWAY_HOST || '127.0.0.1';
const OPENCLAW_GATEWAY_PORT = process.env.OPENCLAW_GATEWAY_PORT || 18789;
const OPENCLAW_GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || null;

/**
 * Send a voice announcement via OpenClaw message tool (Discord TTS)
 */
async function testVoiceAnnouncement(text) {
  if (!OPENCLAW_GATEWAY_TOKEN) {
    logInfo('❌ Voice test skipped: OPENCLAW_GATEWAY_TOKEN not set');
    return { sent: false, reason: 'OPENCLAW_GATEWAY_TOKEN not set' };
  }

  try {
    const requestBody = JSON.stringify({
      tool: 'message',
      args: {
        action: 'send',
        message: text,
        channel: 'discord',
        to: '1486262758256410647', // Voice channel
      },
    });

    const options = {
      hostname: OPENCLAW_GATEWAY_HOST,
      port: OPENCLAW_GATEWAY_PORT,
      path: '/tools/invoke',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody),
        'Authorization': `Bearer ${OPENCLAW_GATEWAY_TOKEN}`,
      },
      timeout: 10000,
    };

    return new Promise((resolve, _reject) => {
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          if (res.statusCode === 200) {
            logInfo(`✅ Voice announcement sent: "${text}"`);
            resolve({ sent: true });
          } else {
            logError(`❌ Voice announcement failed: ${res.statusCode} ${data}`);
            resolve({ sent: false, reason: `HTTP ${res.statusCode}` });
          }
        });
      });

      req.on('error', (err) => {
        logError(`❌ Voice announcement error: ${err.message}`);
        resolve({ sent: false, reason: err.message });
      });

      req.on('timeout', () => {
        req.destroy();
        logWarn(`❌ Voice announcement timeout`);
        resolve({ sent: false, reason: 'timeout' });
      });

      req.write(requestBody);
      req.end();
    });
  } catch (err) {
    logError(`❌ Voice announcement exception: ${err.message}`);
    return { sent: false, reason: err.message };
  }
}

async function runTests() {
  logInfo('🧪 Discord Integration Test');
  logInfo('========================================\n');

  // Test 1: Simple text message
  logInfo('Test 1: Simple Discord text message...');
  const textResult = await sendDiscordMessage('🧪 Test message from OpenClaw Symphony Bridge');
  logInfo(`Result: ${textResult.sent ? '✅ PASS' : '❌ FAIL'} ${textResult.reason || ''}\n`);

  // Test 2: Embedded message
  logInfo('Test 2: Discord embedded message...');
  const embedResult = await sendDiscordEmbed({
    title: '🧪 Test Embedded Message',
    description: 'This is a test of Discord webhook integration with embeds.',
    color: 0x5865F2,
    fields: [
      { name: 'Status', value: '✅ Active', inline: true },
      { name: 'Provider', value: 'codebuff', inline: true },
    ],
    footer: 'Symphony Bridge Test',
  });
  logInfo(`Result: ${embedResult.sent ? '✅ PASS' : '❌ FAIL'} ${embedResult.reason || ''}\n`);

  // Test 3: Progress update
  logInfo('Test 3: Discord progress update...');
  const progressResult = await streamDiscordUpdate(
    'Working on test task... This is a progress update.',
    { emoji: '⏳', timestamp: true }
  );
  logInfo(`Result: ${progressResult.sent ? '✅ PASS' : '❌ FAIL'} ${progressResult.reason || ''}\n`);

  // Test 4: Voice announcement
  logInfo('Test 4: Voice announcement via OpenClaw TTS...');
  const voiceResult = await testVoiceAnnouncement(
    'This is a test voice announcement from OpenClaw Symphony Bridge.'
  );
  logInfo(`Result: ${voiceResult.sent ? '✅ PASS' : '❌ FAIL'} ${voiceResult.reason || ''}\n`);

  // Summary
  logInfo('========================================');
  logInfo('Test Summary:');
  logInfo(`  Text message: ${textResult.sent ? '✅' : '❌'}`);
  logInfo(`  Embedded message: ${embedResult.sent ? '✅' : '❌'}`);
  logInfo(`  Progress update: ${progressResult.sent ? '✅' : '❌'}`);
  logInfo(`  Voice announcement: ${voiceResult.sent ? '✅' : '❌'}`);
  logInfo('========================================\n');

  const allPassed = textResult.sent && embedResult.sent && progressResult.sent && voiceResult.sent;
  if (allPassed) {
    logInfo('🎉 All tests PASSED!');
    process.exit(0);
  } else {
    logWarn('⚠️  Some tests FAILED - check configuration');
    process.exit(1);
  }
}

runTests().catch((err) => {
  logError(`❌ Test error: ${err.message}`);
  process.exit(1);
});
