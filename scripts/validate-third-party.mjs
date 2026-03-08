#!/usr/bin/env node

// =============================================================================
// ANQR Third-Party Service Validation
// =============================================================================
// Validates all external service integrations are correctly configured and live.
//
// Usage:
//   node scripts/validate-third-party.mjs
//
// Environment variables (optional — checks gracefully skip if not set):
//   SENTRY_TOKEN           — Sentry API bearer token
//   CLOUDFLARE_TOKEN_READALL — Cloudflare API bearer token (read-all)
//   SNYK_TOKEN             — Snyk API token (DISABLED — private test quota exhausted)
//   SONAR_TOKEN            — SonarQube token (local)
//
// Exit codes:
//   0 — all critical checks passed
//   1 — one or more critical checks failed
// =============================================================================

import https from 'node:https';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');

// ── Constants ────────────────────────────────────────────────────────────────

const NETLIFY_SITE_ID = '7def13e4-9486-4e9a-9ad3-87abff74ef1d';
const SENTRY_ORG = 'anqr';
const SENTRY_PROJECTS = ['anqr-web', 'anqr-mobile', 'anqr-api'];
const SENTRY_API_DSN =
  'https://6935e811c47169e037e31209f2d46fbd@o4510808522489856.ingest.us.sentry.io/4510808547917824';
const CLOUDFLARE_ZONE_NAME = 'anqr.link';
const EXPECTED_CNAME_TARGET = 'anqr.netlify.app';
const PUBLISHER_ID = 'pub-2270701384951162';
const ADMOB_APP_ID_ANDROID = 'ca-app-pub-2270701384951162~3067761782';
const ADMOB_APP_ID_IOS = 'ca-app-pub-2270701384951162~2718285064';
const INDEXNOW_KEY = 'da39713d0cb0b7ec43d21f259b214605';
const REQUEST_TIMEOUT_MS = 10_000;

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Make an HTTPS GET request. Returns { statusCode, headers, body }.
 */
