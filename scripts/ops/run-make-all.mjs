#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const REPORT_DIR = path.join(PROJECT_ROOT, 'reports', 'pipeline', 'make-all');
const CONTRACT_ONLY = process.argv.includes('--contract-only');
const ALLOW_PAID_ACTIONS = process.env.ALLOW_PAID_ACTIONS === '1';

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function runCommand(cmd, args, timeoutMs = 0) {
  const startedAt = Date.now();
  const proc = spawnSync(cmd, args, {
    cwd: PROJECT_ROOT,
    encoding: 'utf-8',
    env: process.env,
    timeout: timeoutMs || undefined,
    maxBuffer: 100 * 1024 * 1024,
  });
  const durationMs = Date.now() - startedAt;

  if (proc.stdout) process.stdout.write(proc.stdout);
  if (proc.stderr) process.stderr.write(proc.stderr);

  return {
    ok: proc.status === 0,
    durationMs,
    exitCode: proc.status ?? -1,
    signal: proc.signal || '',
    stdout: proc.stdout || '',
    stderr: proc.stderr || '',
    command: [cmd, ...args].join(' '),
  };
}

function writeStageLog(filePath, stage, run) {
  const lines = [];
  lines.push(`# Stage ${stage.index}/16: ${stage.id}`);
  lines.push(`title: ${stage.title}`);
  lines.push(`command: ${run.command}`);
  lines.push(`status: ${run.ok ? 'PASS' : 'FAIL'}`);
  lines.push(`exitCode: ${run.exitCode}`);
  lines.push(`signal: ${run.signal}`);
  lines.push(`durationMs: ${run.durationMs}`);
  lines.push('');
  lines.push('--- stdout ---');
  lines.push(run.stdout);
  lines.push('');
  lines.push('--- stderr ---');
  lines.push(run.stderr);
  fs.writeFileSync(filePath, lines.join('\n'));
}

function humanBlockerDeploy() {
  return {
    reason: 'deploy/indexnow require explicit human approval and ALLOW_PAID_ACTIONS=1',
    manualSteps: [
      'Create a [HUMAN] issue in Pending for release approval.',
      'Confirm release window, budget, and rollback owner.',
      'Run `ALLOW_PAID_ACTIONS=1 make deploy` and `ALLOW_PAID_ACTIONS=1 make indexnow`.',
    ],
    evidence: [
      'Netlify production deploy URL + deploy ID',
      'reports/indexnow-submission.json with successful submission entries',
    ],
  };
}

