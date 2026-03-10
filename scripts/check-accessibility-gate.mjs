#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import net from 'node:net';
import { chromium } from '@playwright/test';
import axe from 'axe-core';

const root = process.cwd();
const reportJsonPath = path.join(root, 'reports', 'accessibility-gate.json');
const reportMdPath = path.join(root, 'reports', 'accessibility-gate.md');
const preferredPort = Number.parseInt(process.env.A11Y_PREVIEW_PORT || '4173', 10);
const criticalMax = Number.parseInt(process.env.A11Y_CRITICAL_MAX || '7', 10);
const welcomeModalStorageKey = 'anqr-welcome-seen';
const welcomeModalVersion = '2026.03.10';

function toMarkdown(report) {
  const lines = [
    '# Accessibility Gate Report',
    '',
    `- Generated at: ${report.generatedAt}`,
    `- Target URL: ${report.baseUrl}`,
    `- Flow scans: ${report.summary.totalScans}`,
    `- Critical WCAG violations: ${report.summary.criticalViolations}`,
    `- Critical budget (max): ${report.summary.criticalMax}`,
    `- Status: ${report.summary.status}`,
    '',
    '## Scans',
    '',
  ];

  for (const scan of report.scans) {
    lines.push(`- ${scan.name}: critical=${scan.criticalViolations}`);
  }

  lines.push('', '## Violations', '');
  if (report.violations.length === 0) {
    lines.push('- None');
  } else {
    for (const violation of report.violations) {
      lines.push(`- [${violation.scan}] ${violation.id}: ${violation.help}`);
    }
  }

  return `${lines.join('\n')}\n`;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function canBindPort(port) {
  return await new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.listen(port, '127.0.0.1', () => {
      server.close(() => resolve(true));
    });
  });
}

async function findOpenPort(startPort) {
  for (let port = startPort; port < startPort + 30; port += 1) {
    if (await canBindPort(port)) {
      return port;
    }
  }
  throw new Error(`Could not find open preview port near ${startPort}`);
}

async function waitForServer(url, timeoutMs = 45_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // keep polling until timeout
    }
    await wait(300);
  }
  throw new Error(`Timed out waiting for preview server: ${url}`);
}

function startPreviewServer(port) {
  const child = spawn('npx', ['vite', 'preview', '--host', '127.0.0.1', '--port', String(port), '--strictPort'], {
    cwd: root,
    env: process.env,
    stdio: 'pipe',
  });

  child.stdout?.on('data', (chunk) => process.stderr.write(`[a11y-preview] ${chunk}`));
  child.stderr?.on('data', (chunk) => process.stderr.write(`[a11y-preview] ${chunk}`));
  child.on('exit', (code) => {
    if (code !== 0) {
      process.stderr.write(`[a11y-preview] exited with code ${code}\n`);
    }
  });
  return child;
}

async function waitForIdle(page) {
  await page
    .waitForSelector('[data-rendering-state="idle"]', { timeout: 15_000 })
    .catch(() => undefined);
}

async function openAccordion(page, sectionId) {
  const trigger = page.locator(`[data-testid="accordion-${sectionId}"] button[data-state]`).first();
  if ((await trigger.count()) === 0) return;
  const state = await trigger.getAttribute('data-state');
  if (state !== 'open') {
    await trigger.click();
    await waitForIdle(page);
  }
}

async function setTier(page, tier) {
  const tab = page.locator(`[data-testid="tier-tab-${tier}"]`).first();
  if ((await tab.count()) === 0) return;
  await tab.click();
  await waitForIdle(page);
}

async function runAxeScan(page, scanName) {
  await page.addScriptTag({ content: axe.source });
  const result = await page.evaluate(async () => {
    // eslint-disable-next-line no-undef
    return await axe.run(document, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa'],
      },
    });
  });

  const critical = result.violations.filter((v) => v.impact === 'critical');
  return {
    scan: scanName,
    totalViolations: result.violations.length,
    criticalViolations: critical.length,
    critical,
  };
}

async function main() {
  const previewPort = await findOpenPort(preferredPort);
  const baseUrl = `http://127.0.0.1:${previewPort}`;
  const previewServer = startPreviewServer(previewPort);
  let browser;
  let exitCode = 0;

  try {
    await waitForServer(baseUrl);
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1024 } });
    await context.addInitScript(
      ({ key, value }) => {
        localStorage.setItem(key, value);
      },
      { key: welcomeModalStorageKey, value: welcomeModalVersion }
    );
    const page = await context.newPage();
    const scans = [];

    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await waitForIdle(page);
    scans.push(await runAxeScan(page, 'basic:home'));

    await openAccordion(page, 'payload');
    await openAccordion(page, 'overlay');
    scans.push(await runAxeScan(page, 'basic:payload+overlay'));

    await setTier(page, 'advanced');
    await openAccordion(page, 'qr');
    await openAccordion(page, 'render');
    await openAccordion(page, 'output');
    scans.push(await runAxeScan(page, 'advanced:key-sections'));

    await setTier(page, 'professional');
    await openAccordion(page, 'watermark');
    await openAccordion(page, 'metadata');
    await openAccordion(page, 'share');
    await openAccordion(page, 'safety');
    scans.push(await runAxeScan(page, 'professional:key-sections'));

    const violations = [];
    for (const scan of scans) {
      for (const violation of scan.critical) {
        violations.push({
          scan: scan.scan,
          id: violation.id,
          impact: violation.impact,
          help: violation.help,
          helpUrl: violation.helpUrl,
          nodes: violation.nodes.map((node) => ({
            target: node.target,
            summary: node.failureSummary || '',
          })),
        });
      }
    }

    const report = {
      generatedAt: new Date().toISOString(),
      baseUrl,
      summary: {
        totalScans: scans.length,
        criticalViolations: violations.length,
        criticalMax,
        status: violations.length <= criticalMax ? 'PASS' : 'FAIL',
      },
      scans: scans.map((scan) => ({
        name: scan.scan,
        totalViolations: scan.totalViolations,
        criticalViolations: scan.criticalViolations,
      })),
      violations,
    };

    fs.mkdirSync(path.dirname(reportJsonPath), { recursive: true });
    fs.writeFileSync(reportJsonPath, `${JSON.stringify(report, null, 2)}\n`);
    fs.writeFileSync(reportMdPath, toMarkdown(report));

    console.log(
      '[a11y-gate] critical WCAG violations:',
      report.summary.criticalViolations,
      `max=${report.summary.criticalMax}`,
      `(${report.summary.status})`
    );

    if (violations.length > criticalMax) {
      exitCode = 1;
    }
  } finally {
    if (browser) {
      await browser.close();
    }
    if (previewServer && !previewServer.killed) {
      previewServer.kill('SIGTERM');
    }
  }

  return exitCode;
}

main()
  .then((code) => {
    process.exit(code);
  })
  .catch((error) => {
    console.error('[a11y-gate] failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
