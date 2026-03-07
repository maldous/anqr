#!/usr/bin/env python3
"""Model Injector Proxy — fixes Codex CLI model=None bug.

Codex CLI v0.110.0 has a bug where `-c model=X` isn't forwarded to the
/v1/responses API request, sending model=None instead. This proxy sits
between Codex (port 4011) and LiteLLM (port 4010), reading the desired
model name from a state file and injecting it into the request body.

The credit-gate writes the model name to the state file before exec'ing
Codex, so each session gets the correct model routed through LiteLLM.

Error handling: Detects all 13 HTTP error classes (400-504) plus 15+
stream-embedded error patterns. Writes per-provider cooldown files so
the credit-gate skips failing providers and cascades to the next one.
Supports Retry-After header parsing for 429 responses. Uses cross-chunk
sliding buffer for stream error detection.

Usage:
    python3 model-injector-proxy.py

Environment variables:
    UPSTREAM_HOST   LiteLLM host (default: 127.0.0.1)
    UPSTREAM_PORT   LiteLLM port (default: 4010)
    LISTEN_PORT     Proxy listen port (default: 4011)
    MODEL_FILE      Path to state file with current model name
    DEFAULT_MODEL   Fallback model if state file is missing (default: groq-llama-70b)
"""

import gzip
import http.client
import http.server
import json
import os
import socketserver
import subprocess
import sys
import threading
import time

UPSTREAM_HOST = os.environ.get("UPSTREAM_HOST", "127.0.0.1")
UPSTREAM_PORT = int(os.environ.get("UPSTREAM_PORT", "4010"))
LISTEN_PORT = int(os.environ.get("LISTEN_PORT", "4011"))
DEFAULT_MODEL = os.environ.get("DEFAULT_MODEL", "groq-llama-70b")
MODEL_FILE = os.environ.get(
    "MODEL_FILE",
    os.path.join(
        os.environ.get("XDG_RUNTIME_DIR", f"/run/user/{os.getuid()}"),
        "credit-gate",
        "current-model",
    ),
)

ZSTD_MAGIC = b"\x28\xb5\x2f\xfd"
GZIP_MAGIC = b"\x1f\x8b"
UNSUPPORTED_RESPONSE_FIELDS = {
    "supports_function_calling",
    "web_search_options",
}

# Max provider switches per request for in-session failover.
MAX_FAILOVER_ATTEMPTS = 3

# Providers that don't support /v1/responses (LiteLLM can't translate).
# These are pre-excluded from the failover chain for /responses requests.
# GitHub Models uses openai/ prefix + api_base in LiteLLM, which tries to
# call the OpenAI responses API directly on models.github.ai — but that
# endpoint only has /chat/completions, causing 404s on every attempt.
_RESPONSES_INCOMPATIBLE_PROVIDERS: set[str] = {"github"}

# ---------------------------------------------------------------------------
# Cooldown durations (seconds) — one per HTTP error class.
# The model-injector writes cooldown files; the credit-gate reads them to
# skip providers that cannot serve the current conversation.
# ---------------------------------------------------------------------------
RATELIMIT_WINDOW = 60       # count 429s within this many seconds
RATELIMIT_THRESHOLD = 1     # immediate cooldown on first 429 — providers don't accidentally return 429
RATELIMIT_COOLDOWN = 120    # 429 Too Many Requests — transient, moderate skip
BAD_REQUEST_COOLDOWN = 300    # 400 Bad Request — provider rejects message format, persistent for conversation
AUTH_FAILURE_COOLDOWN = 1800  # 401 Unauthorized — API key invalid/expired, won't self-heal
PAYMENT_REQUIRED_COOLDOWN = 3600  # 402 Payment Required — credits exhausted, very persistent
FORBIDDEN_COOLDOWN = 600      # 403 Forbidden — moderation/access denied, persistent for content
NOT_FOUND_COOLDOWN = 300      # 404 Not Found — model config broken, needs manual fix
TIMEOUT_COOLDOWN = 60         # 408 Request Timeout — transient, brief skip
CONTEXT_LIMIT_COOLDOWN = 600  # 413 Payload Too Large — conversation won't shrink, skip longer
UNPROCESSABLE_COOLDOWN = 300  # 422 Unprocessable Entity — request format rejected, same as 400
SERVER_ERROR_COOLDOWN = 180   # 500 Internal Server Error — LiteLLM translation bugs (e.g. missing tool call)
BAD_GATEWAY_COOLDOWN = 120    # 502 Bad Gateway — transient upstream failure
SERVICE_UNAVAILABLE_COOLDOWN = 180  # 503 Service Unavailable — service down, moderate
GATEWAY_TIMEOUT_COOLDOWN = 120  # 504 Gateway Timeout — upstream timeout, transient
SERVICE_OVERLOAD_COOLDOWN = 120  # "high demand" / stream-embedded overload — no HTTP status code
QUOTA_EXHAUSTED_COOLDOWN = 1800  # insufficient_quota in stream — persistent, same as auth failure
GEMINI_FREE_TIER_COOLDOWN = 86400  # Gemini free-tier daily limit — 20 req/day, resets after 24hr

