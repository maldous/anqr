export function isVoiceNoise(text) {
  if (!text || !text.trim()) return true;
  const t = text.trim();

  // Provider failure / fallback patterns (the primary complaint)
  const FAILED_PROVIDER_RE =
    /\b(groq|mistral|gemini|ollama|codex|codebuff|openai|anthropic|deepseek|together|fireworks|perplexity|cerebras)\b/i;
  const FAILURE_WORDS_RE = /\b(fail|error|unavailable|timed? ?out|reject|refused)\b/i;
  if (FAILED_PROVIDER_RE.test(t) && FAILURE_WORDS_RE.test(t)) return true;
  if (/rate.?limit(ed|ing)?/i.test(t)) return true;
  if (/trying\s+next\s+provider|falling\s*back|triggering\s+fallback/i.test(t)) return true;
  if (/provider.*cooldown|cooldown.*provider/i.test(t)) return true;
  if (/all\s+providers?\s+(fail|exhaust)/i.test(t)) return true;
  if (/no\s+providers?\s+available/i.test(t)) return true;

  // Anti-echo: Symphony bridge internal routing (these are never speakable)
  if (/^symphony bridge\b/i.test(t)) return true;
  if (/^resolving\s+\d+\s+merge\s+conflict/i.test(t)) return true;

  // Probe / test request announcements — startup probes are not real work
  if (/^(starting work on|finished)\s+(test\.?$|say\s)/i.test(t)) return true;
  if (/say\s+.?ok.?\s+if\s+you\s+can\s+read/i.test(t)) return true;
  if (/stream_error_with_output/i.test(t)) return true;

  // Internal bridge / harness status
  if (/credit.?gate\s+selected|adaptive.?context|token.?ceiling/i.test(t)) return true;
  if (/\bprobe\s+(fail|success|result|error)/i.test(t)) return true;
  if (/_symphonyResult|SSE\s+relay|transparent.*relay/i.test(t)) return true;
  if (/heartbeat|keep.?alive|ping.?pong/i.test(t)) return true;

  // HTTP error codes in error context
  if (/\bHTTP\s+[45]\d{2}\b/i.test(t)) return true;

  // Stack traces (multiple "at " lines)
  if (/^\s+at\s+\S+/m.test(t) && t.split("\n").filter((l) => /^\s+at\s/.test(l)).length > 1)
    return true;
  if (/^(Error|TypeError|RangeError|SyntaxError|ReferenceError):\s/m.test(t)) return true;

  // Provider metrics / telemetry (short messages about tokens)
  if (/\b(completion|prompt)\s+tokens?\b.*\d/i.test(t) && t.length < 200) return true;

  return false;
}