function stageDefinitions() {
  return [
    {
      index: 1,
      id: 'install',
      title: 'Install dependencies + hooks + Playwright Chromium',
      determinism: 'Installs from lockfile and deterministic tooling targets.',
      skip: 'Never skipped.',
      fail: 'Fail if `make install` or Playwright browser install exits non-zero.',
      mode: 'required',
      run() {
        const install = runCommand('make', ['install']);
        if (!install.ok) return install;
        return runCommand('npx', ['playwright', 'install', 'chromium']);
      },
    },
    {
      index: 2,
      id: 'i18n-pull',
      title: 'Pull community translations',
      determinism: 'Syncs translation subtrees into canonical txt directories.',
      skip: 'Skipped if remote inaccessible.',
      fail: 'Never fails pipeline; non-zero converts to SKIP.',
      mode: 'optional',
      run: () => runCommand('make', ['i18n:pull']),
    },
    {
      index: 3,
      id: 'i18n-xlate',
      title: 'Auto-translate missing strings',
      determinism: 'Runs fixed translation pipeline over canonical txt inventory.',
      skip: 'Skipped if translation service unreachable.',
      fail: 'Never fails pipeline; non-zero converts to SKIP.',
      mode: 'optional',
      run: () => runCommand('make', ['i18n:xlate']),
    },
    {
      index: 4,
      id: 'i18n-fill',
      title: 'Regenerate i18n outputs',
      determinism: 'Deterministically regenerates TS/JSON outputs from txt sources.',
      skip: 'Never skipped.',
      fail: 'Fail if generation exits non-zero.',
      mode: 'required',
      run: () => runCommand('make', ['i18n:fill']),
    },
    {
      index: 5,
      id: 'assets',
      title: 'Generate icons and sitemap',
      determinism: 'Regenerates static assets from source templates/scripts.',
      skip: 'Android icon step skipped when `android/` directory is absent.',
      fail: 'Fail if required icon/sitemap generation exits non-zero.',
      mode: 'required',
      run() {
        const icons = runCommand('make', ['icons']);
        if (!icons.ok) return icons;

        if (fs.existsSync(path.join(PROJECT_ROOT, 'android'))) {
          const androidIcons = runCommand('make', ['icons:android']);
          if (!androidIcons.ok) return androidIcons;
        } else {
          console.log('SKIP: android icons (android directory not present)');
        }

        return runCommand('make', ['sitemap']);
      },
    },
    {
      index: 6,
      id: 'build',
      title: 'Build production bundle',
      determinism: 'Build command and bundle budgets use fixed repository configuration.',
      skip: 'Never skipped.',
      fail: 'Fail if `make build` exits non-zero.',
      mode: 'required',
      run: () => runCommand('make', ['build']),
    },
    {
      index: 7,
      id: 'test',
      title: 'Run full quality gates + unit + E2E',
      determinism: 'Runs deterministic quality/test command set in Makefile `test` target.',
      skip: 'Never skipped.',
      fail: 'Fail if any required quality or test command exits non-zero.',
      mode: 'required',
      run: () => runCommand('make', ['test']),
    },
    {
      index: 8,
      id: 'gallery-local',
      title: 'Render local gallery permutations',
      determinism: 'Uses deterministic sharding/config variables and fixed scenario inventory.',
      skip: 'Never skipped.',
      fail: 'Fail if gallery generation exits non-zero.',
      mode: 'required',
      run: () => runCommand('make', ['gallery:local']),
    },
    {
      index: 9,
      id: 'gallery-publish',
      title: 'Publish curated gallery from local artifacts',
      determinism: 'Produces curated showcase from local artifact set.',
      skip: 'Never skipped.',
      fail: 'Fail if publish generation exits non-zero.',
      mode: 'required',
      run: () => runCommand('make', ['gallery:publish', 'GALLERY_PUBLISH_SOURCE=local']),
    },
    {
      index: 10,
      id: 'reports',
      title: 'Generate reports and coverage gap analysis',
      determinism: 'Uses deterministic report scripts and coverage inputs in repository.',
      skip: 'Unit coverage strict threshold failure is SKIP-only; gap report still runs.',
      fail: 'Fail if payload matrix, i18n report, or coverage gap command exits non-zero.',
      mode: 'required',
      run() {
        const payload = runCommand('make', ['report:payload:matrix']);
        if (!payload.ok) return payload;

        const i18n = runCommand('make', ['report:i18n:txt']);
        if (!i18n.ok) return i18n;

        const coverage = runCommand('make', ['test:unit:coverage']);
        if (!coverage.ok) {
          console.log(
            'SKIP: coverage strict threshold not met; continuing to deterministic gap report'
          );
        }

        return runCommand('make', ['test:coverage:gap']);
      },
    },
    {
      index: 11,
      id: 'sonar',
      title: 'Run SonarQube analysis',
      determinism: 'Runs against deterministic local source + sonar config.',
      skip: 'Skipped if SonarQube service unavailable.',
      fail: 'Never fails pipeline; non-zero converts to SKIP.',
      mode: 'optional',
      run: () => runCommand('make', ['sonar']),
    },
    {
      index: 12,
      id: 'deploy',
      title: 'Deploy web and submit IndexNow',
      determinism: 'Deploy command path and IndexNow submission scripts are fixed.',
      skip: 'Skipped with HUMAN BLOCKER metadata when `ALLOW_PAID_ACTIONS!=1`.',
      fail: 'Fail if deploy exits non-zero after approval. IndexNow non-zero converts to SKIP.',
      mode: 'required',
      run() {
        if (!ALLOW_PAID_ACTIONS) {
          return {
            ok: true,
            skipped: true,
            reason: humanBlockerDeploy().reason,
            humanBlocker: humanBlockerDeploy(),
            durationMs: 0,
            exitCode: 0,
            signal: '',
            stdout: '',
            stderr: '',
            command: 'make deploy && make indexnow',
          };
        }
        const deploy = runCommand('make', ['deploy']);
        if (!deploy.ok) return deploy;

        const indexNow = runCommand('make', ['indexnow']);
        if (!indexNow.ok) {
          return {
            ...indexNow,
            ok: true,
            skipped: true,
            reason: 'IndexNow submission failed; deploy already completed',
          };
        }
        return deploy;
      },
    },
    {
      index: 13,
      id: 'android',
      title: 'Android release build and Play Store upload',
      determinism: 'Uses deterministic Android build pipeline and version bump logic.',
      skip: 'Skipped if Android prereqs unavailable; upload skipped when key file absent.',
      fail: 'Fail if approved Android build/release commands exit non-zero.',
      mode: 'optional',
      run() {
        const androidDir = fs.existsSync(path.join(PROJECT_ROOT, 'android'));
        const javaCheck = spawnSync('bash', ['-lc', 'command -v java >/dev/null 2>&1'], {
          cwd: PROJECT_ROOT,
        });
        const hasJava = javaCheck.status === 0;
        const hasAndroidHome = Boolean(process.env.ANDROID_HOME);
        if (!androidDir || !hasJava || !hasAndroidHome) {
          return {
            ok: true,
            skipped: true,
            reason: 'android prereqs missing (android dir/java/ANDROID_HOME)',
            durationMs: 0,
            exitCode: 0,
            signal: '',
            stdout: '',
            stderr: '',
            command: 'make android:bump && make android:release',
          };
        }

        const bump = runCommand('make', ['android:bump']);
        if (!bump.ok) return bump;
        const release = runCommand('make', ['android:release']);
        if (!release.ok) return release;

        const keyPath = path.join(PROJECT_ROOT, 'play-store-key.json');
        if (!fs.existsSync(keyPath)) {
          return {
            ...release,
            ok: true,
            skipped: true,
            reason: 'play-store-key.json not found; upload skipped',
          };
        }

        const upload = runCommand('python3', ['scripts/upload-to-play-store.py']);
        if (!upload.ok) {
          return {
            ...upload,
            ok: true,
            skipped: true,
            reason: 'Play Store upload failed; build artifacts remain available',
          };
        }
        return upload;
      },
    },
    {
      index: 14,
      id: 'services',
      title: 'Validate third-party services and Sentry regression',
      determinism: 'Runs deterministic validators with fixed reports output paths.',
      skip: 'Each validator can skip independently on missing credentials/network.',
      fail: 'Never fails pipeline; non-zero converts to SKIP.',
      mode: 'optional',
      run() {
        const validate = runCommand('make', ['validate:services']);
        const sentry = runCommand('make', ['check:sentry']);
        if (!validate.ok || !sentry.ok) {
          return {
            ok: true,
            skipped: true,
            reason: 'one or more service validators failed (see reports)',
            durationMs: validate.durationMs + sentry.durationMs,
            exitCode: 0,
            signal: '',
            stdout: `${validate.stdout}\n${sentry.stdout}`.trim(),
            stderr: `${validate.stderr}\n${sentry.stderr}`.trim(),
            command: 'make validate:services && make check:sentry',
          };
        }
        return validate;
      },
    },
    {
      index: 15,
      id: 'i18n-push',
      title: 'Push translations to public i18n repo',
      determinism: 'Pushes deterministic subtree splits from canonical txt directories.',
      skip: 'Skipped if remote push unavailable.',
      fail: 'Never fails pipeline; non-zero converts to SKIP.',
      mode: 'optional',
      run: () => runCommand('make', ['i18n:push']),
    },
    {
      index: 16,
      id: 'summary',
      title: 'Write final pipeline summary',
      determinism: 'Deterministic status summary generated from ordered stage results.',
      skip: 'Never skipped.',
      fail: 'Fails only when report write fails.',
      mode: 'required',
      run() {
        return {
          ok: true,
          durationMs: 0,
          exitCode: 0,
          signal: '',
          stdout: '',
          stderr: '',
          command: 'internal summary stage',
        };
      },
    },
  ];
}