# Dispatch table: HTTP status → (cooldown_seconds, human_label).
# 429 is handled separately via _record_ratelimit (with Retry-After support).
_STATUS_COOLDOWN_MAP: dict[int, tuple[int, str]] = {
    400: (BAD_REQUEST_COOLDOWN, "400 Bad Request"),
    401: (AUTH_FAILURE_COOLDOWN, "401 Unauthorized"),
    402: (PAYMENT_REQUIRED_COOLDOWN, "402 Payment Required"),
    403: (FORBIDDEN_COOLDOWN, "403 Forbidden"),
    404: (NOT_FOUND_COOLDOWN, "404 Not Found"),
    408: (TIMEOUT_COOLDOWN, "408 Request Timeout"),
    413: (CONTEXT_LIMIT_COOLDOWN, "413 Payload Too Large"),
    422: (UNPROCESSABLE_COOLDOWN, "422 Unprocessable Entity"),
    500: (SERVER_ERROR_COOLDOWN, "500 Internal Server Error"),
    502: (BAD_GATEWAY_COOLDOWN, "502 Bad Gateway"),
    503: (SERVICE_UNAVAILABLE_COOLDOWN, "503 Service Unavailable"),
    504: (GATEWAY_TIMEOUT_COOLDOWN, "504 Gateway Timeout"),
}

CONNECT_TIMEOUT = 60   # seconds — covers TCP connect + sending request body
READ_TIMEOUT = 600      # seconds — generous for long streaming generations
STATE_DIR = os.path.join(
    os.environ.get("XDG_RUNTIME_DIR", f"/run/user/{os.getuid()}"),
    "credit-gate",
)

_ratelimit_lock = threading.Lock()
_ratelimit_hits: dict[str, list[float]] = {}

# Map LiteLLM model aliases to provider names used by the credit-gate.
_MODEL_PROVIDER_MAP = {
    "groq-llama-70b": "groq",
    "gemini-flash": "gemini",
    "gemini-flash-lite": "gemini-lite",
    "cerebras-llama-8b": "cerebras",
    "openrouter-free": "openrouter-free",
    "sambanova-llama-70b": "sambanova",
    "mistral-codestral": "mistral",
    "mistral-small": "mistral",
    "github-gpt41-mini": "github",
    "qwen2.5-coder-7b-32t": "litellm-ollama",
}

# Ordered list of (litellm_model_alias, provider_name) matching credit-gate priority.
_PROVIDER_FALLBACK_CHAIN: list[tuple[str, str]] = [
    ("groq-llama-70b", "groq"),
    ("mistral-codestral", "mistral"),
    ("gemini-flash", "gemini"),
    ("gemini-flash-lite", "gemini-lite"),
    ("openrouter-free", "openrouter-free"),
    ("sambanova-llama-70b", "sambanova"),
    ("cerebras-llama-8b", "cerebras"),
    ("github-gpt41-mini", "github"),
    ("qwen2.5-coder-7b-32t", "litellm-ollama"),
]


def _model_to_provider(model: str) -> str:
    """Map a LiteLLM model alias to a credit-gate provider name."""
    if model in _MODEL_PROVIDER_MAP:
        return _MODEL_PROVIDER_MAP[model]
    if model.startswith("groq"):
        return "groq"
    if model.startswith("gemini"):
        return "gemini"
    if model.startswith("openrouter-free"):
        return "openrouter-free"
    if model.startswith("openrouter"):
        return "openrouter-free"
    if model.startswith("cerebras"):
        return "cerebras"
    if model.startswith("sambanova"):
        return "sambanova"
    if model.startswith("mistral"):
        return "mistral"
    if model.startswith("github"):
        return "github"
    if model.startswith("qwen2.5-coder"):
        return "litellm-ollama"
    if model.startswith("llama3.1"):
        return "litellm-ollama"
    return ""


