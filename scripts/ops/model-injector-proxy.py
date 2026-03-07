#!/usr/bin/env python3
"""Model Injector Proxy — fixes Codex CLI model=None bug.

Codex CLI v0.110.0 has a bug where `-c model=X` isn't forwarded to the
/v1/responses API request, sending model=None instead. This proxy sits
between Codex (port 4011) and LiteLLM (port 4010), reading the desired
model name from a state file and injecting it into the request body.

The credit-gate writes the model name to the state file before exec'ing
Codex, so each session gets the correct model routed through LiteLLM.

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

# Rate-limit tracking: when upstream returns 429s too frequently for a
# provider, write a cooldown signal file so the credit-gate skips it.
RATELIMIT_WINDOW = 60       # count 429s within this many seconds
RATELIMIT_THRESHOLD = 1     # immediate cooldown on first 429 — providers don't accidentally return 429
RATELIMIT_COOLDOWN = 120    # skip provider for this many seconds
CONTEXT_LIMIT_COOLDOWN = 600  # 413 Payload Too Large — conversation won't shrink, skip longer
NOT_FOUND_COOLDOWN = 300      # 404 Not Found — model config broken, needs manual fix
SERVER_ERROR_COOLDOWN = 180   # 500 Internal Server Error — LiteLLM translation bugs (e.g. missing tool call)
SERVICE_OVERLOAD_COOLDOWN = 120  # "high demand" / stream-embedded overload — no HTTP status code
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
    "github-llama-8b": "github",
}


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
    return ""


def _record_ratelimit(provider: str) -> None:
    """Record a 429 hit and write cooldown file if threshold exceeded."""
    now = time.time()
    with _ratelimit_lock:
        hits = _ratelimit_hits.setdefault(provider, [])
        hits.append(now)
        cutoff = now - RATELIMIT_WINDOW
        _ratelimit_hits[provider] = [t for t in hits if t > cutoff]
        if len(_ratelimit_hits[provider]) >= RATELIMIT_THRESHOLD:
            _write_cooldown(provider, int(now) + RATELIMIT_COOLDOWN)
            _ratelimit_hits[provider] = []


def _write_cooldown(provider: str, expiry: int) -> None:
    """Atomically write a cooldown expiry file for the credit-gate to read."""
    rl_file = os.path.join(STATE_DIR, f"ratelimit-{provider}")
    tmp = f"{rl_file}.{os.getpid()}"
    try:
        os.makedirs(STATE_DIR, mode=0o700, exist_ok=True)
        with open(tmp, "w") as f:
            f.write(f"{expiry}\n")
        os.replace(tmp, rl_file)
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
            conn = http.client.HTTPConnection(
                UPSTREAM_HOST, UPSTREAM_PORT, timeout=600
            )
            conn.request(self.command, self.path, body=body, headers=headers)
            resp = conn.getresponse()

            # Track error responses per provider.
            if resp.status in (429, 413, 404, 500) and body:
                try:
                    req_data = json.loads(body)
                    model_name = req_data.get("model", "")
                    provider = _model_to_provider(str(model_name))
                    if provider:
                        if resp.status == 429:
                            _record_ratelimit(provider)
                            self.log_message(
                                "429 from %s (model=%s) — tracking rate limit",
                                provider, model_name,
                            )
                        elif resp.status == 413:
                            _write_cooldown(
                                provider,
                                int(time.time()) + CONTEXT_LIMIT_COOLDOWN,
                            )
                            self.log_message(
                                "413 Payload Too Large from %s (model=%s) — cooldown %ds",
                                provider, model_name, CONTEXT_LIMIT_COOLDOWN,
                            )
                        elif resp.status == 404:
                            _write_cooldown(
                                provider,
                                int(time.time()) + NOT_FOUND_COOLDOWN,
                            )
                            self.log_message(
                                "404 Not Found from %s (model=%s) — cooldown %ds",
                                provider, model_name, NOT_FOUND_COOLDOWN,
                            )
                        elif resp.status == 500:
                            _write_cooldown(
                                provider,
                                int(time.time()) + SERVER_ERROR_COOLDOWN,
                            )
                            self.log_message(
                                "500 Internal Server Error from %s (model=%s) — cooldown %ds",
                                provider, model_name, SERVER_ERROR_COOLDOWN,
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
                _error_detected = False
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

                while True:
                    chunk = resp.read1(8192)
                    if not chunk:
                        break
                    _stream_bytes += len(chunk)

                    if _stream_provider and not _error_detected:
                        chunk_lower = chunk.lower()

                        # 429 rate-limit detection in stream body
                        if b"429" in chunk and (
                            b"rate" in chunk_lower
                            or b"quota" in chunk_lower
                            or b"resource_exhausted" in chunk_lower
                            or b"too many" in chunk_lower
                            or b"limit" in chunk_lower
                            or b"exceeded" in chunk_lower
                        ):
                            _error_detected = True
                            _record_ratelimit(_stream_provider)
                            self.log_message(
                                "Rate-limit in stream body for %s — tracking",
                                _stream_provider,
                            )

                        # 413 Payload Too Large detection in stream body
                        elif b"413" in chunk and (
                            b"too large" in chunk_lower
                            or b"payload" in chunk_lower
                            or b"max size" in chunk_lower
                            or b"content length" in chunk_lower
                        ):
                            _error_detected = True
                            _write_cooldown(
                                _stream_provider,
                                int(time.time()) + CONTEXT_LIMIT_COOLDOWN,
                            )
                            self.log_message(
                                "413 in stream body for %s — cooldown %ds",
                                _stream_provider, CONTEXT_LIMIT_COOLDOWN,
                            )

                        # 404 Not Found detection in stream body
                        elif b"404" in chunk and (
                            b"not found" in chunk_lower
                            or b"notfounderror" in chunk_lower
                            or b"model group" in chunk_lower
                        ):
                            _error_detected = True
                            _write_cooldown(
                                _stream_provider,
                                int(time.time()) + NOT_FOUND_COOLDOWN,
                            )
                            self.log_message(
                                "404 in stream body for %s — cooldown %ds",
                                _stream_provider, NOT_FOUND_COOLDOWN,
                            )

                        # 500 Internal Server Error detection in stream body
                        # Catches LiteLLM translation bugs like "Missing
                        # corresponding tool call" that persist for the
                        # duration of a conversation.
                        elif b"500" in chunk and (
                            b"internal server error" in chunk_lower
                            or b"missing corresponding tool call" in chunk_lower
                            or b"apiconnectionerror" in chunk_lower
                        ):
                            _error_detected = True
                            _write_cooldown(
                                _stream_provider,
                                int(time.time()) + SERVER_ERROR_COOLDOWN,
                            )
                            self.log_message(
                                "500 in stream body for %s — cooldown %ds",
                                _stream_provider, SERVER_ERROR_COOLDOWN,
                            )

                        # Service overload detection — no HTTP status code
                        # needed.  Catches "We're currently experiencing
                        # high demand" and similar stream-embedded errors
                        # where Codex sees http_status_code=null.
                        elif b"high demand" in chunk_lower:
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
