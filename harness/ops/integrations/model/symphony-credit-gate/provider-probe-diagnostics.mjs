import fs from "node:fs/promises";
import path from "node:path";

import { Codex } from "@openai/codex-sdk";

import { PROJECT_ROOT } from "./project-root.mjs";
import { CODEX_PROBE_TIMEOUT_MS } from "./codex-probe-timeout-ms.mjs";
import { CODEX_SANDBOX_MODE } from "./codex-sandbox-mode.mjs";
import { PROVIDERS } from "./providers.mjs";
import { PREFERRED_PROVIDER_ORDER } from "./preferred-provider-order.mjs";
import { getRankedProviders } from "./get-ranked-providers.mjs";
import { getProviderStats } from "./get-provider-stats.mjs";
import { resolveProviderApiKey } from "./resolve-provider-api-key.mjs";
import { probeCodebuffDetailed } from "./probe-codebuff-detailed.mjs";
import { PROBE_TIMEOUT_MS } from "./probe-timeout-ms.mjs";
import { LOCAL_PROBE_TIMEOUT_MS } from "./local-probe-timeout-ms.mjs";
import { shuffleArray } from "./shuffle-array.mjs";
import { providerGatewayKey } from "./provider-gateway-key.mjs";
import { buildRankedHealthyMarkdownLines } from "./build-ranked-healthy-markdown-lines.mjs";

import { BRIDGE_PROVIDER_BLOCKLIST } from "../symphony-openai-bridge/bridge-provider-blocklist.mjs";
import { BRIDGE_PROVIDER_BLOCKLIST_REASONS } from "../symphony-openai-bridge/bridge-provider-blocklist-reasons.mjs";
import { ADVERTISED_MODELS } from "../symphony-openai-bridge/advertised-models.mjs";
import { KNOWN_TOOL_CAPABLE } from "../symphony-openai-bridge/known-tool-capable.mjs";
import { probeToolCapabilityForProvider } from "../symphony-openai-bridge/probe-tool-capability-for-provider.mjs";

