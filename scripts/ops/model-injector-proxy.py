#!/usr/bin/env python3

"""
model-injector-proxy.py — Request normalization proxy

Sits between LiteLLM aliases and the Symphony runner.
Normalizes requests to ensure consistent model routing.

Routing chain:
  Ollama → LiteLLM alias → model injector → Symphony runner

Responsibilities:
  - Normalize request format for the active provider
  - Enforce single-agent execution (reject concurrent requests)
  - Health check endpoint at /health
  - Log all routed requests for audit

Usage:
  python3 scripts/ops/model-injector-proxy.py [--port 8400]
"""

import argparse
import json
import sys
import threading
import time
import urllib.request
import urllib.error
from http.server import HTTPServer, ThreadingHTTPServer, BaseHTTPRequestHandler
from datetime import datetime, timezone

OLLAMA_BASE = "http://localhost:11434"
PINNED_MODEL = "qwen3.5:35b-a3b-32t"
DEFAULT_PORT = 8400

# Single-agent lock
_active_lock = threading.Lock()
_active_request = False


def log(msg):
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    print(f"[{ts}] {msg}", flush=True)


def check_ollama_health():
    try:
        req = urllib.request.Request(f"{OLLAMA_BASE}/api/version")
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read())
            return {"healthy": True, "version": data.get("version", "unknown")}
    except Exception as e:
        return {"healthy": False, "error": str(e)}


class InjectorHandler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        # Suppress default access log; we log manually
        pass

    def _send_json(self, status, obj):
        body = json.dumps(obj).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path == "/health":
            ollama = check_ollama_health()
            status = 200 if ollama["healthy"] else 503
            self._send_json(status, {
                "status": "ok" if ollama["healthy"] else "degraded",
                "ollama": ollama,
                "model": PINNED_MODEL,
                "active_request": _active_request,
            })
            return
        self._send_json(404, {"error": "not found"})

    def do_POST(self):
        global _active_request

        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length) if content_length > 0 else b""

        # Enforce single-agent execution
        acquired = _active_lock.acquire(blocking=False)
        if not acquired:
            log(f"REJECTED {self.path} — concurrent request blocked")
            self._send_json(429, {
                "error": "single-agent enforcement: another request is active",
            })
            return

        _active_request = True
        start = time.monotonic()
        try:
            # Normalize: ensure model field is pinned
            if body:
                try:
                    payload = json.loads(body)
                    payload["model"] = PINNED_MODEL
                    body = json.dumps(payload).encode()
                except json.JSONDecodeError:
                    pass

            target_url = f"{OLLAMA_BASE}{self.path}"
            log(f"FORWARD {self.path} → {target_url}")

            req = urllib.request.Request(
                target_url,
                data=body,
                headers={"Content-Type": "application/json"},
                method="POST",
            )

            try:
                with urllib.request.urlopen(req, timeout=300) as resp:
                    resp_body = resp.read()
                    elapsed = time.monotonic() - start
                    log(f"COMPLETE {self.path} — {resp.status} in {elapsed:.1f}s")
                    self.send_response(resp.status)
                    self.send_header("Content-Type", resp.headers.get("Content-Type", "application/json"))
                    self.send_header("Content-Length", str(len(resp_body)))
                    self.end_headers()
                    self.wfile.write(resp_body)
            except urllib.error.HTTPError as e:
                elapsed = time.monotonic() - start
                err_body = e.read()
                log(f"ERROR {self.path} — {e.code} in {elapsed:.1f}s")
                self.send_response(e.code)
                self.send_header("Content-Type", "application/json")
                self.send_header("Content-Length", str(len(err_body)))
                self.end_headers()
                self.wfile.write(err_body)
            except urllib.error.URLError as e:
                elapsed = time.monotonic() - start
                log(f"UNREACHABLE {self.path} — {e.reason} in {elapsed:.1f}s")
                self._send_json(502, {"error": f"Ollama unreachable: {e.reason}"})
        finally:
            _active_request = False
            _active_lock.release()


def main():
    parser = argparse.ArgumentParser(description="Model injector proxy")
    parser.add_argument("--port", type=int, default=DEFAULT_PORT, help=f"Listen port (default: {DEFAULT_PORT})")
    args = parser.parse_args()

    server = ThreadingHTTPServer(("", args.port), InjectorHandler)
    log(f"model-injector-proxy listening on :{args.port}")
    log(f"Pinned model: {PINNED_MODEL}")
    log(f"Ollama backend: {OLLAMA_BASE}")
    log(f"Single-agent enforcement: enabled")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        log("Shutting down")
        server.shutdown()


if __name__ == "__main__":
    main()
