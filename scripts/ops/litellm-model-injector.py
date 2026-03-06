#!/usr/bin/env python3
"""Tiny reverse proxy: Codex → this (port 4011) → LiteLLM (port 4010).

Works around Codex CLI v0.110.0 bug where model=None is sent to the
/responses endpoint. Injects DEFAULT_MODEL into any request with a
null/missing model field.
"""

import http.server
import json
import os
import sys
import urllib.request

LITELLM_URL = os.environ.get("LITELLM_URL", "http://127.0.0.1:4010")
DEFAULT_MODEL = os.environ.get("DEFAULT_MODEL", "qwen2.5-coder-3b")
LISTEN_PORT = int(os.environ.get("INJECTOR_PORT", "4011"))


class Handler(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length) if length else b""

        # Inject model if missing/null
        try:
            data = json.loads(body) if body else {}
            if not data.get("model"):
                data["model"] = DEFAULT_MODEL
            body = json.dumps(data).encode()
        except (json.JSONDecodeError, TypeError):
            pass

        # Forward to LiteLLM
        url = f"{LITELLM_URL}{self.path}"
        req = urllib.request.Request(
            url,
            data=body,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
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
            self.send_response(e.code)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(e.read())
        except Exception as e:
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
            self.send_response(502)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())

    def log_message(self, fmt, *args):
        model_info = f" [injected model={DEFAULT_MODEL}]" if "model" in fmt else ""
        sys.stderr.write(f"[model-injector] {fmt % args}{model_info}\n")


if __name__ == "__main__":
    server = http.server.HTTPServer(("127.0.0.1", LISTEN_PORT), Handler)
    print(f"[model-injector] Listening on 127.0.0.1:{LISTEN_PORT}, forwarding to {LITELLM_URL}, default model: {DEFAULT_MODEL}", file=sys.stderr)
    server.serve_forever()
