#!/usr/bin/env node

// =============================================================================
// ANQR IndexNow URL Submission
// =============================================================================
// Submits all canonical site URLs to search engines via the IndexNow protocol.
// Submitting to api.indexnow.org automatically notifies all participating
// search engines (Bing, Yandex, Naver, DuckDuckGo, Seznam.cz, etc.).
//
// Usage:
//   ALLOW_PAID_ACTIONS=1 PAID_ACTION_APPROVED_BY="linear:ANQ-41" node scripts/submit-indexnow.mjs
//
// Prerequisites:
//   - Key verification file must be deployed at https://anqr.link/{KEY}.txt
//   - Site must be live (run after deploy)
//
// Exit codes:
//   0 — submission accepted (HTTP 200 or 202)
//   1 — submission failed
// =============================================================================

import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');

// ── Constants ────────────────────────────────────────────────────────────────

const INDEXNOW_KEY = 'da39713d0cb0b7ec43d21f259b214605';
const BASE_URL = 'https://anqr.link';
const HOST = 'anqr.link';
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
const KEY_LOCATION = `${BASE_URL}/${INDEXNOW_KEY}.txt`;
const REQUEST_TIMEOUT_MS = 15_000;

// All canonical pages (must match scripts/generate-sitemap.mjs)
const PAGES = ['', 'gallery', 'learn', 'examples', 'guide', 'about', 'contact', 'privacy', 'terms'];

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildUrlList() {
  return PAGES.map((p) => (p ? `${BASE_URL}/${p}` : `${BASE_URL}/`));
}

function requirePaidActionApproval(actionName) {
  const allowPaidActions = process.env.ALLOW_PAID_ACTIONS;
  const approvedBy = (process.env.PAID_ACTION_APPROVED_BY || '').trim();
  const approvalContext = (process.env.PAID_ACTION_CONTEXT || '').trim();

  if (allowPaidActions !== '1' || !approvedBy) {
    console.error(`ERROR: ${actionName} blocked by default.`);
    console.error(
      "Set ALLOW_PAID_ACTIONS=1 and PAID_ACTION_APPROVED_BY='<human approval ref>' to continue."
    );
    console.error(
      "Optional: set PAID_ACTION_CONTEXT='<issue/comment URL>' for audit traceability."
    );
    process.exit(1);
  }

  console.log(
    `[governance] approved by ${approvedBy}${approvalContext ? ` (${approvalContext})` : ''}`
  );
}

function httpsPost(url, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const parsed = new URL(url);
    const options = {
      hostname: parsed.hostname,
      port: 443,
      path: parsed.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(data),
        'User-Agent': 'ANQR-IndexNow/1.0',
      },
      timeout: REQUEST_TIMEOUT_MS,
    };

    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: Buffer.concat(chunks).toString('utf-8'),
        });
      });
    });
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request timeout after ${REQUEST_TIMEOUT_MS}ms`));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  requirePaidActionApproval('IndexNow submission');
  const startTime = Date.now();

  console.log('');
  console.log('============================================');
  console.log('ANQR IndexNow URL Submission');
  console.log('============================================');
  console.log('');

  const urlList = buildUrlList();

  console.log(`Endpoint:     ${INDEXNOW_ENDPOINT}`);
  console.log(`Host:         ${HOST}`);
  console.log(`Key:          ${INDEXNOW_KEY.slice(0, 8)}...`);
  console.log(`Key location: ${KEY_LOCATION}`);
  console.log(`URLs (${urlList.length}):`);
  for (const url of urlList) {
    console.log(`  ${url}`);
  }
  console.log('');

  const payload = {
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList,
  };

  let result;
  try {
    result = await httpsPost(INDEXNOW_ENDPOINT, payload);
  } catch (error) {
    const report = {
      title: 'ANQR IndexNow Submission',
      generated: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      status: 'ERROR',
      error: error.message,
      urlCount: urlList.length,
      endpoint: INDEXNOW_ENDPOINT,
    };
    writeReport(report);
    console.log(`✗ IndexNow submission failed: ${error.message}`);
    process.exit(1);
  }

  const accepted = result.statusCode === 200 || result.statusCode === 202;

  const report = {
    title: 'ANQR IndexNow Submission',
    generated: new Date().toISOString(),
    durationMs: Date.now() - startTime,
    status: accepted ? 'OK' : 'FAILED',
    httpStatus: result.statusCode,
    responseBody: result.body || '',
    urlCount: urlList.length,
    urls: urlList,
    endpoint: INDEXNOW_ENDPOINT,
    host: HOST,
  };
  writeReport(report);

  if (accepted) {
    console.log(`✅ IndexNow submission accepted (HTTP ${result.statusCode})`);
    console.log(`   ${urlList.length} URLs submitted to all participating search engines`);
  } else {
    console.log(`✗ IndexNow submission failed (HTTP ${result.statusCode})`);
    if (result.body) {
      console.log(`  Response: ${result.body.slice(0, 500)}`);
    }
  }

  console.log('');
  process.exit(accepted ? 0 : 1);
}

function writeReport(report) {
  const reportsDir = path.join(PROJECT_ROOT, 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  const reportPath = path.join(reportsDir, 'indexnow-submission.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
  console.log(`Report: ${path.relative(PROJECT_ROOT, reportPath)}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