function stageContractToMarkdown(stages) {
  const lines = [];
  lines.push('# `make all` Stage Contract');
  lines.push('');
  lines.push('| # | Stage | Determinism | Skip Contract | Failure Contract |');
  lines.push('| --- | --- | --- | --- | --- |');
  for (const stage of stages) {
    lines.push(
      `| ${stage.index} | ${stage.id} | ${stage.determinism} | ${stage.skip} | ${stage.fail} |`
    );
  }
  lines.push('');
  return lines.join('\n');
}

function main() {
  ensureDir(REPORT_DIR);
  const startedAt = new Date().toISOString();
  const stamp = startedAt.replace(/[:]/g, '-');
  const runDir = path.join(REPORT_DIR, stamp);
  ensureDir(runDir);

  const stages = stageDefinitions();
  const contractMarkdown = stageContractToMarkdown(stages);
  fs.writeFileSync(path.join(runDir, 'contract.md'), contractMarkdown);
  fs.writeFileSync(path.join(REPORT_DIR, 'contract.md'), contractMarkdown);

  if (CONTRACT_ONLY) {
    console.log(contractMarkdown);
    return;
  }

  console.log('');
  console.log('============================================');
  console.log('ANQR — Full Production Pipeline');
  console.log('============================================');
  console.log('');

  const results = [];
  let failed = false;

  for (const stage of stages) {
    if (stage.id === 'summary') break;

    console.log(`[${stage.index}/16] ${stage.title}...`);
    const run = stage.run();
    const logPath = path.join(runDir, `${String(stage.index).padStart(2, '0')}-${stage.id}.log`);
    writeStageLog(logPath, stage, run);

    const result = {
      index: stage.index,
      id: stage.id,
      title: stage.title,
      mode: stage.mode,
      determinism: stage.determinism,
      skipContract: stage.skip,
      failureContract: stage.fail,
      status: run.ok ? (run.skipped ? 'SKIP' : 'PASS') : 'FAIL',
      reason: run.reason || '',
      durationMs: run.durationMs,
      exitCode: run.exitCode,
      command: run.command,
      logPath: path.relative(PROJECT_ROOT, logPath),
      humanBlocker: run.humanBlocker || null,
    };
    results.push(result);

    if (result.status === 'PASS') {
      console.log(`PASS: ${stage.id}`);
    } else if (result.status === 'SKIP') {
      console.log(`SKIP: ${stage.id} (${result.reason || 'see contract/log'})`);
    } else {
      console.error(`FAIL: ${stage.id}`);
      failed = true;
      break;
    }
    console.log('');
  }

  const finishedAt = new Date().toISOString();
  const summary = {
    startedAt,
    finishedAt,
    status: failed ? 'FAIL' : 'PASS',
    stages: results,
  };

  fs.writeFileSync(path.join(runDir, 'summary.json'), JSON.stringify(summary, null, 2) + '\n');
  fs.writeFileSync(path.join(REPORT_DIR, 'latest.json'), JSON.stringify(summary, null, 2) + '\n');

  if (!failed) {
    console.log('============================================');
    console.log('ANQR — Production pipeline complete!');
    console.log('============================================');
    console.log('');
    console.log('Post-deploy manual checklist: see docs/operations/launch-checklist.md');
    console.log(`Pipeline report: ${path.relative(PROJECT_ROOT, path.join(REPORT_DIR, 'latest.json'))}`);
  }

  process.exit(failed ? 1 : 0);
}

try {
  main();
} catch (err) {
  console.error(err.stack || err.message);
  process.exit(1);
}