function httpsGet(url, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const mod = parsedUrl.protocol === 'http:' ? http : https;
    const req = mod.get(
      url,
      {
        headers: { 'User-Agent': 'ANQR-Validator/1.0', ...extraHeaders },
        timeout: REQUEST_TIMEOUT_MS,
      },
      (res) => {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: Buffer.concat(chunks).toString('utf-8'),
          });
        });
      }
    );
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request timeout after ${REQUEST_TIMEOUT_MS}ms: ${url}`));
    });
    req.on('error', reject);
  });
}

/**
 * Safely parse JSON, returning null on failure.
 */
function safeJSON(str) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

/**
 * Read a project-root-relative file, returning null if missing.
 */
function readProjectFile(relPath) {
  const full = path.join(PROJECT_ROOT, relPath);
  try {
    return fs.readFileSync(full, 'utf-8');
  } catch {
    return null;
  }
}

/**
 * Check if a project-root-relative file exists.
 */
function fileExists(relPath) {
  return fs.existsSync(path.join(PROJECT_ROOT, relPath));
}

// ── Result accumulator ──────────────────────────────────────────────────────

const results = [];

function addResult(name, level, status, summary, details = {}) {
  results.push({ name, level, status, summary, details, timestamp: new Date().toISOString() });
}

// ── 1. Netlify ──────────────────────────────────────────────────────────────

async function checkNetlify() {
  const name = 'Netlify';
  const details = {};
  try {
    // Use Netlify CLI to get site info
    const siteRaw = execSync(`npx netlify api getSite --data '{"site_id":"${NETLIFY_SITE_ID}"}'`, {
      encoding: 'utf-8',
      timeout: 30_000,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    const site = safeJSON(siteRaw);
    if (!site) {
      addResult(name, 'CRITICAL', 'FAIL', 'Could not parse Netlify site response', {
        raw: siteRaw.slice(0, 500),
      });
      return;
    }

    details.state = site.state;
    details.ssl = !!(
      site.ssl ||
      site.force_ssl ||
      (site.ssl_url && site.ssl_url.startsWith('https'))
    );
    details.custom_domain = site.custom_domain || site.default_domain;
    details.url = site.ssl_url || site.url;

    // Check latest deploy
    let deployReady = false;
    try {
      const deploysRaw = execSync(
        `npx netlify api listSiteDeploys --data '{"site_id":"${NETLIFY_SITE_ID}","per_page":1}'`,
        { encoding: 'utf-8', timeout: 30_000, stdio: ['pipe', 'pipe', 'pipe'] }
      );
      const deploys = safeJSON(deploysRaw);
      if (Array.isArray(deploys) && deploys.length > 0) {
        details.latest_deploy_state = deploys[0].state;
        details.latest_deploy_id = deploys[0].id;
        details.latest_deploy_created = deploys[0].created_at;
        deployReady = deploys[0].state === 'ready';
      }
    } catch (e) {
      details.deploy_error = e.message;
    }

    const stateOk = site.state === 'current';
    const sslOk = details.ssl;
    const domainOk = details.custom_domain === 'anqr.link';

    if (stateOk && sslOk && domainOk && deployReady) {
      addResult(name, 'CRITICAL', 'PASS', 'Site active, SSL enabled, latest deploy ready', details);
    } else {
      const issues = [];
      if (!stateOk) issues.push(`state=${site.state}`);
      if (!sslOk) issues.push('SSL not enabled');
      if (!domainOk) issues.push(`domain=${details.custom_domain}`);
      if (!deployReady) issues.push(`deploy=${details.latest_deploy_state || 'unknown'}`);
      addResult(name, 'CRITICAL', 'FAIL', `Issues: ${issues.join(', ')}`, details);
    }
  } catch (e) {
    addResult(name, 'CRITICAL', 'FAIL', `Netlify CLI error: ${e.message}`, { error: e.message });
  }
}

// ── 2. Sentry ───────────────────────────────────────────────────────────────

async function checkSentry() {
  const name = 'Sentry';
  const token = process.env.SENTRY_TOKEN;
  if (!token) {
    addResult(name, 'CRITICAL', 'SKIP', 'SENTRY_TOKEN not set', {});
    return;
  }

  const details = { projects: {} };
  const headers = { Authorization: `Bearer ${token}` };
  let activeCount = 0;
  let totalUnresolved = 0;

  for (const proj of SENTRY_PROJECTS) {
    try {
      const res = await httpsGet(
        `https://sentry.io/api/0/projects/${SENTRY_ORG}/${proj}/`,
        headers
      );
      const data = safeJSON(res.body);
      if (res.statusCode === 200 && data) {
        const isActive = data.status === 'active';
        if (isActive) activeCount++;

        // Get unresolved issue count
        let unresolvedCount = 0;
        try {
          const issuesRes = await httpsGet(
            `https://sentry.io/api/0/projects/${SENTRY_ORG}/${proj}/issues/?query=is:unresolved&limit=1`,
            headers
          );
          // Sentry returns the total in the Link header or X-Hits header
          unresolvedCount = Number.parseInt(issuesRes.headers['x-hits'] || '0', 10);
          // Fallback: if x-hits not present, count returned items (limited but better than 0)
          if (!unresolvedCount && issuesRes.statusCode === 200) {
            const issues = safeJSON(issuesRes.body);
            if (Array.isArray(issues)) unresolvedCount = issues.length;
          }
        } catch {
          // Non-critical — just count as 0
        }

        totalUnresolved += unresolvedCount;
        details.projects[proj] = {
          status: data.status,
          active: isActive,
          unresolved: unresolvedCount,
        };
      } else {
        details.projects[proj] = { status: 'not_found', active: false, statusCode: res.statusCode };
      }
    } catch (e) {
      details.projects[proj] = { status: 'error', active: false, error: e.message };
    }
  }

  // Verify DSN in netlify function
  const qrFunctionContent = readProjectFile('netlify/functions/qr.ts');
  details.dsn_check = { expected: SENTRY_API_DSN };
  if (qrFunctionContent) {
    const dsnMatch = qrFunctionContent.includes(SENTRY_API_DSN);
    details.dsn_check.found_in_function = dsnMatch;
    details.dsn_check.status = dsnMatch ? 'match' : 'mismatch';
  } else {
    details.dsn_check.found_in_function = false;
    details.dsn_check.status = 'file_not_found';
  }

  const allExist = activeCount === SENTRY_PROJECTS.length;
  const dsnOk = details.dsn_check.status === 'match';

  if (allExist && dsnOk) {
    const warnSuffix = totalUnresolved > 0 ? ` (${totalUnresolved} unresolved issues)` : '';
    addResult(
      name,
      'CRITICAL',
      'PASS',
      `${activeCount}/${SENTRY_PROJECTS.length} projects active${warnSuffix}`,
      details
    );
  } else if (allExist) {
    addResult(
      name,
      'CRITICAL',
      'WARN',
      `Projects active but DSN ${details.dsn_check.status}`,
      details
    );
  } else {
    addResult(
      name,
      'CRITICAL',
      'FAIL',
      `Only ${activeCount}/${SENTRY_PROJECTS.length} projects active`,
      details
    );
  }
}