function truncate(value, max = 1200) {
  const text = String(value || "").trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function classifyErrorMessage(message) {
  const normalized = String(message || "").toLowerCase();
  if (!normalized) return { status: "provider_error", reason: "empty error" };
  if (normalized.includes("not set") || normalized.includes("missing") || normalized.includes("no ")) {
    return { status: "auth_missing", reason: "missing credentials or configuration" };
  }
  if (normalized.includes("401") || normalized.includes("unauthorized") || normalized.includes("invalid api key") || normalized.includes("forbidden")) {
    return { status: "auth_invalid", reason: "credentials rejected" };
  }
  if (normalized.includes("402") || normalized.includes("quota") || normalized.includes("credits") || normalized.includes("payment required") || normalized.includes("credit limit exceeded")) {
    return { status: "quota_exhausted", reason: "provider quota or credits exhausted" };
  }
  if (normalized.includes("429") || normalized.includes("rate limit") || normalized.includes("too many requests") || normalized.includes("weekly limit") || normalized.includes("session limit")) {
    return { status: "rate_limited", reason: "provider rate limit" };
  }
  if (normalized.includes("timeout") || normalized.includes("timed out") || normalized.includes("abort")) {
    return { status: "timeout", reason: "probe timed out" };
  }
  if (normalized.includes("enotfound") || normalized.includes("econnrefused") || normalized.includes("network") || normalized.includes("fetch failed")) {
    return { status: "network_error", reason: "network or DNS failure" };
  }
  return { status: "provider_error", reason: "provider probe failed" };
}

function classifyHttpStatus(status) {
  if (status === 401 || status === 403) return { status: "auth_invalid", reason: `HTTP ${status}` };
  if (status === 402) return { status: "quota_exhausted", reason: `HTTP ${status}` };
  if (status === 408 || status === 504) return { status: "timeout", reason: `HTTP ${status}` };
  if (status === 429) return { status: "rate_limited", reason: `HTTP ${status}` };
  if (status >= 500) return { status: "provider_error", reason: `HTTP ${status}` };
  return { status: "unavailable", reason: `HTTP ${status}` };
}

async function fetchWithTimeout(url, options = {}, timeoutMs = PROBE_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  timer.unref?.();
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function getRouteInfo(provider) {
  const advertised = ADVERTISED_MODELS.filter((entry) => entry.allowedNames?.includes(provider.name));
  return {
    advertisedRouteIds: advertised.map((entry) => entry.id),
    isBridgeBlocked: BRIDGE_PROVIDER_BLOCKLIST.has(provider.name),
    bridgeBlockReason: BRIDGE_PROVIDER_BLOCKLIST_REASONS[provider.name] || null,
    knownToolCapable: KNOWN_TOOL_CAPABLE.has(provider.name),
  };
}

function catalogIncludesModel(body, model) {
  if (!body) return false;
  try {
    const parsed = JSON.parse(body);
    const values = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed?.data)
        ? parsed.data
        : Array.isArray(parsed?.models)
          ? parsed.models
          : [];
    return values.some((entry) => {
      const id = String(entry?.id || entry?.name || entry?.model || '').toLowerCase();
      return id === String(model || '').toLowerCase() || id.includes(String(model || '').toLowerCase());
    });
  } catch {
    return body.toLowerCase().includes(String(model || '').toLowerCase());
  }
}

async function probeCodexDetailed(provider, apiKey) {
  const startedAt = Date.now();
  const stages = [];
  if (!apiKey) {
    return { available: false, status: "auth_missing", reason: "OPENAI_API_KEY is not set for Codex SDK", durationMs: Date.now() - startedAt, message: "OPENAI_API_KEY is not set", stages };
  }
  try {
    stages.push({ name: "sdk_started", at: new Date().toISOString(), model: provider.model });
    const codex = new Codex({ env: process.env });
    const thread = codex.startThread({ model: provider.model || undefined, workingDirectory: PROJECT_ROOT, sandboxMode: CODEX_SANDBOX_MODE, approvalPolicy: "never", webSearchEnabled: false, networkAccessEnabled: false });
    const result = await Promise.race([
      thread.run("Reply with exactly: ok"),
      new Promise((_, reject) => {
        const timer = setTimeout(() => reject(new Error(`Codex SDK probe timed out after ${CODEX_PROBE_TIMEOUT_MS}ms`)), CODEX_PROBE_TIMEOUT_MS);
        timer.unref?.();
      }),
    ]);
    const finalResponse = truncate(result?.finalResponse || "");
    stages.push({ name: "sdk_succeeded", at: new Date().toISOString(), responsePreview: finalResponse });
    return { available: Boolean(finalResponse), status: finalResponse ? "success" : "unavailable", reason: finalResponse ? "Codex SDK probe succeeded" : "Codex SDK returned empty response", durationMs: Date.now() - startedAt, message: finalResponse, stages };
  } catch (error) {
    const classified = classifyErrorMessage(error?.message || error);
    stages.push({ name: "sdk_failed", at: new Date().toISOString(), status: classified.status, message: truncate(error?.message || error) });
    return { available: false, status: classified.status, reason: classified.reason, durationMs: Date.now() - startedAt, message: truncate(error?.message || error), stages };
  }
}

async function probeHttpModelList(provider, apiKey, options = {}) {
  const startedAt = Date.now();
  const stages = [];
  const timeoutMs = options.timeoutMs || PROBE_TIMEOUT_MS;
  const url = options.url || `${provider.baseUrl}/models`;
  const headers = options.headers || (apiKey ? { Authorization: `Bearer ${apiKey}` } : {});
  try {
    stages.push({ name: "fetch_started", at: new Date().toISOString(), url, timeoutMs });
    const response = await fetchWithTimeout(url, { headers }, timeoutMs);
    const body = await response.text();
    stages.push({ name: "fetch_completed", at: new Date().toISOString(), status: response.status });
    if (!response.ok) {
      const http = classifyHttpStatus(response.status);
      return { available: false, status: http.status, reason: `${http.reason}: ${truncate(body, 300)}`, durationMs: Date.now() - startedAt, message: truncate(body), httpStatus: response.status, stages };
    }
    const available = catalogIncludesModel(body, provider.model);
    return { available, status: available ? "success" : "unsupported", reason: available ? "model found in provider catalog" : "model missing from provider catalog", durationMs: Date.now() - startedAt, message: truncate(body), httpStatus: response.status, stages };
  } catch (error) {
    const classified = classifyErrorMessage(error?.message || error);
    stages.push({ name: "fetch_failed", at: new Date().toISOString(), status: classified.status });
    return { available: false, status: classified.status, reason: classified.reason, durationMs: Date.now() - startedAt, message: truncate(error?.message || error), stages };
  }
}

async function probeGeminiDetailed(provider, apiKey) {
  return probeHttpModelList(provider, apiKey, { url: `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}` });
}

async function probeGitHubModelsDetailed(provider, apiKey) {
  return probeHttpModelList(provider, apiKey, {
    url: "https://models.github.ai/catalog/models",
    headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${apiKey}`, "X-GitHub-Api-Version": "2022-11-28" },
  });
}

async function probeOllamaDetailed(provider) {
  const base = (provider.baseUrl || 'http://127.0.0.1:11434/v1').replace(/\/v1\/?$/, "");
  return probeHttpModelList(provider, "", { url: `${base}/api/tags`, headers: {}, timeoutMs: LOCAL_PROBE_TIMEOUT_MS });
}

async function probeProvider(provider) {
  const apiKey = await resolveProviderApiKey(provider);
  const routeInfo = getRouteInfo(provider);
  const baseResult = { providerName: provider.name, model: provider.model, driver: provider.driver || "openai-compatible", tier: provider.tier || "free-cloud", envVar: provider.envVar || null, hasCredential: Boolean(apiKey), routeInfo };
  if (provider.envVar && !apiKey) {
    return { ...baseResult, available: false, status: "auth_missing", reason: `${provider.envVar} is not set`, durationMs: 0, message: `${provider.envVar} is not set`, stages: [{ name: "env_missing", at: new Date().toISOString(), envVar: provider.envVar }] };
  }
  let details;
  if (provider.name === "codex" || provider.driver === "codex-sdk") details = await probeCodexDetailed(provider, apiKey);
  else if (provider.name === "codebuff" || provider.driver === "codebuff-sdk") details = await probeCodebuffDetailed(provider);
  else if (provider.name === "gemini" || provider.name === "gemini-lite") details = await probeGeminiDetailed(provider, apiKey);
  else if (provider.name === "github-models") details = await probeGitHubModelsDetailed(provider, apiKey);
  else if ((provider.baseUrl || '').includes("localhost") || (provider.baseUrl || '').includes("127.0.0.1")) details = await probeOllamaDetailed(provider);
  else details = await probeHttpModelList(provider, apiKey, { timeoutMs: (provider.baseUrl || '').includes("openrouter") ? PROBE_TIMEOUT_MS * 2 : PROBE_TIMEOUT_MS });
  return { ...baseResult, ...details };
}

function buildSelectorSummary(results) {
  const byName = new Map(results.map((result) => [result.providerName, result]));
  const sequence = [];
  const seen = new Set();
  const pushName = (name, source) => {
    if (!name || seen.has(name)) return;
    seen.add(name);
    sequence.push({ name, source });
  };
  for (const name of PREFERRED_PROVIDER_ORDER) pushName(name, "preferred");
  for (const ranked of getRankedProviders()) pushName(ranked.name, "ranked");
  for (const provider of PROVIDERS) pushName(provider.name, "fallback");
  let wouldChoose = null;
  const ordered = sequence.map((entry) => {
    const result = byName.get(entry.name);
    const toolStatus = result?.toolProbe?.status || '';
    const selectable = Boolean(result && (result.status === "success" || result.status === "degraded") && (!result.toolProbe || ['capable','sdk-capable','known-capable','safety-net-always-allowed'].includes(toolStatus)));
    if (!wouldChoose && selectable) wouldChoose = { providerName: entry.name, source: entry.source, status: result.status, reason: result.reason };
    return { providerName: entry.name, source: entry.source, status: result?.status || "missing", reason: result?.reason || "provider missing from probe results", selectable };
  });
  return { wouldChoose, sequence: ordered };
}

function buildFailureBreakdown(results) {
  const breakdown = {};
  for (const result of results) breakdown[result.status] = (breakdown[result.status] || 0) + 1;
  return breakdown;
}

function buildMarkdown(report) {
  const lines = [];
  lines.push('# Provider probe diagnostics');
  lines.push('');
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- Providers probed: ${report.summary.total}`);
  lines.push(`- Healthy: ${report.summary.healthy}`);
  lines.push(`- Degraded: ${report.summary.degraded}`);
  lines.push(`- Failed: ${report.summary.failed}`);
  lines.push(`- Bridge-blocked: ${report.summary.bridgeBlocked}`);
  lines.push(report.selector.wouldChoose ? `- Selector would choose: ${report.selector.wouldChoose.providerName} via ${report.selector.wouldChoose.source} (${report.selector.wouldChoose.status})` : '- Selector would choose: none');
  lines.push('');
  lines.push(...buildRankedHealthyMarkdownLines(report.rankedProviders, report.providerStats, report.results));
  lines.push('## Provider results');
  lines.push('');
  lines.push('| Provider | Model | Status | Duration ms | Reason | Routes | Bridge | Tool-capable | Tool status | Tool reason |');
  lines.push('|---|---|---:|---:|---|---|---|---|---|---|');
  for (const result of report.results) {
    lines.push(`| ${result.providerName} | ${result.model} | ${result.status} | ${result.durationMs} | ${result.reason} | ${result.routeInfo.advertisedRouteIds.join(', ') || '-'} | ${result.routeInfo.isBridgeBlocked ? `blocked: ${result.routeInfo.bridgeBlockReason}` : 'ok'} | ${result.routeInfo.knownToolCapable ? 'yes' : 'no'} | ${result.toolProbe?.status || '-'} | ${result.toolProbe?.detail || result.toolProbe?.reason || '-'} |`);
  }
  lines.push('');
  lines.push('## Selector order');
  lines.push('');
  lines.push('| Source | Provider | Status | Selectable | Reason |');
  lines.push('|---|---|---|---|---|');
  for (const entry of report.selector.sequence) lines.push(`| ${entry.source} | ${entry.providerName} | ${entry.status} | ${entry.selectable ? 'yes' : 'no'} | ${entry.reason} |`);
  lines.push('');
  lines.push('## Failure breakdown');
  lines.push('');
  for (const [status, count] of Object.entries(report.failureBreakdown)) lines.push(`- ${status}: ${count}`);
  lines.push('');
  return `${lines.join('\n').trim()}\n`;
}

export async function runProviderProbeDiagnostics(options = {}) {
  const outputDir = options.outputDir || path.join(PROJECT_ROOT, 'reports', 'provider-probes');
  const generatedAt = new Date().toISOString();
  const gatewayCooldowns = new Map();
  const results = [];
  for (const provider of shuffleArray(PROVIDERS)) {
    const gateway = providerGatewayKey(provider);
    const cooldown = gatewayCooldowns.get(gateway);
    let result;
    if (cooldown) {
      result = {
        providerName: provider.name,
        model: provider.model,
        driver: provider.driver || 'openai-compatible',
        tier: provider.tier || 'free-cloud',
        envVar: provider.envVar || null,
        hasCredential: Boolean(await resolveProviderApiKey(provider)),
        routeInfo: getRouteInfo(provider),
        available: false,
        status: 'cooling_down',
        reason: `skipped due to gateway cooldown after ${cooldown.status}`,
        durationMs: 0,
        message: cooldown.reason,
        stages: [{ name: 'gateway_cooldown', at: new Date().toISOString(), gateway, reason: cooldown.reason }],
      };
    } else {
      result = await probeProvider(provider);
      if (['rate_limited', 'quota_exhausted', 'auth_invalid'].includes(result.status)) {
        gatewayCooldowns.set(gateway, { status: result.status, reason: result.reason });
      }
    }

    if (result.available || result.status === 'degraded' || result.routeInfo.knownToolCapable) {
      if (['success','degraded'].includes(result.status) || result.routeInfo.knownToolCapable) {
        result.toolProbe = await probeToolCapabilityForProvider(provider);
      } else {
        result.toolProbe = { name: provider.name, status: 'skipped', reason: 'skipped-after-access-failure', detail: result.reason };
      }
    } else {
      result.toolProbe = { name: provider.name, status: 'skipped', reason: 'skipped-after-access-failure', detail: result.reason };
    }

    results.push(result);
  }

  const selector = buildSelectorSummary(results);
  const failureBreakdown = buildFailureBreakdown(results);
  const providerStats = getProviderStats();
  const rankedProviders = getRankedProviders();
  const healthy = results.filter((result) => (result.status === 'success' || result.status === 'degraded') && ['capable','sdk-capable','known-capable','safety-net-always-allowed'].includes(result.toolProbe?.status || '')).length;
  const degraded = results.filter((result) => (result.status === 'success' || result.status === 'degraded') && !['capable','sdk-capable','known-capable','safety-net-always-allowed'].includes(result.toolProbe?.status || '')).length;
  const failed = results.length - healthy - degraded;
  const report = { generatedAt, results, selector, failureBreakdown, providerStats, rankedProviders, summary: { total: results.length, healthy, degraded, failed, bridgeBlocked: results.filter((result) => result.routeInfo.isBridgeBlocked).length } };

  await fs.mkdir(outputDir, { recursive: true });
  const stamp = generatedAt.replace(/[:.]/g, '-');
  const jsonPath = path.join(outputDir, `provider-probe-report.${stamp}.json`);
  const mdPath = path.join(outputDir, `provider-probe-report.${stamp}.md`);
  const latestJsonPath = path.join(outputDir, 'provider-probe-report.latest.json');
  const latestMdPath = path.join(outputDir, 'provider-probe-report.latest.md');
  await fs.writeFile(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  await fs.writeFile(mdPath, buildMarkdown(report));
  await fs.writeFile(latestJsonPath, `${JSON.stringify(report, null, 2)}\n`);
  await fs.writeFile(latestMdPath, buildMarkdown(report));
  return { report, jsonPath, mdPath, latestJsonPath, latestMdPath };
}
