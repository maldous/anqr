#!/usr/bin/env node
/**
 * Sitemap Generator with hreflang support
 * Generates sitemap.xml with one canonical <url> per page and hreflang alternates
 * for all supported languages within each entry.
 */

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// All supported languages (from src/i18n/index.ts)
// This must match the languages array in src/i18n/index.ts
const languages = [
  'en-GB', // Default
  // English variants
  'en-US', 'en-AU', 'en-CA', 'en-IN', 'en-SG', 'en-ZA',
  // A-Z languages
  'af', 'am', 'ar', 'az-AZ', 'be', 'bg', 'bn-BD', 'ca',
  'cs-CZ', 'da-DK', 'de-DE', 'el-GR',
  'es-ES', 'es-419', 'es-US', 'et', 'eu-ES',
  'fa', 'fa-AE', 'fa-AF', 'fa-IR', 'fi-FI', 'fil', 'fr-CA', 'fr-FR', 'gl-ES',
  'gu', 'hi-IN', 'hr', 'hu-HU', 'hy-AM',
  'id', 'is-IS', 'it-IT', 'iw-IL', 'ja-JP',
  'ka-GE', 'kk', 'km-KH', 'kn-IN', 'ko-KR', 'ky-KG',
  'lo-LA', 'lt', 'lv',
  'mk-MK', 'ml-IN', 'mn-MN', 'mr-IN', 'ms', 'ms-MY', 'my-MM',
  'ne-NP', 'nl-NL', 'no-NO',
  'pa', 'pl-PL', 'pt-BR', 'pt-PT',
  'ro', 'ru-RU',
  'si-LK', 'sk', 'sl', 'sq', 'sr', 'sv-SE', 'sw',
  'ta-IN', 'te-IN', 'th', 'tr-TR',
  'uk', 'ur',
  'vi',
  'zh-CN', 'zh-HK', 'zh-TW',
  'zu'
];

// All pages with their priorities and change frequencies
const allPages = [
  { path: '', priority: 1.0, changefreq: 'weekly' },
  { path: 'gallery', priority: 0.9, changefreq: 'weekly' },
  { path: 'learn', priority: 0.9, changefreq: 'weekly' },
  { path: 'examples', priority: 0.9, changefreq: 'weekly' },
  { path: 'guide', priority: 0.8, changefreq: 'weekly' },
  { path: 'about', priority: 0.6, changefreq: 'monthly' },
  { path: 'contact', priority: 0.5, changefreq: 'monthly' },
  { path: 'privacy', priority: 0.4, changefreq: 'monthly' },
  { path: 'terms', priority: 0.4, changefreq: 'monthly' },
];

const BASE_URL = 'https://anqr.link';
const LASTMOD = new Date().toISOString().split('T')[0];

/**
 * Convert language code to hreflang format
 */
function toHreflang(lang) {
  // en-GB is the default, use 'en' for broader matching
  if (lang === 'en-GB') return 'en';
  // Convert to lowercase for hreflang (e.g., zh-CN -> zh-cn)
  return lang.toLowerCase();
}

/**
 * Get URL for a page in a specific language
 */
function getUrl(pagePath, lang) {
  const base = pagePath ? `${BASE_URL}/${pagePath}` : `${BASE_URL}/`;
  if (lang === 'en-GB') return base;
  return `${base}?lang=${lang}`;
}

/**
 * Generate hreflang links for a page
 */
function generateHreflangLinks(pagePath, indent = '    ') {
  const links = [];

  // x-default pointing to English version first
  links.push(`${indent}<xhtml:link rel="alternate" hreflang="x-default" href="${getUrl(pagePath, 'en-GB')}"/>`);

  // All languages
  for (const lang of languages) {
    const href = getUrl(pagePath, lang);
    const hreflang = toHreflang(lang);
    links.push(`${indent}<xhtml:link rel="alternate" hreflang="${hreflang}" href="${href}"/>`);
  }

  return links.join('\n');
}

/**
 * Generate the complete sitemap
 */
function generateSitemap() {
  const entries = [];

  entries.push(`<?xml version="1.0" encoding="UTF-8"?>`);
  entries.push(`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"`);
  entries.push(`        xmlns:xhtml="http://www.w3.org/1999/xhtml">`);
  entries.push('');

  for (const page of allPages) {
    const loc = page.path ? `${BASE_URL}/${page.path}` : `${BASE_URL}/`;
    entries.push(`  <url>`);
    entries.push(`    <loc>${loc}</loc>`);
    entries.push(`    <lastmod>${LASTMOD}</lastmod>`);
    entries.push(`    <changefreq>${page.changefreq}</changefreq>`);
    entries.push(`    <priority>${page.priority.toFixed(1)}</priority>`);
    entries.push(generateHreflangLinks(page.path));
    entries.push(`  </url>`);
    entries.push('');
  }

  entries.push('</urlset>');

  return entries.join('\n');
}

// Generate and write the sitemap
const sitemap = generateSitemap();
const outputPath = join(__dirname, '..', 'public', 'sitemap.xml');
writeFileSync(outputPath, sitemap, 'utf-8');

// Count URLs
const urlCount = (sitemap.match(/<url>/g) || []).length;
const hreflangCount = (sitemap.match(/xhtml:link/g) || []).length;

console.log(`✅ Generated sitemap.xml`);
console.log(`   - ${urlCount} URLs (canonical pages)`);
console.log(`   - ${hreflangCount} hreflang links`);
console.log(`   - Output: ${outputPath}`);