// ── 3. Cloudflare ───────────────────────────────────────────────────────────

async function checkCloudflare() {
  const name = 'Cloudflare';
  const token = process.env.CLOUDFLARE_TOKEN_READALL;
  if (!token) {
    addResult(name, 'CRITICAL', 'SKIP', 'CLOUDFLARE_TOKEN_READALL not set', {});
    return;
  }

  const headers = { Authorization: `Bearer ${token}` };
  const details = {};

  try {
    // Get zone
    const zonesRes = await httpsGet(
      `https://api.cloudflare.com/client/v4/zones?name=${CLOUDFLARE_ZONE_NAME}`,
      headers
    );
    const zonesData = safeJSON(zonesRes.body);
    if (!zonesData?.success || !zonesData.result?.length) {
      addResult(name, 'CRITICAL', 'FAIL', 'Zone not found', {
        response: zonesRes.body.slice(0, 500),
      });
      return;
    }

    const zone = zonesData.result[0];
    details.zone_id = zone.id;
    details.zone_status = zone.status;
    details.zone_name = zone.name;

    const zoneActive = zone.status === 'active';

    // Get DNS records
    const dnsRes = await httpsGet(
      `https://api.cloudflare.com/client/v4/zones/${zone.id}/dns_records?type=CNAME`,
      headers
    );
    const dnsData = safeJSON(dnsRes.body);
    const records = dnsData?.result || [];

    // Check root CNAME (anqr.link → anqr.netlify.app)
    const rootCname = records.find(
      (r) => (r.name === 'anqr.link' || r.name === '@') && r.content === EXPECTED_CNAME_TARGET
    );
    // Check www CNAME (www.anqr.link → anqr.netlify.app)
    const wwwCname = records.find(
      (r) => (r.name === 'www.anqr.link' || r.name === 'www') && r.content === EXPECTED_CNAME_TARGET
    );

    details.dns = {
      root_cname: rootCname
        ? { found: true, content: rootCname.content, proxied: rootCname.proxied }
        : { found: false },
      www_cname: wwwCname
        ? { found: true, content: wwwCname.content, proxied: wwwCname.proxied }
        : { found: false },
      total_cname_records: records.length,
    };

    // Check SSL verification
    let sslStatus = 'unknown';
    try {
      const sslRes = await httpsGet(
        `https://api.cloudflare.com/client/v4/zones/${zone.id}/ssl/verification`,
        headers
      );
      const sslData = safeJSON(sslRes.body);
      if (sslData?.result?.length) {
        sslStatus = sslData.result[0].certificate_status || sslData.result[0].status || 'unknown';
      }
      details.ssl = { status: sslStatus, raw: sslData?.result?.[0] || null };
    } catch (e) {
      details.ssl = { status: 'error', error: e.message };
    }

    const dnsOk = rootCname && wwwCname;

    if (zoneActive && dnsOk) {
      addResult(name, 'CRITICAL', 'PASS', `Zone active, DNS correct, SSL ${sslStatus}`, details);
    } else {
      const issues = [];
      if (!zoneActive) issues.push(`zone status=${zone.status}`);
      if (!rootCname) issues.push('root CNAME missing');
      if (!wwwCname) issues.push('www CNAME missing');
      addResult(name, 'CRITICAL', 'FAIL', `Issues: ${issues.join(', ')}`, details);
    }
  } catch (e) {
    addResult(name, 'CRITICAL', 'FAIL', `Cloudflare API error: ${e.message}`, { error: e.message });
  }
}

// ── 4. Live Site ────────────────────────────────────────────────────────────

