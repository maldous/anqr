#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const REPORTS_DIR = path.join(PROJECT_ROOT, 'reports', 'harness');
const HISTORY_LIMIT = 30;

const PROFILE_ARG = process.argv.find((arg) => arg.startsWith('--profile=')) || '';
const PROFILE = PROFILE_ARG.split('=')[1] || 'full';

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function run(cmd, args, timeoutMs = 60_000) {
  const proc = spawnSync(cmd, args, {
    cwd: PROJECT_ROOT,
    encoding: 'utf-8',
    env: { ...process.env, ANQR_LOG_LEVEL: 'error' },
    timeout: timeoutMs,
  });
  return {
    ok: proc.status === 0,
    exitCode: proc.status ?? -1,
    stdout: proc.stdout || '',
    stderr: proc.stderr || '',
    signal: proc.signal || null,
  };
}

function loadHistory() {
  ensureDir(REPORTS_DIR);
  const files = fs
    .readdirSync(REPORTS_DIR)
    .filter((f) => f.endsWith('.json') && f !== 'latest.json')
    .sort()
    .slice(-HISTORY_LIMIT);
  return files
    .map((f) => {
      try {
        return JSON.parse(fs.readFileSync(path.join(REPORTS_DIR, f), 'utf-8'));
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function extractTrends(history, checkId, metricKey) {
  return history
    .map((h) => h.checks?.[checkId]?.metrics?.[metricKey])
    .filter((v) => v !== undefined && v !== null);
}

function detectRegressions(current, previous) {
  if (!previous) return [];
  const regressions = [];
  const thresholds = [
    { check: 'bundle_budget', metric: 'main_entry_kib', direction: 'lower', threshold: 0.03 },
    { check: 'bundle_budget', metric: 'non_i18n_total_kib', direction: 'lower', threshold: 0.03 },
    { check: 'type_coverage', metric: 'pct', direction: 'higher', threshold: 0.005 },
    { check: 'lint', metric: 'error_count', direction: 'lower', threshold: 0 },
    { check: 'duplication', metric: 'clone_count', direction: 'lower', threshold: 0 },
    { check: 'dep_audit', metric: 'critical', direction: 'lower', threshold: 0 },
  ];
  for (const t of thresholds) {
    const cur = current.checks?.[t.check]?.metrics?.[t.metric];
    const prev = previous.checks?.[t.check]?.metrics?.[t.metric];
    if (cur === undefined || prev === undefined) continue;
    const regressed =
      t.direction === 'lower' ? cur > prev + prev * t.threshold : cur < prev - prev * t.threshold;
    if (regressed) {
      const delta = cur - prev;
      const pct = prev !== 0 ? ((delta / prev) * 100).toFixed(1) : 'N/A';
      regressions.push({
        check: t.check,
        metric: t.metric,
        from: prev,
        to: cur,
        delta: `${delta > 0 ? '+' : ''}${pct}%`,
      });
    }
  }
  return regressions;
}

function detectImprovements(current, previous) {
  if (!previous) return [];
  const improvements = [];
  const metrics = [
    { check: 'type_coverage', metric: 'pct', direction: 'higher' },
    { check: 'test_unit', metric: 'pass_count', direction: 'higher' },
    { check: 'dep_audit', metric: 'critical', direction: 'lower' },
    { check: 'dep_outdated', metric: 'major', direction: 'lower' },
  ];
  for (const m of metrics) {
    const cur = current.checks?.[m.check]?.metrics?.[m.metric];
    const prev = previous.checks?.[m.check]?.metrics?.[m.metric];
    if (cur === undefined || prev === undefined || cur === prev) continue;
    const improved = m.direction === 'higher' ? cur > prev : cur < prev;
    if (improved) {
      const delta = cur - prev;
      const pct = prev !== 0 ? ((delta / prev) * 100).toFixed(1) : 'N/A';
      improvements.push({
        check: m.check,
        metric: m.metric,
        from: prev,
        to: cur,
        delta: `${delta > 0 ? '+' : ''}${pct}%`,
      });
    }
  }
  return improvements;
}

// ---------------------------------------------------------------------------
// Check implementations
// ---------------------------------------------------------------------------

function checkTypecheck() {
  const result = run('npx', ['tsc', '--noEmit'], 120_000);
  const errorMatch = result.stderr.match(/(\d+) errors?/);
  const errorCount = errorMatch ? Number(errorMatch[1]) : result.ok ? 0 : -1;
  return {
    status: result.ok ? 'PASS' : 'FAIL',
    metrics: { error_count: errorCount },
    findings: result.ok
      ? []
      : [{ severity: 'critical', message: `TypeScript: ${errorCount} errors` }],
  };
}

function checkLint() {
  const result = run(
    'npx',
    ['oxlint', '--deny-warnings', '--tsconfig', './tsconfig.json', '.'],
    120_000
  );
  const lines = (result.stdout + result.stderr).split('\n');
  const summaryLine = lines.find((l) => /\d+ (error|warning)/.test(l)) || '';
  const errorMatch = summaryLine.match(/(\d+) error/);
  const warnMatch = summaryLine.match(/(\d+) warning/);
  const errorCount = errorMatch ? Number(errorMatch[1]) : 0;
  const warnCount = warnMatch ? Number(warnMatch[1]) : 0;
  return {
    status: result.ok ? 'PASS' : errorCount > 0 ? 'FAIL' : 'WARN',
    metrics: { error_count: errorCount, warning_count: warnCount },
    findings:
      errorCount > 0
        ? [{ severity: 'high', message: `oxlint: ${errorCount} errors, ${warnCount} warnings` }]
        : [],
  };
}

function checkLockfile() {
  const result = run('npx', ['lockfile-lint'], 30_000);
  return {
    status: result.ok ? 'PASS' : 'FAIL',
    metrics: { valid: result.ok ? 1 : 0 },
    findings: result.ok ? [] : [{ severity: 'high', message: 'Lockfile integrity check failed' }],
  };
}

function checkGitStatus() {
  const status = run('git', ['status', '--porcelain']);
  const uncommitted = status.stdout.trim().split('\n').filter(Boolean).length;
  const branchResult = run('git', ['branch', '--list']);
  const branchCount = branchResult.stdout.trim().split('\n').filter(Boolean).length;
  const logResult = run('git', ['log', '-1', '--format=%ci']);
  const lastCommit = logResult.stdout.trim();
  const lastCommitAge = lastCommit
    ? Math.round((Date.now() - new Date(lastCommit).getTime()) / 3600000)
    : -1;
  return {
    status: uncommitted > 5 ? 'WARN' : 'PASS',
    metrics: {
      uncommitted_files: uncommitted,
      branch_count: branchCount,
      last_commit_hours_ago: lastCommitAge,
    },
    findings:
      uncommitted > 5 ? [{ severity: 'low', message: `${uncommitted} uncommitted files` }] : [],
  };
}

function checkDepOutdated() {
  const result = run('npm', ['outdated', '--json'], 120_000);
  let parsed = {};
  try {
    parsed = JSON.parse(result.stdout || '{}');
  } catch {
    /* empty */
  }
  let major = 0;
  let minor = 0;
  let patch = 0;
  const findings = [];
  for (const [pkg, info] of Object.entries(parsed)) {
    const current = String(info.current || '');
    const latest = String(info.latest || '');
    if (!current || !latest || current === latest) continue;
    const [curMajor] = current.split('.');
    const [latMajor] = latest.split('.');
    if (curMajor !== latMajor) {
      major++;
      findings.push({ severity: 'high', message: `${pkg}: ${current} → ${latest} (major)` });
    } else {
      const curMinor = current.split('.')[1];
      const latMinor = latest.split('.')[1];
      if (curMinor !== latMinor) {
        minor++;
      } else {
        patch++;
      }
    }
  }
  return {
    status: major > 0 ? 'WARN' : 'PASS',
    metrics: { major, minor, patch, total: major + minor + patch },
    findings: findings.slice(0, 10),
  };
}

function checkDepAudit() {
  const result = run('npm', ['audit', '--json'], 120_000);
  let parsed = {};
  try {
    parsed = JSON.parse(result.stdout || '{}');
  } catch {
    /* empty */
  }
  const vulns = parsed.metadata?.vulnerabilities || {};
  const critical = vulns.critical || 0;
  const high = vulns.high || 0;
  const moderate = vulns.moderate || 0;
  const low = vulns.low || 0;
  const total = critical + high + moderate + low;
  const findings = [];
  if (critical > 0)
    findings.push({ severity: 'critical', message: `${critical} critical vulnerabilities` });
  if (high > 0) findings.push({ severity: 'high', message: `${high} high vulnerabilities` });
  return {
    status: critical > 0 ? 'FAIL' : high > 0 ? 'WARN' : 'PASS',
    metrics: { critical, high, moderate, low, total },
    findings,
  };
}

function checkTypeCoverage() {
  const result = run(
    'npx',
    ['type-coverage', '--json-output', '--strict', '--ignore-catch'],
    120_000
  );
  let pct = 0;
  let total = 0;
  let covered = 0;
  try {
    const lines = result.stdout.split('\n');
    for (const line of lines) {
      const match = line.match(/(\d+\.?\d*)%/);
      if (match) {
        pct = Number(match[1]);
        break;
      }
    }
    const countMatch = result.stdout.match(/(\d+)\s*\/\s*(\d+)/);
    if (countMatch) {
      covered = Number(countMatch[1]);
      total = Number(countMatch[2]);
    }
  } catch {
    /* empty */
  }
  return {
    status: pct >= 95 ? 'PASS' : 'WARN',
    metrics: { pct, covered, total },
    findings:
      pct < 95 ? [{ severity: 'medium', message: `Type coverage ${pct}% (target: 95%)` }] : [],
  };
}

function checkBundleBudget() {
  const buildResult = run('npm', ['run', '-s', 'build'], 300_000);
  if (!buildResult.ok) {
    return {
      status: 'FAIL',
      metrics: {},
      findings: [{ severity: 'critical', message: 'Build failed' }],
    };
  }
  const budgetResult = run('npm', ['run', '-s', 'test:bundle:budget'], 60_000);
  let mainEntryKib = 0;
  let nonI18nTotalKib = 0;
  const distDir = path.join(PROJECT_ROOT, 'dist', 'assets');
  if (fs.existsSync(distDir)) {
    const files = fs.readdirSync(distDir);
    let totalSize = 0;
    let i18nSize = 0;
    for (const file of files) {
      const stat = fs.statSync(path.join(distDir, file));
      totalSize += stat.size;
      if (/i18n|locale/i.test(file)) {
        i18nSize += stat.size;
      }
      if (/^index[.-]/.test(file) && file.endsWith('.js')) {
        mainEntryKib = Math.round(stat.size / 1024);
      }
    }
    nonI18nTotalKib = Math.round((totalSize - i18nSize) / 1024);
  }
  return {
    status: budgetResult.ok ? 'PASS' : 'FAIL',
    metrics: { main_entry_kib: mainEntryKib, non_i18n_total_kib: nonI18nTotalKib },
    findings: budgetResult.ok ? [] : [{ severity: 'high', message: 'Bundle budget exceeded' }],
  };
}

function checkTestUnit() {
  const result = run('npm', ['run', '-s', 'test:unit:ci'], 600_000);
  const output = result.stdout + result.stderr;
  const passMatch = output.match(/(\d+) passed/);
  const failMatch = output.match(/(\d+) failed/);
  const skipMatch = output.match(/(\d+) skipped/);
  const passCount = passMatch ? Number(passMatch[1]) : 0;
  const failCount = failMatch ? Number(failMatch[1]) : 0;
  const skipCount = skipMatch ? Number(skipMatch[1]) : 0;
  return {
    status: result.ok ? 'PASS' : 'FAIL',
    metrics: { pass_count: passCount, fail_count: failCount, skip_count: skipCount },
    findings:
      failCount > 0 ? [{ severity: 'critical', message: `${failCount} unit tests failed` }] : [],
  };
}

function checkTestCoverageGap() {
  const result = run('npm', ['run', '-s', 'test:coverage:gap'], 60_000);
  const lineMatch = (result.stdout + result.stderr).match(/(\d+) uncovered/);
  const uncovered = lineMatch ? Number(lineMatch[1]) : 0;
  return {
    status: result.ok ? 'PASS' : 'WARN',
    metrics: { uncovered_files: uncovered },
    findings:
      uncovered > 0
        ? [{ severity: 'medium', message: `${uncovered} files lack test coverage` }]
        : [],
  };
}

function checkTestRequiredGap() {
  const result = run('npm', ['run', '-s', 'test:required:gap'], 60_000);
  const missingMatch = (result.stdout + result.stderr).match(/(\d+) missing/);
  const missing = missingMatch ? Number(missingMatch[1]) : 0;
  return {
    status: result.ok ? 'PASS' : 'WARN',
    metrics: { missing_tests: missing },
    findings:
      missing > 0 ? [{ severity: 'medium', message: `${missing} required tests missing` }] : [],
  };
}

function checkDuplication() {
  run('npx', ['jscpd', 'src', '--reporters', 'json', '--output', '/tmp/jscpd-harness'], 120_000);
  let cloneCount = 0;
  let pctDuplicated = 0;
  try {
    const reportPath = '/tmp/jscpd-harness/jscpd-report.json';
    if (fs.existsSync(reportPath)) {
      const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
      cloneCount = report.statistics?.total?.clones || 0;
      pctDuplicated = report.statistics?.total?.percentage || 0;
    }
  } catch {
    /* empty */
  }
  return {
    status: pctDuplicated > 5 ? 'WARN' : 'PASS',
    metrics: { clone_count: cloneCount, pct_duplicated: pctDuplicated },
    findings:
      pctDuplicated > 5
        ? [
            {
              severity: 'medium',
              message: `${pctDuplicated}% code duplication (${cloneCount} clones)`,
            },
          ]
        : [],
  };
}

function checkSpelling() {
  const result = run(
    'npx',
    ['cspell', 'src/**/*.{ts,tsx}', '!src/i18n/**', '--no-progress', '--summary'],
    120_000
  );
  const issueMatch = (result.stdout + result.stderr).match(/(\d+) issues?/);
  const issueCount = issueMatch ? Number(issueMatch[1]) : result.ok ? 0 : -1;
  return {
    status: result.ok ? 'PASS' : 'WARN',
    metrics: { issue_count: issueCount },
    findings: issueCount > 0 ? [{ severity: 'low', message: `${issueCount} spelling issues` }] : [],
  };
}

function checkI18nCoverage() {
  const result = run('npm', ['run', '-s', 'test:i18n'], 60_000);
  return {
    status: result.ok ? 'PASS' : 'WARN',
    metrics: { passed: result.ok ? 1 : 0 },
    findings: result.ok ? [] : [{ severity: 'medium', message: 'i18n regression detected' }],
  };
}

function checkDepCruiser() {
  const result = run('npx', ['depcruise', '--config', '.dependency-cruiser.cjs', 'src'], 120_000);
  const violationMatch = (result.stdout + result.stderr).match(/(\d+) violations?/);
  const violations = violationMatch ? Number(violationMatch[1]) : result.ok ? 0 : -1;
  return {
    status: result.ok ? 'PASS' : 'WARN',
    metrics: { violations },
    findings:
      violations > 0
        ? [{ severity: 'medium', message: `${violations} dependency boundary violations` }]
        : [],
  };
}

function checkKnipUnused() {
  const result = run('npx', ['knip', '--include', 'dependencies,unlisted,exports'], 120_000);
  const output = result.stdout + result.stderr;
  const unusedMatch = output.match(/(\d+) unused/i);
  const unused = unusedMatch ? Number(unusedMatch[1]) : result.ok ? 0 : -1;
  return {
    status: result.ok ? 'PASS' : 'WARN',
    metrics: { unused_count: unused },
    findings: !result.ok
      ? [{ severity: 'medium', message: 'Unused dependencies or exports detected' }]
      : [],
  };
}

function checkLicenseCompliance() {
  const result = run(
    'npx',
    [
      'license-checker',
      '--failOn',
      'AGPL-1.0-only;AGPL-1.0-or-later;AGPL-3.0-only;AGPL-3.0-or-later;GPL-2.0-only;GPL-3.0-only;GPL-3.0-or-later',
      '--production',
    ],
    60_000
  );
  return {
    status: result.ok ? 'PASS' : 'FAIL',
    metrics: { compliant: result.ok ? 1 : 0 },
    findings: result.ok
      ? []
      : [{ severity: 'critical', message: 'Copyleft license detected in production dependencies' }],
  };
}

function checkProviderCascadeIntegration() {
  const result = run('python3', ['scripts/ops/model-injector-cascade-integration.py'], 120_000);
  return {
    status: result.ok ? 'PASS' : 'FAIL',
    metrics: { passed: result.ok ? 1 : 0 },
    findings: result.ok
      ? []
      : [{ severity: 'high', message: 'Provider cascade integration check failed' }],
  };
}

function checkServicesHealth() {
  const result = run('npm', ['run', '-s', 'validate:services'], 120_000);
  return {
    status: result.ok ? 'PASS' : 'WARN',
    metrics: { healthy: result.ok ? 1 : 0 },
    findings: result.ok
      ? []
      : [{ severity: 'medium', message: 'Third-party service validation failed' }],
  };
}

function checkSentryRegression() {
  const result = run('npm', ['run', '-s', 'check:sentry'], 60_000);
  return {
    status: result.ok ? 'PASS' : 'WARN',
    metrics: { clean: result.ok ? 1 : 0 },
    findings: result.ok
      ? []
      : [{ severity: 'medium', message: 'Sentry unresolved regression detected' }],
  };
}

function checkDocsFreshness() {
  const docsDir = path.join(PROJECT_ROOT, 'docs');
  const stale = [];
  const sixtyDaysMs = 60 * 24 * 3600 * 1000;
  const now = Date.now();

  function walkDocs(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'archive') continue;
        walkDocs(fullPath);
      } else if (entry.name.endsWith('.md')) {
        const stat = fs.statSync(fullPath);
        const age = now - stat.mtimeMs;
        if (age > sixtyDaysMs) {
          stale.push({
            file: path.relative(PROJECT_ROOT, fullPath),
            daysOld: Math.round(age / 86400000),
          });
        }
      }
    }
  }
  walkDocs(docsDir);

  return {
    status: stale.length > 5 ? 'WARN' : 'PASS',
    metrics: { stale_docs: stale.length },
    findings: stale.slice(0, 5).map((s) => ({
      severity: 'low',
      message: `${s.file} not modified in ${s.daysOld} days`,
    })),
  };
}

function checkOsvScanner() {
  const hasOsv = run('which', ['osv-scanner'], 5000);
  if (!hasOsv.ok) {
    return { status: 'SKIP', metrics: {}, findings: [] };
  }
  const result = run('osv-scanner', ['--lockfile', 'package-lock.json', '--json'], 120_000);
  let vulnCount = 0;
  try {
    const parsed = JSON.parse(result.stdout || '{}');
    vulnCount = parsed.results?.reduce((acc, r) => acc + (r.packages?.length || 0), 0) || 0;
  } catch {
    /* empty */
  }
  return {
    status: vulnCount > 0 ? 'WARN' : 'PASS',
    metrics: { vulnerabilities: vulnCount },
    findings:
      vulnCount > 0
        ? [{ severity: 'high', message: `OSV scanner: ${vulnCount} known vulnerabilities` }]
        : [],
  };
}

function checkSemgrep() {
  const hasSemgrep = run('which', ['semgrep'], 5000);
  if (!hasSemgrep.ok) {
    return { status: 'SKIP', metrics: {}, findings: [] };
  }
  const result = run(
    'semgrep',
    [
      '--config',
      'auto',
      'src/',
      '--exclude',
      'src/i18n/**',
      '--severity',
      'WARNING',
      '--severity',
      'ERROR',
      '--json',
      '--quiet',
    ],
    300_000
  );
  let findingCount = 0;
  try {
    const parsed = JSON.parse(result.stdout || '{}');
    findingCount = parsed.results?.length || 0;
  } catch {
    /* empty */
  }
  return {
    status: findingCount > 0 ? 'WARN' : 'PASS',
    metrics: { findings_count: findingCount },
    findings:
      findingCount > 0
        ? [{ severity: 'medium', message: `Semgrep: ${findingCount} static analysis findings` }]
        : [],
  };
}

// ---------------------------------------------------------------------------
// Check registry: { id, title, fn, profiles[] }
// ---------------------------------------------------------------------------

const CHECK_REGISTRY = [
  {
    id: 'typecheck',
    title: 'TypeScript typecheck',
    fn: checkTypecheck,
    profiles: ['quick', 'continuous', 'full'],
  },
  { id: 'lint', title: 'Lint (oxlint)', fn: checkLint, profiles: ['quick', 'continuous', 'full'] },
  {
    id: 'lockfile_integrity',
    title: 'Lockfile integrity',
    fn: checkLockfile,
    profiles: ['quick', 'continuous', 'full'],
  },
  {
    id: 'git_status',
    title: 'Git status',
    fn: checkGitStatus,
    profiles: ['quick', 'continuous', 'full'],
  },
  {
    id: 'provider_cascade_integration',
    title: 'Provider cascade integration',
    fn: checkProviderCascadeIntegration,
    profiles: ['continuous', 'full'],
  },
  {
    id: 'services_health',
    title: 'Third-party services health',
    fn: checkServicesHealth,
    profiles: ['continuous', 'full'],
  },
  {
    id: 'sentry_regression',
    title: 'Sentry regression check',
    fn: checkSentryRegression,
    profiles: ['continuous', 'full'],
  },
  {
    id: 'i18n_coverage',
    title: 'i18n regression check',
    fn: checkI18nCoverage,
    profiles: ['continuous', 'full'],
  },
  { id: 'bundle_budget', title: 'Bundle size budget', fn: checkBundleBudget, profiles: ['full'] },
  {
    id: 'test_required_gap',
    title: 'Required test matrix gap',
    fn: checkTestRequiredGap,
    profiles: ['continuous', 'full'],
  },
  { id: 'dep_outdated', title: 'Dependency freshness', fn: checkDepOutdated, profiles: ['full'] },
  { id: 'dep_audit', title: 'npm security audit', fn: checkDepAudit, profiles: ['full'] },
  { id: 'dep_osv', title: 'OSV vulnerability scanner', fn: checkOsvScanner, profiles: ['full'] },
  {
    id: 'security_semgrep',
    title: 'Semgrep static analysis',
    fn: checkSemgrep,
    profiles: ['full'],
  },
  { id: 'type_coverage', title: 'Type coverage', fn: checkTypeCoverage, profiles: ['full'] },
  { id: 'test_unit', title: 'Unit test suite', fn: checkTestUnit, profiles: ['full'] },
  {
    id: 'test_coverage_gap',
    title: 'Test coverage gap',
    fn: checkTestCoverageGap,
    profiles: ['full'],
  },
  {
    id: 'duplication',
    title: 'Code duplication (jscpd)',
    fn: checkDuplication,
    profiles: ['full'],
  },
  { id: 'spelling', title: 'Spelling (cspell)', fn: checkSpelling, profiles: ['full'] },
  { id: 'dep_cruiser', title: 'Dependency boundaries', fn: checkDepCruiser, profiles: ['full'] },
  { id: 'knip_unused', title: 'Unused code (knip)', fn: checkKnipUnused, profiles: ['full'] },
  {
    id: 'license_compliance',
    title: 'License compliance',
    fn: checkLicenseCompliance,
    profiles: ['full'],
  },
  {
    id: 'docs_freshness',
    title: 'Documentation freshness',
    fn: checkDocsFreshness,
    profiles: ['full'],
  },
];

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const startedAt = new Date().toISOString();
  const history = loadHistory();
  const previous = history.length > 0 ? history[history.length - 1] : null;

  const checksToRun = CHECK_REGISTRY.filter((c) => c.profiles.includes(PROFILE));
  const checks = {};

  console.error(`Harness report: running ${checksToRun.length} checks (profile=${PROFILE})`);

  for (const check of checksToRun) {
    const checkStart = Date.now();
    console.error(`  [${check.id}] ${check.title}...`);
    try {
      checks[check.id] = check.fn();
    } catch (err) {
      checks[check.id] = {
        status: 'ERROR',
        metrics: {},
        findings: [{ severity: 'high', message: `Check threw: ${err.message}` }],
      };
    }
    checks[check.id].durationMs = Date.now() - checkStart;
    console.error(`  [${check.id}] ${checks[check.id].status} (${checks[check.id].durationMs}ms)`);
  }

  const finishedAt = new Date().toISOString();
  const durationMs = new Date(finishedAt).getTime() - new Date(startedAt).getTime();

  const statuses = Object.values(checks).map((c) => c.status);
  const hasFail = statuses.includes('FAIL');
  const hasWarn = statuses.includes('WARN');
  const hasError = statuses.includes('ERROR');
  const overall = hasFail || hasError ? 'FAIL' : hasWarn ? 'WARN' : 'PASS';

  const report = {
    timestamp: startedAt,
    finishedAt,
    profile: PROFILE,
    durationMs,
    overall,
    checkCount: checksToRun.length,
    checks,
  };

  // Compute trends from history
  const trends = {};
  const trendMetrics = [
    ['bundle_budget', 'main_entry_kib'],
    ['bundle_budget', 'non_i18n_total_kib'],
    ['type_coverage', 'pct'],
    ['test_unit', 'pass_count'],
    ['dep_outdated', 'major'],
    ['dep_audit', 'critical'],
    ['duplication', 'clone_count'],
    ['lint', 'error_count'],
  ];
  for (const [checkId, metric] of trendMetrics) {
    const key = `${checkId}.${metric}`;
    const hist = extractTrends(history, checkId, metric);
    const current = checks[checkId]?.metrics?.[metric];
    if (current !== undefined) hist.push(current);
    if (hist.length > 0) trends[key] = hist;
  }
  report.trends = trends;

  report.regressions = detectRegressions(report, previous);
  report.improvements = detectImprovements(report, previous);

  // Write reports
  ensureDir(REPORTS_DIR);
  const stamp = startedAt.replace(/[:]/g, '-');
  const stampPath = path.join(REPORTS_DIR, `${stamp}.json`);
  const latestPath = path.join(REPORTS_DIR, 'latest.json');
  fs.writeFileSync(stampPath, JSON.stringify(report, null, 2) + '\n');
  fs.writeFileSync(latestPath, JSON.stringify(report, null, 2) + '\n');

  // Summary to stdout
  console.log(JSON.stringify(report, null, 2));

  // Human-readable summary to stderr
  console.error('');
  console.error(
    `Harness report: ${overall} (${checksToRun.length} checks, ${Math.round(durationMs / 1000)}s)`
  );
  if (report.regressions.length > 0) {
    console.error(
      `  Regressions: ${report.regressions.map((r) => `${r.check}.${r.metric}: ${r.from}→${r.to}`).join(', ')}`
    );
  }
  if (report.improvements.length > 0) {
    console.error(
      `  Improvements: ${report.improvements.map((i) => `${i.check}.${i.metric}: ${i.from}→${i.to}`).join(', ')}`
    );
  }
  const findings = Object.values(checks).flatMap((c) => c.findings || []);
  const criticalFindings = findings.filter((f) => f.severity === 'critical');
  if (criticalFindings.length > 0) {
    console.error(`  Critical findings: ${criticalFindings.map((f) => f.message).join('; ')}`);
  }

  process.exit(overall === 'FAIL' ? 1 : 0);
}

main();
