#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const REPORTS_DIR = path.join(PROJECT_ROOT, 'reports', 'groq-free');

const GROQ_TOKEN = process.env.GROQ_TOKEN || process.env.GROQ_API_KEY || '';

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

async function callGroq(prompt) {
  const model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_TOKEN}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
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

  const data = await res.json();
  if (!res.ok) {
    const msg = data?.error?.message || `${res.status} ${res.statusText}`;
    throw new Error(`Groq API error: ${msg}`);
  }

  return data?.choices?.[0]?.message?.content?.trim() || '';
}

async function main() {
  ensureDir(REPORTS_DIR);

  const stamp = new Date().toISOString().replace(/[:]/g, '-');
  const outPath = path.join(REPORTS_DIR, `${stamp}.md`);
  const latestPath = path.join(REPORTS_DIR, 'latest.md');

  if (!GROQ_TOKEN) {
    const msg = '# Groq Free Audit\n\nSKIP: GROQ_TOKEN/GROQ_API_KEY not set.\n';
    fs.writeFileSync(outPath, msg);
    fs.writeFileSync(latestPath, msg);
    console.log('SKIP: missing GROQ token');
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

  const content = await callGroq(prompt);
  const body = `# Groq Free Audit\n\n- model: ${process.env.GROQ_MODEL || 'llama-3.1-8b-instant'}\n- generatedAt: ${new Date().toISOString()}\n\n${content}\n`;

  fs.writeFileSync(outPath, body);
  fs.writeFileSync(latestPath, body);
  console.log(`wrote ${path.relative(PROJECT_ROOT, outPath)}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