def _parse_retry_after(header_value: str | None) -> int:
    """Parse Retry-After header to seconds. Returns 0 if absent or unparseable."""
    if not header_value:
        return 0
    try:
        return max(0, int(header_value))
    except ValueError:
        return 0


def _record_ratelimit(provider: str, retry_after_secs: int = 0) -> None:
    """Record a 429 hit and write cooldown file if threshold exceeded.

    If retry_after_secs is provided (from Retry-After header), use the
    larger of that value and RATELIMIT_COOLDOWN.
    """
    cooldown = max(RATELIMIT_COOLDOWN, retry_after_secs) if retry_after_secs else RATELIMIT_COOLDOWN
    now = time.time()
    with _ratelimit_lock:
        hits = _ratelimit_hits.setdefault(provider, [])
        hits.append(now)
        cutoff = now - RATELIMIT_WINDOW
        _ratelimit_hits[provider] = [t for t in hits if t > cutoff]
        if len(_ratelimit_hits[provider]) >= RATELIMIT_THRESHOLD:
            _write_cooldown(provider, int(now) + cooldown)
            _ratelimit_hits[provider] = []


def _write_cooldown(provider: str, expiry: int) -> None:
    """Atomically write a cooldown expiry file for the credit-gate to read."""
    rl_file = os.path.join(STATE_DIR, f"ratelimit-{provider}")
    tmp = f"{rl_file}.{os.getpid()}-{threading.get_ident()}"
    try:
        os.makedirs(STATE_DIR, mode=0o700, exist_ok=True)
        with open(tmp, "w") as f:
            f.write(f"{expiry}\n")
        os.replace(tmp, rl_file)
    except OSError:
        pass


def _is_provider_cooled_down(provider: str) -> bool:
    """Check if a provider has an active cooldown file (expiry in the future)."""
    if not provider:
        return False
    rl_file = os.path.join(STATE_DIR, f"ratelimit-{provider}")
    try:
        with open(rl_file) as f:
            expiry = int(f.read().strip())
        return time.time() < expiry
    except (OSError, ValueError):
        return False


def _select_next_provider(exclude: set[str]) -> tuple[str, str] | None:
    """Select next healthy provider from the fallback chain.

    Walks from index 0, skipping providers in *exclude* or with active
    cooldown.  Returns (model, provider) or None if all exhausted.
    """
    for model, provider in _PROVIDER_FALLBACK_CHAIN:
        if provider in exclude:
            continue
        if _is_provider_cooled_down(provider):
            continue
        return model, provider
    return None


def _update_current_model(model: str) -> None:
    """Atomically update MODEL_FILE so subsequent requests use the new model."""
    tmp = f"{MODEL_FILE}.{os.getpid()}-{threading.get_ident()}"
    try:
        os.makedirs(os.path.dirname(MODEL_FILE), mode=0o700, exist_ok=True)
        with open(tmp, "w") as f:
            f.write(f"{model}\n")
        os.replace(tmp, MODEL_FILE)
    except OSError:
        pass


def _is_models_endpoint(path: str) -> bool:
    """True for GET /models or /v1/models (list endpoints, not detail)."""
    clean = path.split("?")[0].rstrip("/")
    return clean.endswith("/models")


def decompress_body(body: bytes, content_encoding: str) -> bytes:
    """Decompress request body for zstd/gzip payloads from Codex CLI."""
    if not body:
        return body

    encoding = (content_encoding or "").lower()

    if encoding == "zstd" or body[:4] == ZSTD_MAGIC:
        try:
            result = subprocess.run(
                ["zstd", "-d", "--stdout"],
                input=body,
                capture_output=True,
                timeout=5,
            )
            if result.returncode == 0:
                return result.stdout
        except (subprocess.TimeoutExpired, FileNotFoundError):
            pass

    if encoding == "gzip" or body[:2] == GZIP_MAGIC:
        try:
            return gzip.decompress(body)
        except OSError:
            pass

    return body


def read_model() -> str:
    try:
        with open(MODEL_FILE) as f:
            model = f.read().strip()
            if model:
                return model
    except OSError:
        pass
    return DEFAULT_MODEL


def strip_unsupported_fields(value):
    """Recursively strip known provider-incompatible request fields."""
    removed = set()

    def _walk(node):
        if isinstance(node, dict):
            cleaned = {}
            for key, subval in node.items():
                if key in UNSUPPORTED_RESPONSE_FIELDS:
                    removed.add(key)
                    continue
                cleaned[key] = _walk(subval)
            return cleaned
        if isinstance(node, list):
            return [_walk(item) for item in node]
        return node

    return _walk(value), removed


