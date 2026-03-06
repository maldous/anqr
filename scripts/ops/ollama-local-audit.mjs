#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gitSummary } from './lib/git-summary.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const REPORTS_DIR = path.join(PROJECT_ROOT, 'reports', 'ollama-local');

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5-coder:3b';
const FETCH_TIMEOUT_MS = 120_000;

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function generate(prompt) {
  const res = await fetch(`${OLLAMA_HOST}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
      options: {
        num_ctx: 1024,
        num_predict: 200,
        temperature: 0.2,
        num_thread: 1,
        num_gpu: 99,
      },
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error || `${res.status} ${res.statusText}`);
  }
  return String(data?.response || '').trim();
}

async function main() {
  ensureDir(REPORTS_DIR);
  const stamp = new Date().toISOString().replace(/[:]/g, '-');
  const outPath = path.join(REPORTS_DIR, `${stamp}.md`);
  const latestPath = path.join(REPORTS_DIR, 'latest.md');

  const { branch, head, status } = gitSummary(PROJECT_ROOT);
  const prompt = [
    'You are an ANQR engineering auditor.',
    'Return only a prioritized checklist with measurable acceptance criteria.',
    'Constraint: zero additional costs; prefer local/free improvements.',
    `Repo status: branch=${branch}, head=${head}, workspace=${status}.`,
    'Cover reliability, QA, release safety, security hygiene, monetization readiness, throughput.',
  ].join(' ');

  const content = await generate(prompt);
  const body = `# Ollama Local Audit\n\n- model: ${OLLAMA_MODEL}\n- host: ${OLLAMA_HOST}\n- generatedAt: ${new Date().toISOString()}\n\n${content}\n`;
  fs.writeFileSync(outPath, body);
  fs.writeFileSync(latestPath, body);
  console.log(`wrote ${path.relative(PROJECT_ROOT, outPath)}`);
}

main().catch((err) => {
  ensureDir(REPORTS_DIR);
  const stamp = new Date().toISOString().replace(/[:]/g, '-');
  const body = `# Ollama Local Audit\n\nSKIP/ERROR: ${err.message}\n`;
  fs.writeFileSync(path.join(REPORTS_DIR, `${stamp}.md`), body);
  fs.writeFileSync(path.join(REPORTS_DIR, 'latest.md'), body);
  console.error(err.message);
  process.exit(0);
});