async function checkLiveSite() {
  const name = 'Live Site';
  const details = { endpoints: {} };
  let allPassed = true;

  // Helper: check a single endpoint
  async function checkEndpoint(label, url, checks) {
    try {
      const res = await httpsGet(url);
      const endpointResult = {
        url,
        statusCode: res.statusCode,
        checks: {},
      };

      let passed = true;
      for (const [checkName, checkFn] of Object.entries(checks)) {
        const ok = checkFn(res);
        endpointResult.checks[checkName] = ok;
        if (!ok) passed = false;
      }

      endpointResult.passed = passed;
      details.endpoints[label] = endpointResult;
      if (!passed) allPassed = false;
    } catch (e) {
      details.endpoints[label] = { url, passed: false, error: e.message };
      allPassed = false;
    }
  }

  // Homepage
  await checkEndpoint('homepage', 'https://anqr.link/', {
    status_200: (r) => r.statusCode === 200,
    hsts_header: (r) => !!r.headers['strict-transport-security'],
    csp_header: (r) => !!r.headers['content-security-policy'],
  });

  // QR API
  await checkEndpoint('qr_api', 'https://anqr.link/api/qr?data=test&size=100', {
    status_200: (r) => r.statusCode === 200,
    image_content_type: (r) => (r.headers['content-type'] || '').startsWith('image/'),
  });

  // Sitemap
  await checkEndpoint('sitemap', 'https://anqr.link/sitemap.xml', {
    status_200: (r) => r.statusCode === 200,
  });

  // Robots.txt
  await checkEndpoint('robots_txt', 'https://anqr.link/robots.txt', {
    status_200: (r) => r.statusCode === 200,
  });

  // ads.txt
  await checkEndpoint('ads_txt', 'https://anqr.link/ads.txt', {
    status_200: (r) => r.statusCode === 200,
    contains_publisher_id: (r) => r.body.includes(PUBLISHER_ID),
  });

  // Summarize
  const endpointCount = Object.keys(details.endpoints).length;
  const passedCount = Object.values(details.endpoints).filter((e) => e.passed).length;

  if (allPassed) {
    addResult(name, 'CRITICAL', 'PASS', 'All endpoints responding, headers correct', details);
  } else {
    const failed = Object.entries(details.endpoints)
      .filter(([, e]) => !e.passed)
      .map(([label]) => label);
    addResult(
      name,
      'CRITICAL',
      'FAIL',
      `${passedCount}/${endpointCount} passed; failed: ${failed.join(', ')}`,
      details
    );
  }
}

// ── 5. Google Play Store files ──────────────────────────────────────────────

async function checkGooglePlay() {
  const name = 'Google Play';
  const details = {};

  // Check play-store-key.json
  details.play_store_key = fileExists('play-store-key.json');

  // Check release keystore
  details.release_keystore = fileExists('android/app/release-key.keystore');

  // Check google-services.json
  const googleServicesContent = readProjectFile('android/app/google-services.json');
  if (googleServicesContent) {
    const data = safeJSON(googleServicesContent);
    details.google_services = {
      exists: true,
      has_project_id: !!data?.project_info?.project_id,
      project_id: data?.project_info?.project_id || null,
    };
  } else {
    details.google_services = { exists: false };
  }

  const allPresent =
    details.play_store_key && details.release_keystore && details.google_services.exists;

  if (allPresent) {
    addResult(name, 'WARN', 'PASS', 'All Play Store files present', details);
  } else {
    const missing = [];
    if (!details.play_store_key) missing.push('play-store-key.json');
    if (!details.release_keystore) missing.push('release-key.keystore');
    if (!details.google_services.exists) missing.push('google-services.json');
    addResult(name, 'WARN', 'WARN', `${missing.join(', ')} missing`, details);
  }
}

// ── 6. SonarQube ────────────────────────────────────────────────────────────

async function checkSonarQube() {
  const name = 'SonarQube';
  const details = {};

  try {
    const res = await httpsGet('http://localhost:9000/api/system/status');
    details.statusCode = res.statusCode;
    const data = safeJSON(res.body);
    details.status = data?.status || 'unknown';

    if (res.statusCode === 200 && data?.status === 'UP') {
      addResult(name, 'WARN', 'PASS', 'localhost:9000 reachable, status UP', details);
    } else {
      addResult(name, 'WARN', 'WARN', `Reachable but status=${data?.status || 'unknown'}`, details);
    }
  } catch (e) {
    addResult(name, 'WARN', 'SKIP', 'localhost:9000 not reachable', { error: e.message });
  }
}

