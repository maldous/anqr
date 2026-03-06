#!/usr/bin/env python3
"""Tiny reverse proxy: Codex → this (port 4011) → LiteLLM (port 4010).

Works around Codex CLI v0.110.0 bug where model=None is sent to the
/responses endpoint.

When model is missing/null:
1) try MODEL_FILE (written by credit-gate per invocation),
2) fall back to DEFAULT_MODEL.

Handles zstd and gzip compressed request bodies (Codex sends zstd).
Uses ThreadingHTTPServer for concurrent request handling.
"""

import gzip
import http.server
import json
import os
import socketserver
import subprocess
import sys
import urllib.request

LITELLM_URL = os.environ.get("LITELLM_URL", "http://127.0.0.1:4010")
DEFAULT_MODEL = os.environ.get("DEFAULT_MODEL", "qwen2.5-coder-3b")
LISTEN_PORT = int(os.environ.get("INJECTOR_PORT", "4011"))
MODEL_FILE = os.environ.get(
    "MODEL_FILE",
    os.path.join(
        os.environ.get("XDG_RUNTIME_DIR", f"/run/user/{os.getuid()}"),
        "credit-gate",
        "current-model",
    ),
)

# Zstd magic bytes: 0x28 0xb5 0x2f 0xfd
ZSTD_MAGIC = b"\x28\xb5\x2f\xfd"
GZIP_MAGIC = b"\x1f\x8b"


def decompress_body(body, content_encoding):
    """Decompress request body based on Content-Encoding header or magic bytes."""
    if not body:
        return body

    encoding = (content_encoding or "").lower()

    # Try zstd first (Codex CLI default)
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

    # Try gzip
    if encoding == "gzip" or body[:2] == GZIP_MAGIC:
        try:
            return gzip.decompress(body)
        except Exception:
            pass

    return body


def read_model():
    """Read current model from state file, falling back to DEFAULT_MODEL."""
    try:
        with open(MODEL_FILE, encoding="utf-8") as f:
            model = f.read().strip()
            if model:
                return model
    except OSError:
        pass
    return DEFAULT_MODEL


class Handler(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        raw_body = self.rfile.read(length) if length else b""

        content_encoding = self.headers.get("Content-Encoding")
        body = decompress_body(raw_body, content_encoding)

        # Inject model if missing/null
        injected = False
        try:
            data = json.loads(body) if body else {}
            if not data.get("model"):
                data["model"] = read_model()
                injected = True
            body = json.dumps(data).encode()
        except (json.JSONDecodeError, TypeError, UnicodeDecodeError):
            # Can't parse body — forward raw with original headers
            body = raw_body
            sys.stderr.write(
                f"[model-injector] WARNING: could not parse body for {self.path} "
                f"(Content-Encoding: {content_encoding}, "
                f"first bytes: {raw_body[:8].hex() if raw_body else 'empty'})\n"
            )

        if injected:
            sys.stderr.write(
                f"[model-injector] Injected model={data.get('model')} into {self.path}\n"
            )

        # Forward to LiteLLM (send as uncompressed JSON if we parsed it)
        url = f"{LITELLM_URL}{self.path}"
        headers = {"Content-Type": "application/json"}
        if self.headers.get("Authorization"):
            headers["Authorization"] = self.headers["Authorization"]

        req = urllib.request.Request(url, data=body, headers=headers, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=120) as resp:
                resp_body = resp.read()
                self.send_response(resp.status)
                for key, val in resp.getheaders():
                    if key.lower() not in ("transfer-encoding", "connection"):
                        self.send_header(key, val)
                self.end_headers()
                self.wfile.write(resp_body)
        except urllib.error.HTTPError as e:
            err_body = e.read()
            sys.stderr.write(
                f"[model-injector] LiteLLM returned {e.code} for {self.path}: "
                f"{err_body[:200].decode(errors='replace')}\n"
            )
            self.send_response(e.code)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(err_body)
        except Exception as e:
            sys.stderr.write(f"[model-injector] Proxy error on {self.path}: {e}\n")
            self.send_response(502)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())

    def do_GET(self):
        url = f"{LITELLM_URL}{self.path}"
        try:
            with urllib.request.urlopen(url, timeout=10) as resp:
                resp_body = resp.read()
                self.send_response(resp.status)
                for key, val in resp.getheaders():
                    if key.lower() not in ("transfer-encoding", "connection"):
                        self.send_header(key, val)
                self.end_headers()
                self.wfile.write(resp_body)
        except Exception as e:
            sys.stderr.write(f"[model-injector] GET proxy error on {self.path}: {e}\n")
            self.send_response(502)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())

    def log_message(self, fmt, *args):
        sys.stderr.write(f"[model-injector] {fmt % args}\n")


class ThreadedHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True
    allow_reuse_port = True


if __name__ == "__main__":
    server = ThreadedHTTPServer(("127.0.0.1", LISTEN_PORT), Handler)
    print(
        f"[model-injector] Listening on 127.0.0.1:{LISTEN_PORT}, "
        f"forwarding to {LITELLM_URL}, default model: {DEFAULT_MODEL}, "
        f"model file: {MODEL_FILE}",
        file=sys.stderr,
    )
    server.serve_forever()
