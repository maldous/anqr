#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const REPORT_DIR = path.join(ROOT, 'reports', 'parity');
const REPORT_JSON = path.join(REPORT_DIR, 'share-param-parity.json');
const REPORT_MD = path.join(REPORT_DIR, 'share-param-parity.md');

const CLIENT_PATH = path.join(ROOT, 'src', 'modules', 'share-links', 'url-params.ts');
const SERVER_PATH = path.join(ROOT, 'netlify', 'functions', 'qr.ts');

const ALLOW_CLIENT_ONLY = [];
const ALLOW_SERVER_ONLY = [
  '_fullRender',
  '_strictOverlay',
  'animSeed2',
  'bounce2',
  'colorCycle2',
  'easing2',
  'reverse2',
];

function extractKeys(text) {
  const keys = new Set();
  const regex = /params\.(?:get|has)\(\s*'([^']+)'\s*\)/g;
  let match = null;
  while ((match = regex.exec(text)) !== null) {
    keys.add(match[1]);
  }
  return keys;
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function formatMismatchNotes(clientOnly, serverOnly) {
  const notes = [];

  if (clientOnly.length > 0) {
    notes.push(
      ...clientOnly.map(
        (key) =>
          `Client reads "${key}" but server does not. Root cause: netlify/functions/qr.ts is missing this param key.`
      )
    );
  }

  if (serverOnly.length > 0) {
    notes.push(
      ...serverOnly.map(
        (key) =>
          `Server reads "${key}" but client does not. Root cause: src/modules/share-links/url-params.ts is missing this param key.`
      )
    );
  }

  return notes;
}

function main() {
  const startedAt = new Date().toISOString();

  const clientText = fs.readFileSync(CLIENT_PATH, 'utf8');
  const serverText = fs.readFileSync(SERVER_PATH, 'utf8');

  const clientKeys = extractKeys(clientText);
  const serverKeys = extractKeys(serverText);

  const rawClientOnly = [...clientKeys].filter((k) => !serverKeys.has(k)).sort();
  const rawServerOnly = [...serverKeys].filter((k) => !clientKeys.has(k)).sort();

  const clientOnly = rawClientOnly.filter((k) => !ALLOW_CLIENT_ONLY.includes(k));
  const serverOnly = rawServerOnly.filter((k) => !ALLOW_SERVER_ONLY.includes(k));
  const mismatchNotes = formatMismatchNotes(clientOnly, serverOnly);

  const verdict = clientOnly.length === 0 && serverOnly.length === 0 ? 'PASS' : 'FAIL';

  ensureDir(REPORT_DIR);

  const report = {
    check: 'share-param-parity',
    generatedAt: startedAt,
    commands: ['node scripts/check-share-param-parity.mjs'],
    evidenceArtifactPaths: [
      path.relative(ROOT, REPORT_JSON),
      path.relative(ROOT, REPORT_MD),
      path.relative(ROOT, CLIENT_PATH),
      path.relative(ROOT, SERVER_PATH),
    ],
    mismatch: {
      clientOnly,
      serverOnly,
      allowClientOnly: ALLOW_CLIENT_ONLY,
      allowServerOnly: ALLOW_SERVER_ONLY,
      rawClientOnly,
      rawServerOnly,
    },
    mismatchRootCauseNotes: mismatchNotes.length > 0 ? mismatchNotes : ['No unexpected mismatches detected.'],
    verdict,
  };

  fs.writeFileSync(REPORT_JSON, JSON.stringify(report, null, 2) + '\n');

  const lines = [
    '# Share Param Parity Report',
    '',
    `- Generated: ${report.generatedAt}`,
    `- Verdict: ${report.verdict}`,
    `- Commands run: \`${report.commands.join(' && ')}\``,
    '',
    '## Evidence artifact paths',
    ...report.evidenceArtifactPaths.map((item) => `- \`${item}\``),
    '',
    '## Mismatch / root-cause notes',
    ...report.mismatchRootCauseNotes.map((item) => `- ${item}`),
    '',
    `## Unexpected client-only keys (${clientOnly.length})`,
    ...clientOnly.map((k) => `- \`${k}\``),
    '',
    `## Unexpected server-only keys (${serverOnly.length})`,
    ...serverOnly.map((k) => `- \`${k}\``),
    '',
  ];

  fs.writeFileSync(REPORT_MD, lines.join('\n'));

  console.log(`[parity] verdict=${verdict}`);
  console.log(`[parity] report json: ${path.relative(ROOT, REPORT_JSON)}`);
  console.log(`[parity] report md:   ${path.relative(ROOT, REPORT_MD)}`);

  process.exit(verdict === 'PASS' ? 0 : 1);
}

main();
