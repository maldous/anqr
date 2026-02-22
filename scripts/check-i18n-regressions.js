#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const LOCALES_DIR = path.join(ROOT, 'src/i18n/locales/txt');
const STATIC_DIR = path.join(ROOT, 'src/i18n/static/txt');
const BASELINE_PATH = path.join(ROOT, 'reports/i18n-regression-baseline.json');

const BASE_LOCALE = 'en-GB';
const BASE_STATIC = 'en-GB';
const EN_PREFIX = /^en-/i;
const TECHNICAL_EXACT_ALLOWLIST = new Set([
  // These tokens are intentionally kept stable across locales.
  'X + Y',
  'Dither In',
]);

function readLines(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return content.split(/\r?\n/).filter((l) => l.length > 0);
}

function parseLine(line) {
  const idx = line.indexOf('\t');
  if (idx === -1) return null;
  const lineNo = line.slice(0, idx).trim();
  let text = line.slice(idx + 1).trim();
  if (text.startsWith('"') && text.endsWith('"')) {
    text = text.slice(1, -1);
  }
  return { lineNo, text };
}

function isIgnorable(text) {
  const t = text.trim();
  if (!t || t === '_' || t === '(deprecated)') return true;
  if (TECHNICAL_EXACT_ALLOWLIST.has(t)) return true;
  if (t.includes('http://') || t.includes('https://') || t.includes('www.')) return true;
  // Config glossary lines intentionally keep technical keys and literals.
  if (/^[A-Za-z][A-Za-z0-9_.-]{1,40}:\s/.test(t)) return true;
  if (/\(default:\s*[^)]+\)/i.test(t)) return true;
  if (/\b\d+\s*=\s*[A-Za-z0-9_-]+/.test(t)) return true;
  // Product/standard names are often intentionally untranslated.
  if (
    /\b(ANQR|EMVCo|GTIN|BOLT11|Shift-JIS|PayID|QRIS|SEPA|Swiss QR-bill|Case Study)\b/i.test(t)
  ) {
    return true;
  }
  if (t.length < 30) return true;
  const words = t.split(/\s+/).filter(Boolean);
  if (words.length < 5) return true;
  const stripped = t
    .replace(/\{\{[^}]+\}\}/g, '')
    .replace(/[\s\d\-+(){}\[\],./:#%_]/g, '');
  if (stripped.length === 0) return true;
  if (!/[A-Za-z]/.test(t)) return true;
  return false;
}

function loadTxtMap(filePath) {
  const lines = readLines(filePath);
  const map = new Map();
  for (const line of lines) {
    const parsed = parseLine(line);
    if (!parsed) continue;
    map.set(parsed.lineNo, parsed.text);
  }
  return map;
}

function collectStats(dir, baseLocale) {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.txt')).sort();
  const basePath = path.join(dir, `${baseLocale}.txt`);
  if (!fs.existsSync(basePath)) {
    throw new Error(`Base locale missing: ${basePath}`);
  }

  const baseMap = loadTxtMap(basePath);
  const baseCount = baseMap.size;
  const stats = {
    baseLocale,
    baseCount,
    exactMatchesByLocale: {},
    lineCountMismatchesByLocale: {},
  };

  for (const file of files) {
    const locale = file.replace(/\.txt$/, '');
    const filePath = path.join(dir, file);
    const map = loadTxtMap(filePath);

    if (map.size !== baseCount) {
      stats.lineCountMismatchesByLocale[locale] = map.size;
    }

    const isEnglish = EN_PREFIX.test(locale) || locale === baseLocale;
    if (isEnglish) {
      stats.exactMatchesByLocale[locale] = 0;
      continue;
    }

    let exact = 0;
    for (const [lineNo, baseText] of baseMap.entries()) {
      const text = map.get(lineNo) ?? '';
      if (text === baseText && !isIgnorable(text)) {
        exact++;
      }
    }
    stats.exactMatchesByLocale[locale] = exact;
  }

  return stats;
}

function currentSnapshot() {
  return {
    generatedAt: new Date().toISOString(),
    locales: collectStats(LOCALES_DIR, BASE_LOCALE),
    static: collectStats(STATIC_DIR, BASE_STATIC),
  };
}

function compareSection(name, current, baseline) {
  const regressions = [];

  const locales = new Set([
    ...Object.keys(current.exactMatchesByLocale || {}),
    ...Object.keys(baseline.exactMatchesByLocale || {}),
  ]);

  for (const locale of [...locales].sort()) {
    const cur = current.exactMatchesByLocale?.[locale] ?? 0;
    const base = baseline.exactMatchesByLocale?.[locale] ?? 0;
    if (cur > base) {
      regressions.push(
        `${name}/${locale}: exact English matches increased ${base} -> ${cur}`
      );
    }
  }

  const mismatchLocales = new Set([
    ...Object.keys(current.lineCountMismatchesByLocale || {}),
    ...Object.keys(baseline.lineCountMismatchesByLocale || {}),
  ]);

  for (const locale of [...mismatchLocales].sort()) {
    const cur = current.lineCountMismatchesByLocale?.[locale];
    const base = baseline.lineCountMismatchesByLocale?.[locale];

    if (cur !== undefined && base === undefined) {
      regressions.push(
        `${name}/${locale}: new line-count mismatch detected (current ${cur}, baseline none)`
      );
      continue;
    }

    if (cur !== undefined && base !== undefined && cur !== base) {
      regressions.push(
        `${name}/${locale}: line-count mismatch changed ${base} -> ${cur}`
      );
    }
  }

  return regressions;
}

function main() {
  const args = new Set(process.argv.slice(2));
  const writeBaseline = args.has('--write-baseline');

  const snapshot = currentSnapshot();

  if (writeBaseline) {
    fs.mkdirSync(path.dirname(BASELINE_PATH), { recursive: true });
    fs.writeFileSync(BASELINE_PATH, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
    console.log(`Wrote baseline: ${path.relative(ROOT, BASELINE_PATH)}`);
    return;
  }

  if (!fs.existsSync(BASELINE_PATH)) {
    console.error(`Missing baseline: ${path.relative(ROOT, BASELINE_PATH)}`);
    console.error('Run: node scripts/check-i18n-regressions.js --write-baseline');
    process.exit(2);
  }

  const baseline = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'));
  const regressions = [
    ...compareSection('locales', snapshot.locales, baseline.locales || {}),
    ...compareSection('static', snapshot.static, baseline.static || {}),
  ];

  if (regressions.length) {
    console.error('i18n regression check failed:');
    for (const r of regressions) {
      console.error(`- ${r}`);
    }
    process.exit(1);
  }

  console.log('i18n regression check passed (no count regressions).');
}

main();