// ── 7. Snyk ─────────────────────────────────────────────────────────────────
// DISABLED: Snyk private test quota exhausted — re-enable when quota resets
//
// async function checkSnyk() {
//   const name = 'Snyk';
//   const token = process.env.SNYK_TOKEN;
//   if (!token) {
//     addResult(name, 'WARN', 'SKIP', 'SNYK_TOKEN not set', {});
//     return;
//   }
//
//   const details = {};
//   try {
//     const res = await httpsGet('https://api.snyk.io/rest/self?version=2024-04-29', {
//       Authorization: `token ${token}`,
//     });
//     details.statusCode = res.statusCode;
//     const data = safeJSON(res.body);
//
//     if (res.statusCode === 200 && data?.data) {
//       details.username =
//         data.data.attributes?.username || data.data.attributes?.name || 'authenticated';
//       addResult(name, 'WARN', 'PASS', 'API authenticated', details);
//     } else {
//       details.error = data?.errors?.[0]?.detail || 'Unexpected response';
//       addResult(name, 'WARN', 'WARN', `Auth failed: ${details.error}`, details);
//     }
//   } catch (e) {
//     addResult(name, 'WARN', 'FAIL', `Snyk API error: ${e.message}`, { error: e.message });
//   }
// }

// ── 8. Ads Configuration ────────────────────────────────────────────────────

async function checkAdsConfig() {
  const name = 'Ads Config';
  const details = {};
  let consistent = true;

  // Check public/ads.txt
  const adsTxt = readProjectFile('public/ads.txt');
  if (adsTxt) {
    details.ads_txt = {
      exists: true,
      contains_publisher_id: adsTxt.includes(PUBLISHER_ID),
    };
    if (!adsTxt.includes(PUBLISHER_ID)) consistent = false;
  } else {
    details.ads_txt = { exists: false };
    consistent = false;
  }

  // Check AdMob App ID in capacitor.config.ts
  const capConfig = readProjectFile('capacitor.config.ts');
  if (capConfig) {
    const androidMatch = capConfig.includes(ADMOB_APP_ID_ANDROID);
    const iosMatch = capConfig.includes(ADMOB_APP_ID_IOS);
    details.capacitor_admob = {
      exists: true,
      admob_app_id_match: androidMatch && iosMatch,
      android: { expected: ADMOB_APP_ID_ANDROID, found: androidMatch },
      ios: { expected: ADMOB_APP_ID_IOS, found: iosMatch },
    };
    if (!androidMatch || !iosMatch) consistent = false;
  } else {
    details.capacitor_admob = { exists: false };
    consistent = false;
  }

  // Check GADApplicationIdentifier in iOS Info.plist
  const infoPlist = readProjectFile('ios/App/App/Info.plist');
  if (infoPlist) {
    const gadMatch = infoPlist.includes(ADMOB_APP_ID_IOS);
    details.ios_info_plist = {
      exists: true,
      gad_app_id_match: gadMatch,
      expected: ADMOB_APP_ID_IOS,
    };
    if (!gadMatch) consistent = false;
  } else {
    details.ios_info_plist = { exists: false };
  }

  // Check AdSense publisher ID in Makefile
  const makefile = readProjectFile('Makefile');
  if (makefile) {
    const fullPubId = `ca-pub-${PUBLISHER_ID.replace('pub-', '')}`;
    const makefileMatch = makefile.includes(PUBLISHER_ID) || makefile.includes(fullPubId);
    details.makefile_adsense = {
      exists: true,
      publisher_id_match: makefileMatch,
    };
    if (!makefileMatch) consistent = false;
  } else {
    details.makefile_adsense = { exists: false };
    consistent = false;
  }

  if (consistent) {
    addResult(name, 'WARN', 'PASS', 'Publisher IDs consistent', details);
  } else {
    const issues = [];
    if (!details.ads_txt?.contains_publisher_id) issues.push('ads.txt publisher ID');
    if (!details.capacitor_admob?.admob_app_id_match) issues.push('AdMob App ID');
    if (!details.ios_info_plist?.gad_app_id_match) issues.push('iOS GADApplicationIdentifier');
    if (!details.makefile_adsense?.publisher_id_match) issues.push('Makefile AdSense');
    addResult(name, 'WARN', 'WARN', `Inconsistencies: ${issues.join(', ')}`, details);
  }
}

// ── 9. IndexNow ─────────────────────────────────────────────────────────────

