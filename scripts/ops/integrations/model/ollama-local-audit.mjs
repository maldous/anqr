#!/usr/bin/env node

/**
 * ollama-local-audit.mjs — Local Ollama model availability and health
 *
 * Verifies:
 *   - Ollama service is running and reachable
 *   - Pinned model is available locally
 *   - Model responds to a trivial prompt within timeout
 *
 * Exit code:
 *   0 = Ollama healthy and model available
 *   1 = Ollama unavailable or model missing
 */

const OLLAMA_BASE = process.env.OLLAMA_API_BASE || "http://localhost:11434";
const PINNED_MODEL = "qwen3-coder-next:latest";
const PROMPT_TIMEOUT_MS = 60_000;
const PING_TIMEOUT_MS = 5_000;

const results = [];

function record(name, pass, detail) {
  const entry = { name, pass, detail, ts: new Date().toISOString() };
  results.push(entry);
  const icon = pass ? "✅" : "❌";
  console.log(`${icon} ${name}: ${detail}`);
}

async function checkReachable() {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);
    const res = await fetch(`${OLLAMA_BASE}/api/version`, { signal: controller.signal });
    clearTimeout(timer);
    const data = await res.json();
    record("ollama-reachable", true, `Ollama v${data.version} at ${OLLAMA_BASE}`);
    return true;
  } catch (err) {
    record("ollama-reachable", false, `Cannot reach Ollama at ${OLLAMA_BASE}: ${err.message}`);
    return false;
  }
}

async function checkModelAvailable() {
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/tags`);
    const data = await res.json();
    const models = (data.models || []).map((m) => m.name);
    const found = models.includes(PINNED_MODEL);
    if (found) {
      record("model-available", true, `${PINNED_MODEL} found in local model list`);
    } else {
      record(
        "model-available",
        false,
        `${PINNED_MODEL} not found. Available: ${models.join(", ") || "none"}`,
      );
    }
    return found;
  } catch (err) {
    record("model-available", false, `Failed to list models: ${err.message}`);
    return false;
  }
}

async function checkModelResponds() {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), PROMPT_TIMEOUT_MS);
    const start = Date.now();
    const res = await fetch(`${OLLAMA_BASE}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: PINNED_MODEL,
        prompt: "Reply OK",
        stream: false,
        options: { num_predict: 8, temperature: 0 },
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    const data = await res.json();
    const elapsed = Date.now() - start;
    const evalCount = data.eval_count || 0;
    if (evalCount > 0) {
      record("model-responds", true, `Model generated ${evalCount} tokens in ${elapsed}ms`);
      return true;
    }
    record("model-responds", false, `No tokens generated after ${elapsed}ms`);
    return false;
  } catch (err) {
    record("model-responds", false, `Prompt failed: ${err.message}`);
    return false;
  }
}

async function main() {
  console.log(`[ollama-local-audit] Checking ${PINNED_MODEL} at ${OLLAMA_BASE}\n`);

  const reachable = await checkReachable();
  if (!reachable) {
    printSummary();
    process.exit(1);
  }

  const available = await checkModelAvailable();
  if (!available) {
    printSummary();
    process.exit(1);
  }

  await checkModelResponds();
  printSummary();

  const allPassed = results.every((r) => r.pass);
  process.exit(allPassed ? 0 : 1);
}

function printSummary() {
  const passed = results.filter((r) => r.pass).length;
  const total = results.length;
  console.log(`\n[ollama-local-audit] ${passed}/${total} checks passed`);
}

await main();
