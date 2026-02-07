#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

const LOCALES_DIR = path.join(ROOT, 'src/i18n/locales/txt');
const STATIC_DIR = path.join(ROOT, 'src/i18n/static/txt');

const BASE_LOCALE = 'en-GB';
const BASE_STATIC = 'en-GB';

const EN_PREFIX = /^en-/i;

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
  if (t.includes('http://') || t.includes('https://') || t.includes('www.')) return true;
  // If only placeholders + punctuation/numbers, ignore
  const stripped = t
    .replace(/\{\{[^}]+\}\}/g, '')
    .replace(/[\s\d\-+(){}\[\],./:#%_]/g, '');
  if (stripped.length === 0) return true;
  // If no letters remain (e.g., symbols), ignore
  if (!/[A-Za-z]/.test(t)) return true;
  return false;
}

function englishHeavy(text) {
  const t = text.trim();
  if (t.length < 40) return false;
  const letters = t.replace(/[^A-Za-z]/g, '').length;
  const total = t.replace(/\s+/g, '').length;
  if (total === 0) return false;
  const ratio = letters / total;
  return ratio > 0.85;
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

function checkDir(dir, baseLocale) {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.txt'));
  const basePath = path.join(dir, `${baseLocale}.txt`);
  if (!fs.existsSync(basePath)) {
    throw new Error(`Base locale missing: ${basePath}`);
  }
  const baseMap = loadTxtMap(basePath);
  const baseCount = baseMap.size;

  const results = {
    baseLocale,
    baseCount,
    mismatches: [],
    exactMatches: [],
    warnings: [],
  };

  for (const file of files) {
    const locale = file.replace(/\.txt$/, '');
    const filePath = path.join(dir, file);
    const map = loadTxtMap(filePath);

    if (map.size !== baseCount) {
      results.mismatches.push({ locale, count: map.size });
    }

    // Skip English locales for exact-match checks
    const isEnglish = EN_PREFIX.test(locale) || locale === baseLocale;

    for (const [lineNo, baseText] of baseMap.entries()) {
      const text = map.get(lineNo) ?? '';
      if (!isEnglish && text === baseText && !isIgnorable(text)) {
        results.exactMatches.push({ locale, lineNo, text });
      } else if (!isEnglish && text && text !== baseText && englishHeavy(text)) {
        results.warnings.push({ locale, lineNo, text });
      }
    }
  }

  return results;
}

function printReport(title, result) {
  console.log(`\n== ${title} ==`);
  console.log(`Base locale: ${result.baseLocale}`);
  console.log(`Base line count: ${result.baseCount}`);
  if (result.mismatches.length) {
    console.log('\nLine-count mismatches:');
    for (const m of result.mismatches) {
      console.log(`- ${m.locale}: ${m.count}`);
    }
  } else {
    console.log('\nLine-count mismatches: none');
  }

  if (result.exactMatches.length) {
    console.log(`\nExact English matches (non-English locales): ${result.exactMatches.length}`);
    for (const m of result.exactMatches.slice(0, 50)) {
      console.log(`- ${m.locale} line ${m.lineNo}: ${m.text}`);
    }
    if (result.exactMatches.length > 50) {
      console.log(`... ${result.exactMatches.length - 50} more`);
    }
  } else {
    console.log('\nExact English matches: none');
  }

  if (result.warnings.length) {
    console.log(`\nEnglish-heavy warnings: ${result.warnings.length}`);
    for (const w of result.warnings.slice(0, 30)) {
      console.log(`- ${w.locale} line ${w.lineNo}: ${w.text}`);
    }
    if (result.warnings.length > 30) {
      console.log(`... ${result.warnings.length - 30} more`);
    }
  } else {
    console.log('\nEnglish-heavy warnings: none');
  }
}

let failed = false;
try {
  const localesResult = checkDir(LOCALES_DIR, BASE_LOCALE);
  printReport('Locales', localesResult);
  if (localesResult.mismatches.length || localesResult.exactMatches.length) failed = true;

  const staticResult = checkDir(STATIC_DIR, BASE_STATIC);
  printReport('Static', staticResult);
  if (staticResult.mismatches.length || staticResult.exactMatches.length) failed = true;
} catch (err) {
  console.error(err);
  process.exit(2);
}

process.exit(failed ? 1 : 0);
