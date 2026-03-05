#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const REPORTS_DIR = path.join(PROJECT_ROOT, 'reports', 'hugging-free');

const HUGGING_TOKEN = process.env.HUGGING_TOKEN || process.env.HUGGING_FACE_READ_TOKEN || '';
const MODEL = process.env.HUGGING_MODEL || 'meta-llama/Llama-3.1-8B-Instruct';

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
    const porcelain = execSync('git status --short', { cwd: PROJECT_ROOT, encoding: 'utf8' }).trim();
    status = porcelain ? `dirty (${porcelain.split('\n').length} files changed)` : 'clean';
  } catch {
    // noop
  }
  return { branch, head, status };
}

async function callHugging(prompt) {
  const res = await fetch('https://router.huggingface.co/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${HUGGING_TOKEN}`,
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.2,
      max_tokens: 420,
      messages: [
        {
          role: 'system',
          content:
            'You are a strict engineering auditor. Output only a short prioritized checklist with measurable acceptance criteria. Focus on free/no-cost improvements.',
        },
        { role: 'user', content: prompt },
      ],
    }),
  });

  const raw = await res.text();
  let data = null;
  try {
    data = JSON.parse(raw);
  } catch {
    // keep raw for error
  }

  if (!res.ok) {
    const msg = data?.error || `${res.status} ${res.statusText}`;
    throw new Error(`Hugging Face API error: ${msg}`);
  }

  if (typeof data?.choices?.[0]?.message?.content === 'string') {
    return data.choices[0].message.content.trim();
  }

  throw new Error('Hugging Face API returned unexpected response format');
}

async function main() {
  ensureDir(REPORTS_DIR);

  const stamp = new Date().toISOString().replace(/[:]/g, '-');
  const outPath = path.join(REPORTS_DIR, `${stamp}.md`);
  const latestPath = path.join(REPORTS_DIR, 'latest.md');

  if (!HUGGING_TOKEN) {
    const msg = '# Hugging Free Audit\n\nSKIP: HUGGING_TOKEN/HUGGING_FACE_READ_TOKEN not set.\n';
    fs.writeFileSync(outPath, msg);
    fs.writeFileSync(latestPath, msg);
    console.log('SKIP: missing Hugging token');
    return;
  }

  const { branch, head, status } = gitSummary();
  const prompt = [
    'Give a concise prioritized checklist with measurable acceptance criteria.',
    'Context: ANQR QR app/web/API. No additional costs allowed; free-tier/local-only improvements.',
    `Repo status: branch=${branch}, head=${head}, workspace=${status}.`,
    'Cover reliability, QA, release safety, security hygiene, monetization readiness, automation throughput.',
  ].join(' ');

  const content = await callHugging(prompt);
  const body = `# Hugging Free Audit\n\n- model: ${MODEL}\n- generatedAt: ${new Date().toISOString()}\n\n${content}\n`;

  fs.writeFileSync(outPath, body);
  fs.writeFileSync(latestPath, body);
  console.log(`wrote ${path.relative(PROJECT_ROOT, outPath)}`);
}

main().catch((err) => {
  ensureDir(REPORTS_DIR);
  const stamp = new Date().toISOString().replace(/[:]/g, '-');
  const quotaLike = /quota|rate[- ]?limit|billing|payment|required|too many requests|exceeded|no longer supported|unsupported/i.test(
    err.message || ''
  );
  const body = quotaLike
    ? `# Hugging Free Audit\n\nSKIP: free-tier unavailable right now (${err.message}).\n`
    : `# Hugging Free Audit\n\nERROR: ${err.message}\n`;
  fs.writeFileSync(path.join(REPORTS_DIR, `${stamp}.md`), body);
  fs.writeFileSync(path.join(REPORTS_DIR, 'latest.md'), body);
  if (quotaLike) {
    console.log('SKIP: Hugging free-tier unavailable');
    process.exit(0);
  }
  console.error(err.message);
  process.exit(1);
});