async function checkIndexNow() {
  const name = 'IndexNow';
  const keyFileName = `${INDEXNOW_KEY}.txt`;
  const localPath = `public/${keyFileName}`;
  const liveUrl = `https://anqr.link/${keyFileName}`;
  const details = { local_file: {}, live_url: {} };

  // Check local key file
  const localContent = readProjectFile(localPath);
  details.local_file.path = localPath;
  details.local_file.exists = localContent !== null;
  details.local_file.key_match = localContent !== null && localContent.trim() === INDEXNOW_KEY;

  if (!details.local_file.exists) {
    addResult(name, 'WARN', 'FAIL', `Local key file missing: ${localPath}`, details);
    return;
  }
  if (!details.local_file.key_match) {
    addResult(name, 'WARN', 'FAIL', `Local key file has wrong content`, details);
    return;
  }

  // Check live URL
  try {
    const res = await httpsGet(liveUrl);
    details.live_url.url = liveUrl;
    details.live_url.status_code = res.statusCode;
    details.live_url.key_match = res.statusCode === 200 && res.body.trim() === INDEXNOW_KEY;

    if (details.live_url.key_match) {
      addResult(name, 'WARN', 'PASS', 'Key file valid locally and live', details);
    } else if (res.statusCode !== 200) {
      addResult(
        name,
        'WARN',
        'WARN',
        `Local file OK but live URL returned HTTP ${res.statusCode}`,
        details
      );
    } else {
      addResult(
        name,
        'WARN',
        'WARN',
        'Local file OK but live URL body does not match key (not deployed?)',
        details
      );
    }
  } catch (e) {
    details.live_url.url = liveUrl;
    details.live_url.error = e.message;
    addResult(
      name,
      'WARN',
      'WARN',
      `Local file OK but live URL unreachable: ${e.message}`,
      details
    );
  }
}

// ── Runner ──────────────────────────────────────────────────────────────────

async function main() {
  const startTime = Date.now();

  console.log('');
  console.log('============================================');
  console.log('ANQR Third-Party Service Validation');
  console.log('============================================');
  console.log('');

  // Run all checks (some in parallel where independent)
  await Promise.all([
    checkNetlify(),
    checkSentry(),
    checkCloudflare(),
    checkLiveSite(),
    checkGooglePlay(),
    checkSonarQube(),
    // checkSnyk(), // DISABLED: Snyk private test quota exhausted — re-enable when quota resets
    checkAdsConfig(),
    checkIndexNow(),
  ]);

  // ── Console output ──────────────────────────────────────────────────────

  const statusIcon = { PASS: '✓', FAIL: '✗', WARN: '⚠', SKIP: '○' };
  const statusLabel = { PASS: 'PASS', FAIL: 'FAIL', WARN: 'WARN', SKIP: 'SKIP' };

  for (const r of results) {
    const _icon = statusIcon[r.status] || '?';
    const label = statusLabel[r.status] || r.status;
    console.log(`[${label}] ${r.name} — ${r.summary}`);
  }

  // ── Summary ─────────────────────────────────────────────────────────────

  const criticalChecks = results.filter((r) => r.level === 'CRITICAL');
  const criticalPassed = criticalChecks.filter((r) => r.status === 'PASS').length;
  const criticalTotal = criticalChecks.filter((r) => r.status !== 'SKIP').length;

  const warnings = results.filter((r) => r.status === 'WARN');
  const skipped = results.filter((r) => r.status === 'SKIP');

  console.log('');
  console.log(`Critical: ${criticalPassed}/${criticalTotal} passed`);
  if (warnings.length) {
    console.log(`Warnings: ${warnings.length} (${warnings.map((w) => w.name).join(', ')})`);
  }
  if (skipped.length) {
    console.log(`Skipped: ${skipped.length} (${skipped.map((s) => s.name).join(', ')})`);
  }
  console.log('');

  // ── JSON report ─────────────────────────────────────────────────────────

  const report = {
    title: 'ANQR Third-Party Service Validation',
    generated: new Date().toISOString(),
    durationMs: Date.now() - startTime,
    summary: {
      critical: { passed: criticalPassed, total: criticalTotal },
      warnings: warnings.length,
      skipped: skipped.length,
      allCriticalPassed: criticalPassed === criticalTotal,
    },
    results,
  };

  const reportsDir = path.join(PROJECT_ROOT, 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  const reportPath = path.join(reportsDir, 'third-party-validation.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
  console.log(`Report written to: ${path.relative(PROJECT_ROOT, reportPath)}`);
  console.log('');

  // ── Exit code ───────────────────────────────────────────────────────────

  const hasCriticalFailure = criticalChecks.some((r) => r.status === 'FAIL');
  process.exit(hasCriticalFailure ? 1 : 0);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