class ProxyHandler(http.server.BaseHTTPRequestHandler):
    server_version = "model-injector/1.0"
    protocol_version = "HTTP/1.0"

    def log_message(self, fmt, *args):
        sys.stderr.write(
            f"[model-injector] {self.log_date_time_string()} {fmt % args}\n"
        )

    def do_GET(self):
        if self.path == "/health":
            self.send_response_only(200)
            self.send_header("Content-Type", "text/plain")
            self.send_header("Content-Length", "2")
            self.end_headers()
            self.wfile.write(b"ok")
            return
        self._proxy()

    def do_POST(self):
        self._proxy()

    def do_PUT(self):
        self._proxy()

    def do_DELETE(self):
        self._proxy()

    def do_OPTIONS(self):
        self._proxy()

    def _proxy(self):
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length) if content_length > 0 else b""

        _is_responses_post = (self.command == "POST" and "/responses" in self.path)

        body_rewritten = False
        if body and "/responses" in self.path and self.command == "POST":
            try:
                content_encoding = self.headers.get("Content-Encoding", "")
                raw = decompress_body(body, content_encoding)
                data = json.loads(raw)
                model_val = data.get("model")
                if not model_val or str(model_val) in ("None", "null", ""):
                    injected = read_model()
                    data["model"] = injected
                    self.log_message("Injected model=%s", injected)

                data, removed = strip_unsupported_fields(data)
                if removed:
                    removed_keys = ",".join(sorted(removed))
                    self.log_message("Stripped unsupported fields=%s", removed_keys)

                # Always forward uncompressed — simpler and LiteLLM handles it fine.
                body = json.dumps(data).encode()
                body_rewritten = True
            except (json.JSONDecodeError, KeyError, TypeError, UnicodeDecodeError, OSError):
                pass

        headers = {}
        for key, val in self.headers.items():
            lk = key.lower()
            if lk in ("host", "content-length"):
                continue
            if lk == "content-encoding" and body_rewritten:
                continue
            headers[key] = val
        headers["Content-Length"] = str(len(body))
        headers["Host"] = f"{UPSTREAM_HOST}:{UPSTREAM_PORT}"

        try:
            if _is_responses_post:
                _tried_providers: set[str] = set(_RESPONSES_INCOMPATIBLE_PROVIDERS)
                _raw_body = body  # save for re-injection

                for _failover_attempt in range(MAX_FAILOVER_ATTEMPTS + 1):
                    _fo_model = read_model()
                    _fo_provider = _model_to_provider(_fo_model)

                    # POINT A: Provider already cooled down or already tried
                    if _fo_provider and (
                        _is_provider_cooled_down(_fo_provider)
                        or _fo_provider in _tried_providers
                    ):
                        _exclude = set(_tried_providers)
                        _exclude.add(_fo_provider)
                        _next = _select_next_provider(_exclude)
                        if _next and _failover_attempt < MAX_FAILOVER_ATTEMPTS:
                            _update_current_model(_next[0])
                            self.log_message(
                                "Failover A: %s cooled/tried → switching to %s",
                                _fo_provider,
                                _next[1],
                            )
                            _tried_providers.add(_fo_provider)
                            continue

                        error = json.dumps({
                            "error": {
                                "message": "All providers exhausted or in cooldown — request blocked by circuit breaker",
                                "code": "503",
                            }
                        }).encode()
                        self.log_message(
                            "Failover A: exhausted providers (last=%s model=%s)",
                            _fo_provider,
                            _fo_model,
                        )
                        time.sleep(2)  # Throttle Codex retry loops
                        self.send_response_only(503)
                        self.send_header("Content-Type", "application/json")
                        self.send_header("Content-Length", str(len(error)))
                        self.end_headers()
                        self.wfile.write(error)
                        return

                    if _fo_provider:
                        _tried_providers.add(_fo_provider)

                    # Re-inject current model into request body
                    if _raw_body:
                        try:
                            _fo_data = json.loads(_raw_body)
                            if isinstance(_fo_data, dict):
                                _fo_data["model"] = _fo_model
                                body = json.dumps(_fo_data).encode()
                        except (json.JSONDecodeError, TypeError):
                            body = _raw_body
                    else:
                        body = _raw_body
                    headers["Content-Length"] = str(len(body))

                    conn = http.client.HTTPConnection(
                        UPSTREAM_HOST, UPSTREAM_PORT, timeout=CONNECT_TIMEOUT
                    )
                    conn.request(self.command, self.path, body=body, headers=headers)
                    # Bump socket timeout for potentially long streaming reads.
                    if conn.sock:
                        conn.sock.settimeout(READ_TIMEOUT)
                    resp = conn.getresponse()

                    # POINT B: HTTP error → failover
                    if resp.status in _STATUS_COOLDOWN_MAP or resp.status == 429:
                        _next = _select_next_provider(_tried_providers)
                        if _next and _failover_attempt < MAX_FAILOVER_ATTEMPTS:
                            # Write cooldown (existing logic)
                            try:
                                req_data = json.loads(body) if body else {}
                                model_name = req_data.get("model", "")
                                provider = _model_to_provider(str(model_name))
                                if provider:
                                    if resp.status == 429:
                                        retry_after = _parse_retry_after(
                                            resp.getheader("Retry-After")
                                        )
                                        _record_ratelimit(provider, retry_after)
                                        self.log_message(
                                            "429 from %s (model=%s) — cooldown %ds (Retry-After: %s)",
                                            provider, model_name,
                                            max(RATELIMIT_COOLDOWN, retry_after),
                                            resp.getheader("Retry-After", "none"),
                                        )
                                    elif resp.status in _STATUS_COOLDOWN_MAP:
                                        cooldown, label = _STATUS_COOLDOWN_MAP[resp.status]
                                        _write_cooldown(
                                            provider,
                                            int(time.time()) + cooldown,
                                        )
                                        self.log_message(
                                            "%s from %s (model=%s) — cooldown %ds",
                                            label, provider, model_name, cooldown,
                                        )
                            except (json.JSONDecodeError, TypeError):
                                pass

                            resp.read()
                            conn.close()
                            _update_current_model(_next[0])
                            self.log_message(
                                "Failover B: %s returned %d → switching to %s",
                                _fo_provider,
                                resp.status,
                                _next[1],
                            )
                            continue

                    break
            else:
                conn = http.client.HTTPConnection(
                    UPSTREAM_HOST, UPSTREAM_PORT, timeout=CONNECT_TIMEOUT
                )
                conn.request(self.command, self.path, body=body, headers=headers)
                # Bump socket timeout for potentially long streaming reads.
                if conn.sock:
                    conn.sock.settimeout(READ_TIMEOUT)
                resp = conn.getresponse()

            # Track error responses per provider — all 13 HTTP error classes.
            _http_cooldown_written = False
            if resp.status in _STATUS_COOLDOWN_MAP or resp.status == 429:
                try:
                    req_data = json.loads(body) if body else {}
                    model_name = req_data.get("model", "")
                    provider = _model_to_provider(str(model_name))
                    if provider:
                        _http_cooldown_written = True
                        if resp.status == 429:
                            retry_after = _parse_retry_after(
                                resp.getheader("Retry-After")
                            )
                            _record_ratelimit(provider, retry_after)
                            self.log_message(
                                "429 from %s (model=%s) — cooldown %ds (Retry-After: %s)",
                                provider, model_name,
                                max(RATELIMIT_COOLDOWN, retry_after),
                                resp.getheader("Retry-After", "none"),
                            )
                        elif resp.status in _STATUS_COOLDOWN_MAP:
                            cooldown, label = _STATUS_COOLDOWN_MAP[resp.status]
                            _write_cooldown(
                                provider,
                                int(time.time()) + cooldown,
                            )
                            self.log_message(
                                "%s from %s (model=%s) — cooldown %ds",
                                label, provider, model_name, cooldown,
                            )
                except (json.JSONDecodeError, TypeError):
                    pass

            # For /models GET responses, buffer and transform so Codex CLI
            # can find the "models" field it expects (LiteLLM returns "data").
            if (
                self.command == "GET"
                and _is_models_endpoint(self.path)
                and resp.status == 200
            ):
                resp_body = resp.read()
                conn.close()
                try:
                    data = json.loads(resp_body)
                    if "data" in data and "models" not in data:
                        data["models"] = data["data"]
                        resp_body = json.dumps(data).encode()
                        self.log_message("Transformed /models response: added 'models' key")
                except (json.JSONDecodeError, TypeError):
                    pass
                self.send_response_only(resp.status)
                for key, val in resp.getheaders():
                    lk = key.lower()
                    if lk not in ("transfer-encoding", "connection", "content-length"):
                        self.send_header(key, val)
                self.send_header("Content-Length", str(len(resp_body)))
                self.end_headers()
                self.wfile.write(resp_body)
                self.wfile.flush()
            else:
                self.send_response_only(resp.status)
                for key, val in resp.getheaders():
                    lk = key.lower()
                    if lk not in ("transfer-encoding", "connection"):
                        self.send_header(key, val)
                self.end_headers()

                # Detect rate-limit errors hidden in streaming response
                # bodies.  LiteLLM may return HTTP 200 for SSE streams,
                # then disconnect when the upstream provider returns 429.
                # Codex sees "stream disconnected" — invisible to the
                # HTTP-status check above.  Scanning chunks catches these.
                _stream_provider = ""
                _error_detected = _http_cooldown_written
                if (
                    body
                    and self.command == "POST"
                    and "/responses" in self.path
                ):
                    try:
                        _req_data = json.loads(body)
                        _stream_provider = _model_to_provider(
                            str(_req_data.get("model", ""))
                        )
                    except (json.JSONDecodeError, TypeError):
                        pass

                _stream_start = time.monotonic()
                _stream_bytes = 0
                _tail_buf = b""  # sliding tail for cross-chunk detection

                while True:
                    chunk = resp.read1(8192)
                    if not chunk:
                        break
                    _stream_bytes += len(chunk)

                    if _stream_provider and not _error_detected:
                        # Combine tail of previous chunk to catch errors
                        # split across chunk boundaries.
                        scan_buf = _tail_buf + chunk
                        scan_lower = scan_buf.lower()
                        _tail_buf = chunk[-256:] if len(chunk) >= 256 else chunk

                        # -----------------------------------------------
                        # Status-code-anchored stream error patterns
                        # -----------------------------------------------

                        # Gemini free-tier daily quota exhaustion (24hr)
                        # Must be checked before the general 429 pattern.
                        if b"free_tier" in scan_lower and (
                            b"quota" in scan_lower
                            or b"exceeded" in scan_lower
                            or b"resource_exhausted" in scan_lower
                        ):
                            _error_detected = True
                            _write_cooldown(
                                _stream_provider,
                                int(time.time()) + GEMINI_FREE_TIER_COOLDOWN,
                            )
                            self.log_message(
                                "Gemini free-tier quota exhausted for %s — cooldown %ds (24hr)",
                                _stream_provider, GEMINI_FREE_TIER_COOLDOWN,
                            )

                        # 429 rate-limit
                        elif b"429" in scan_buf and (
                            b"rate" in scan_lower
                            or b"quota" in scan_lower
                            or b"resource_exhausted" in scan_lower
                            or b"too many" in scan_lower
                            or b"limit" in scan_lower
                            or b"exceeded" in scan_lower
                        ):
                            _error_detected = True
                            _record_ratelimit(_stream_provider)
                            self.log_message(
                                "429 in stream for %s — tracking",
                                _stream_provider,
                            )

                        # 401 Unauthorized
                        elif b"401" in scan_buf and (
                            b"unauthorized" in scan_lower
                            or b"invalid_api_key" in scan_lower
                            or b"invalid api key" in scan_lower
                            or b"authentication" in scan_lower
                            or b"autherror" in scan_lower
                        ):
                            _error_detected = True
                            _write_cooldown(
                                _stream_provider,
                                int(time.time()) + AUTH_FAILURE_COOLDOWN,
                            )
                            self.log_message(
                                "401 in stream for %s — cooldown %ds",
                                _stream_provider, AUTH_FAILURE_COOLDOWN,
                            )

                        # 402 Payment Required
                        elif b"402" in scan_buf and (
                            b"payment" in scan_lower
                            or b"insufficient_credits" in scan_lower
                            or b"no credits" in scan_lower
                            or b"billing" in scan_lower
                        ):
                            _error_detected = True
                            _write_cooldown(
                                _stream_provider,
                                int(time.time()) + PAYMENT_REQUIRED_COOLDOWN,
                            )
                            self.log_message(
                                "402 in stream for %s — cooldown %ds",
                                _stream_provider, PAYMENT_REQUIRED_COOLDOWN,
                            )

                        # 403 Forbidden
                        elif b"403" in scan_buf and (
                            b"forbidden" in scan_lower
                            or b"access_denied" in scan_lower
                            or b"content_policy" in scan_lower
                            or b"moderation" in scan_lower
                        ):
                            _error_detected = True
                            _write_cooldown(
                                _stream_provider,
                                int(time.time()) + FORBIDDEN_COOLDOWN,
                            )
                            self.log_message(
                                "403 in stream for %s — cooldown %ds",
                                _stream_provider, FORBIDDEN_COOLDOWN,
                            )

                        # 413 Payload Too Large
                        elif b"413" in scan_buf and (
                            b"too large" in scan_lower
                            or b"payload" in scan_lower
                            or b"max size" in scan_lower
                            or b"content length" in scan_lower
                        ):
                            _error_detected = True
                            _write_cooldown(
                                _stream_provider,
                                int(time.time()) + CONTEXT_LIMIT_COOLDOWN,
                            )
                            self.log_message(
                                "413 in stream for %s — cooldown %ds",
                                _stream_provider, CONTEXT_LIMIT_COOLDOWN,
                            )

                        # 404 Not Found
                        elif b"404" in scan_buf and (
                            b"not found" in scan_lower
                            or b"notfounderror" in scan_lower
                            or b"model group" in scan_lower
                        ):
                            _error_detected = True
                            _write_cooldown(
                                _stream_provider,
                                int(time.time()) + NOT_FOUND_COOLDOWN,
                            )
                            self.log_message(
                                "404 in stream for %s — cooldown %ds",
                                _stream_provider, NOT_FOUND_COOLDOWN,
                            )

                        # 500 Internal Server Error
                        elif b"500" in scan_buf and (
                            b"internal server error" in scan_lower
                            or b"missing corresponding tool call" in scan_lower
                            or b"apiconnectionerror" in scan_lower
                        ):
                            _error_detected = True
                            _write_cooldown(
                                _stream_provider,
                                int(time.time()) + SERVER_ERROR_COOLDOWN,
                            )
                            self.log_message(
                                "500 in stream for %s — cooldown %ds",
                                _stream_provider, SERVER_ERROR_COOLDOWN,
                            )

                        # 400 Bad Request
                        elif b"400" in scan_buf and (
                            b"bad request" in scan_lower
                            or b"badrequesterror" in scan_lower
                            or b"provider returned error" in scan_lower
                            or b"openrouterexception" in scan_lower
                            or b"validation_failed" in scan_lower
                        ):
                            _error_detected = True
                            _write_cooldown(
                                _stream_provider,
                                int(time.time()) + BAD_REQUEST_COOLDOWN,
                            )
                            self.log_message(
                                "400 in stream for %s — cooldown %ds",
                                _stream_provider, BAD_REQUEST_COOLDOWN,
                            )

                        # 502 Bad Gateway
                        elif b"502" in scan_buf and (
                            b"bad gateway" in scan_lower
                            or b"invalid response" in scan_lower
                        ):
                            _error_detected = True
                            _write_cooldown(
                                _stream_provider,
                                int(time.time()) + BAD_GATEWAY_COOLDOWN,
                            )
                            self.log_message(
                                "502 in stream for %s — cooldown %ds",
                                _stream_provider, BAD_GATEWAY_COOLDOWN,
                            )

                        # 503 Service Unavailable
                        elif b"503" in scan_buf and (
                            b"service unavailable" in scan_lower
                            or b"temporarily unavailable" in scan_lower
                        ):
                            _error_detected = True
                            _write_cooldown(
                                _stream_provider,
                                int(time.time()) + SERVICE_UNAVAILABLE_COOLDOWN,
                            )
                            self.log_message(
                                "503 in stream for %s — cooldown %ds",
                                _stream_provider, SERVICE_UNAVAILABLE_COOLDOWN,
                            )

                        # 504 Gateway Timeout
                        elif b"504" in scan_buf and (
                            b"gateway timeout" in scan_lower
                            or b"timed out" in scan_lower
                            or b"deadline exceeded" in scan_lower
                        ):
                            _error_detected = True
                            _write_cooldown(
                                _stream_provider,
                                int(time.time()) + GATEWAY_TIMEOUT_COOLDOWN,
                            )
                            self.log_message(
                                "504 in stream for %s — cooldown %ds",
                                _stream_provider, GATEWAY_TIMEOUT_COOLDOWN,
                            )

                        # -----------------------------------------------
                        # Keyword-only patterns (no HTTP status code needed)
                        # These error strings are definitive on their own.
                        # -----------------------------------------------

                        # Context length exceeded (distinct from 413)
                        elif (
                            b"context_length_exceeded" in scan_lower
                            or b"maximum context length" in scan_lower
                            or b"token limit exceeded" in scan_lower
                        ):
                            _error_detected = True
                            _write_cooldown(
                                _stream_provider,
                                int(time.time()) + CONTEXT_LIMIT_COOLDOWN,
                            )
                            self.log_message(
                                "Context length exceeded in stream for %s — cooldown %ds",
                                _stream_provider, CONTEXT_LIMIT_COOLDOWN,
                            )

                        # Quota/credits exhausted
                        elif (
                            b"insufficient_quota" in scan_lower
                            or b"quota_exceeded" in scan_lower
                        ):
                            _error_detected = True
                            _write_cooldown(
                                _stream_provider,
                                int(time.time()) + QUOTA_EXHAUSTED_COOLDOWN,
                            )
                            self.log_message(
                                "Quota exhausted in stream for %s — cooldown %ds",
                                _stream_provider, QUOTA_EXHAUSTED_COOLDOWN,
                            )

                        # Content policy violation
                        elif (
                            b"content_policy_violation" in scan_lower
                            or b"content_filter" in scan_lower
                        ):
                            _error_detected = True
                            _write_cooldown(
                                _stream_provider,
                                int(time.time()) + FORBIDDEN_COOLDOWN,
                            )
                            self.log_message(
                                "Content policy violation in stream for %s — cooldown %ds",
                                _stream_provider, FORBIDDEN_COOLDOWN,
                            )

                        # Model not found (keyword-only)
                        elif (
                            b"model_not_found" in scan_lower
                            or b"model does not exist" in scan_lower
                            or b"model not available" in scan_lower
                        ):
                            _error_detected = True
                            _write_cooldown(
                                _stream_provider,
                                int(time.time()) + NOT_FOUND_COOLDOWN,
                            )
                            self.log_message(
                                "Model not found in stream for %s — cooldown %ds",
                                _stream_provider, NOT_FOUND_COOLDOWN,
                            )

                        # Service overload ("high demand" / capacity)
                        # "high demand" is specific enough standalone;
                        # "overloaded"/"at capacity" need an "error" anchor
                        # to avoid false positives from model response text.
                        elif (
                            b"high demand" in scan_lower
                            or (b"error" in scan_lower and (
                                b"overloaded" in scan_lower
                                or b"at capacity" in scan_lower
                            ))
                        ):
                            _error_detected = True
                            _write_cooldown(
                                _stream_provider,
                                int(time.time()) + SERVICE_OVERLOAD_COOLDOWN,
                            )
                            self.log_message(
                                "Service overload in stream for %s — cooldown %ds",
                                _stream_provider, SERVICE_OVERLOAD_COOLDOWN,
                            )

                    self.wfile.write(chunk)
                    self.wfile.flush()

                # Short-lived /v1/responses streams are almost certainly
                # upstream failures (quota exhaustion, rate-limits).
                # Successful generation streams take several seconds.
                _elapsed = time.monotonic() - _stream_start
                if (
                    _stream_provider
                    and not _error_detected
                    and _elapsed < 5.0
                    and _stream_bytes < 2000
                ):
                    _record_ratelimit(_stream_provider)
                    self.log_message(
                        "Short stream for %s (%.1fs, %d bytes) — treating as rate-limit",
                        _stream_provider,
                        _elapsed,
                        _stream_bytes,
                    )

                conn.close()
        except (ConnectionRefusedError, OSError) as exc:
            error = json.dumps(
                {"error": {"message": f"Upstream unavailable: {exc}", "code": "502"}}
            ).encode()
            self.send_response_only(502)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(error)))
            self.end_headers()
            self.wfile.write(error)
        except Exception as exc:
            error = json.dumps(
                {"error": {"message": f"Proxy error: {exc}", "code": "500"}}
            ).encode()
            self.send_response_only(500)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(error)))
            self.end_headers()
            self.wfile.write(error)


class ThreadedServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True
    allow_reuse_port = True


def main():
    server = ThreadedServer(("127.0.0.1", LISTEN_PORT), ProxyHandler)
    sys.stderr.write(
        f"[model-injector] Listening on 127.0.0.1:{LISTEN_PORT} "
        f"→ {UPSTREAM_HOST}:{UPSTREAM_PORT}\n"
        f"[model-injector] Model file: {MODEL_FILE}\n"
        f"[model-injector] Default model: {DEFAULT_MODEL}\n"
    )
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    server.server_close()


if __name__ == "__main__":
    main()
