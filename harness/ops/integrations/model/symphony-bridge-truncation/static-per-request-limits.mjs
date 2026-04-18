// ── Free-tier per-request token limits ─────────────────────────────────
// Some providers (especially free-cloud tiers) enforce per-request token
// limits that are MUCH lower than their published context windows.
// For example, Groq free-tier allows 131K context window but only 6K-12K
// tokens per request. Without these caps, the bridge sends oversized requests
// that get 413'd, causing ~60% fallback rate on first attempt.
//
// These are MAX INPUT tokens per request (prompt + completion combined),
// NOT context windows. Applied as caps in buildProviderMaxInputTokens().
//
// ── How to update these values ──────────────────────────────────────────
// 1. Run codex with SYMPHONY_DEBUG=1 and watch for 413/context_too_large errors:
//      journalctl --user -u anqr-symphony-codex -f | grep -E '413|tokens_limit_reached'
// 2. The error message includes the provider's actual limit, e.g.:
//      "Request body too large for ... 8000 tokens."
// 3. Update the corresponding entry below with the reported limit
// 4. Restart the codex bridge: systemctl --user restart anqr-symphony-codex
// 5. Verify with: curl -s http://127.0.0.1:4330/v1/stats | python3 -c '...'
//
// NOTE: These values WILL drift as providers change their free-tier limits.
// The adaptive context system (recordContextError) also reacts to 413 errors
// reactively, but proactive caps prevent wasted first-attempt tokens.
export const STATIC_PER_REQUEST_LIMITS = {
  // ── Groq free-tier per-request limits ──
  // Context window is 131K but free tier enforces these per-request caps.
  // See: 413 "tokens_limit_reached" errors with TPM limits in Groq API responses.
  groq: 12_000, // generic entry → llama-3.3-70b-versatile
  "groq-llama-3-1-8b-instant": 6_000,
  "groq-llama-3-3-70b-versatile": 12_000,
  "groq-openai-gpt-oss-120b": 12_000,
  "groq-openai-gpt-oss-20b": 12_000,
  "groq-qwen-qwen3-32b": 12_000,
  "groq-meta-llama-llama-4-scout-17b-16e-instruct": 12_000,
  "groq-allam-2-7b": 6_000,

  // ── GitHub Models per-request limits ──
  // Free tier has lower limits than published context windows.
  "github-models-meta-llama-4-maverick-17b-128e-instruct-fp8": 8_000,

  // ── Cerebras free-tier per-request limits ──
  // Context window is 8K, free tier matches closely but with overhead.
  cerebras: 7_000, // generic entry → llama3.1-8b
  "cerebras-llama3-1-8b": 7_000,
  "cerebras-qwen-3-235b-a22b-instruct-2507": 7_000,
  "cerebras-gpt-oss-120b": 7_000,
};

// ── Provider prefix defaults ──────────────────────────────────────────
// When a provider name matches a prefix below but has no specific entry in
// STATIC_PER_REQUEST_LIMITS or the discovered cache, apply this default cap.
// This covers NEW models added by providers after the static table was written.
// Evaluated as: first matching prefix wins (prefixes don't overlap, so order doesn't matter).
export const PROVIDER_PREFIX_DEFAULTS = [
  { prefix: "groq-", defaultLimit: 12_000 },
  { prefix: "cerebras-", defaultLimit: 7_000 },
  { prefix: "github-models-", defaultLimit: 8_000 },
  { prefix: "sambanova-", defaultLimit: 16_000 },
  { prefix: "huggingface-", defaultLimit: 8_000 },
];
