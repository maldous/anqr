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
import sys

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


def read_model() -> str:
    try:
        with open(MODEL_FILE) as f:
            model = f.read().strip()
            if model:
                return model
    except OSError:
        pass
    return DEFAULT_MODEL


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
                # Codex CLI may send gzip-compressed request bodies.
                content_encoding = self.headers.get("Content-Encoding", "")
                raw = body
                if "gzip" in content_encoding:
                    raw = gzip.decompress(body)

                data = json.loads(raw)
                model_val = data.get("model")
                if not model_val or str(model_val) in ("None", "null", ""):
                    injected = read_model()
                    data["model"] = injected
                    self.log_message("Injected model=%s", injected)

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

            self.send_response_only(resp.status)
            for key, val in resp.getheaders():
                lk = key.lower()
                if lk not in ("transfer-encoding", "connection"):
                    self.send_header(key, val)
            self.end_headers()

            while True:
                chunk = resp.read1(8192)
                if not chunk:
                    break
                self.wfile.write(chunk)
                self.wfile.flush()

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
