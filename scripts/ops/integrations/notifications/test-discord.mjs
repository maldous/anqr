#!/usr/bin/env node

/**
 * test-discord.mjs — Test Discord webhook and voice announcements
 * 
 * Usage: node scripts/ops/integrations/notifications/test-discord.mjs
 */

import { sendDiscordMessage, sendDiscordEmbed, streamDiscordUpdate } from './discord-webhook.mjs';
import http from 'node:http';

const OPENCLAW_GATEWAY_HOST = process.env.OPENCLAW_GATEWAY_HOST || '127.0.0.1';
const OPENCLAW_GATEWAY_PORT = process.env.OPENCLAW_GATEWAY_PORT || 18789;
const OPENCLAW_GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || null;

/**
 * Send a voice announcement via OpenClaw message tool (Discord TTS)
 */
async function testVoiceAnnouncement(text) {
  if (!OPENCLAW_GATEWAY_TOKEN) {
    console.log('❌ Voice test skipped: OPENCLAW_GATEWAY_TOKEN not set');
    return { sent: false, reason: 'OPENCLAW_GATEWAY_TOKEN not set' };
  }

  try {
    const requestBody = JSON.stringify({
      tool: 'message',
      args: {
        action: 'send',
        message: text,
        channel: 'discord',
        to: '1486262758256410646',
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

    return new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          if (res.statusCode === 200) {
            console.log(`✅ Voice announcement sent: "${text}"`);
            resolve({ sent: true });
          } else {
            console.log(`❌ Voice announcement failed: ${res.statusCode} ${data}`);
            resolve({ sent: false, reason: `HTTP ${res.statusCode}` });
          }
        });
      });

      req.on('error', (err) => {
        console.log(`❌ Voice announcement error: ${err.message}`);
        resolve({ sent: false, reason: err.message });
      });

      req.on('timeout', () => {
        req.destroy();
        console.log(`❌ Voice announcement timeout`);
        resolve({ sent: false, reason: 'timeout' });
      });

      req.write(requestBody);
      req.end();
    });
  } catch (err) {
    console.log(`❌ Voice announcement exception: ${err.message}`);
    return { sent: false, reason: err.message };
  }
}

async function runTests() {
  console.log('🧪 Discord Integration Test');
  console.log('========================================\n');

  // Test 1: Simple text message
  console.log('Test 1: Simple Discord text message...');
  const textResult = await sendDiscordMessage('🧪 Test message from OpenClaw Symphony Bridge');
  console.log(`Result: ${textResult.sent ? '✅ PASS' : '❌ FAIL'} ${textResult.reason || ''}\n`);

  // Test 2: Embedded message
  console.log('Test 2: Discord embedded message...');
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
  console.log(`Result: ${embedResult.sent ? '✅ PASS' : '❌ FAIL'} ${embedResult.reason || ''}\n`);

  // Test 3: Progress update
  console.log('Test 3: Discord progress update...');
  const progressResult = await streamDiscordUpdate(
    'Working on test task... This is a progress update.',
    { emoji: '⏳', timestamp: true }
  );
  console.log(`Result: ${progressResult.sent ? '✅ PASS' : '❌ FAIL'} ${progressResult.reason || ''}\n`);

  // Test 4: Voice announcement
  console.log('Test 4: Voice announcement via OpenClaw TTS...');
  const voiceResult = await testVoiceAnnouncement(
    'This is a test voice announcement from OpenClaw Symphony Bridge.'
  );
  console.log(`Result: ${voiceResult.sent ? '✅ PASS' : '❌ FAIL'} ${voiceResult.reason || ''}\n`);

  // Summary
  console.log('========================================');
  console.log('Test Summary:');
  console.log(`  Text message: ${textResult.sent ? '✅' : '❌'}`);
  console.log(`  Embedded message: ${embedResult.sent ? '✅' : '❌'}`);
  console.log(`  Progress update: ${progressResult.sent ? '✅' : '❌'}`);
  console.log(`  Voice announcement: ${voiceResult.sent ? '✅' : '❌'}`);
  console.log('========================================\n');

  const allPassed = textResult.sent && embedResult.sent && progressResult.sent && voiceResult.sent;
  if (allPassed) {
    console.log('🎉 All tests PASSED!');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests FAILED - check configuration');
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error(`❌ Test error: ${err.message}`);
  process.exit(1);
});
