#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const REPORTS_DIR = path.join(PROJECT_ROOT, 'reports', 'gemini-free');

const GEMINI_TOKEN = process.env.GEMINI_TOKEN || process.env.GOOGLE_GEMINI_API_KEY || '';

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function gitSummary() {
  let branch = 'unknown';
  let head = 'unknown';
  let status = 'clean';
  try {
    branch = execSync('git branch --show-current', { cwd: PROJECT_ROOT, encoding: 'utf8' }).trim();
    head = execSync('git rev-parse --short HEAD', { cwd: PROJECT_ROOT, encoding: 'utf8' }).trim();
    const porcelain = execSync('git status --short', {
      cwd: PROJECT_ROOT,
      encoding: 'utf8',
    }).trim();
    status = porcelain ? `dirty (${porcelain.split('\n').length} files changed)` : 'clean';
  } catch {
    // noop
  }
  return { branch, head, status };
}

async function callGemini(prompt) {
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(GEMINI_TOKEN)}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 900,
      },
      systemInstruction: {
        parts: [
          {
            text: 'You are a strict engineering auditor. Output only a short prioritized checklist with measurable acceptance criteria. Focus on free/no-cost improvements.',
          },
        ],
      },
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    const msg = data?.error?.message || `${res.status} ${res.statusText}`;
    throw new Error(`Gemini API error: ${msg}`);
  }

  const text = data?.candidates?.[0]?.content?.parts
    ?.map((p) => p.text || '')
    .join('\n')
    .trim();
  return text || '';
}

async function main() {
  ensureDir(REPORTS_DIR);

  const stamp = new Date().toISOString().replace(/[:]/g, '-');
  const outPath = path.join(REPORTS_DIR, `${stamp}.md`);
  const latestPath = path.join(REPORTS_DIR, 'latest.md');

  if (!GEMINI_TOKEN) {
    const msg = '# Gemini Free Audit\n\nSKIP: GEMINI_TOKEN/GOOGLE_GEMINI_API_KEY not set.\n';
    fs.writeFileSync(outPath, msg);
    fs.writeFileSync(latestPath, msg);
    console.log('SKIP: missing GEMINI token');
    return;
  }

  const { branch, head, status } = gitSummary();
  const prompt = [
    'Project: ANQR QR app/web/API.',
    'Constraint: no additional costs; prefer free-tier or local-only improvements.',
    `Repo status: branch=${branch}, head=${head}, workspace=${status}.`,
    'Provide top 8 improvement actions across: reliability, QA, release safety, security hygiene, monetization readiness, and automation throughput.',
    'Each item must have a concrete acceptance criterion.',
  ].join(' ');

  const content = await callGemini(prompt);
  const body = `# Gemini Free Audit\n\n- model: ${process.env.GEMINI_MODEL || 'gemini-2.0-flash'}\n- generatedAt: ${new Date().toISOString()}\n\n${content}\n`;

  fs.writeFileSync(outPath, body);
  fs.writeFileSync(latestPath, body);
  console.log(`wrote ${path.relative(PROJECT_ROOT, outPath)}`);
}

main().catch((err) => {
  ensureDir(REPORTS_DIR);
  const stamp = new Date().toISOString().replace(/[:]/g, '-');
  const quotaLike = /quota|rate[- ]?limit|billing|exceeded/i.test(err.message || '');
  const body = quotaLike
    ? `# Gemini Free Audit\n\nSKIP: free-tier unavailable right now (${err.message}).\n`
    : `# Gemini Free Audit\n\nERROR: ${err.message}\n`;
  fs.writeFileSync(path.join(REPORTS_DIR, `${stamp}.md`), body);
  fs.writeFileSync(path.join(REPORTS_DIR, 'latest.md'), body);
  if (quotaLike) {
    console.log('SKIP: Gemini free-tier quota unavailable');
    process.exit(0);
  }
  console.error(err.message);
  process.exit(1);
});
