#!/usr/bin/env python3
"""Integration checks for model-injector provider cascade behavior."""

from __future__ import annotations

import http.client
import http.server
import json
import os
import socketserver
import subprocess
import tempfile
import threading
import time
from pathlib import Path

MAX_FAILOVER_ATTEMPTS = 3
CASCADE_MODELS = [
    "groq-llama-70b",
    "mistral-codestral",
    "gemini-flash",
    "gemini-flash-lite",
    "openrouter-free",
    "sambanova-llama-70b",
    "cerebras-llama-8b",
    "github-gpt41-mini",
    "qwen2.5-coder-7b-32t",
]
CASCADE_PROVIDERS = [
    "groq",
    "mistral",
    "gemini",
    "gemini-lite",
    "openrouter-free",
    "sambanova",
    "cerebras",
    "github",
    "litellm-ollama",
]
REQUEST_PATH = "/v1/responses"


class FakeUpstreamHandler(http.server.BaseHTTPRequestHandler):
    def log_message(self, fmt: str, *args) -> None:  # noqa: A003
        return

    def do_POST(self) -> None:  # noqa: N802
        raw = self.rfile.read(int(self.headers.get("Content-Length", "0")))
        model = ""
        try:
            model = str(json.loads(raw.decode("utf-8")).get("model", ""))
        except Exception:
            model = ""

        self.server.request_models.append(model)  # type: ignore[attr-defined]
        status = self.server.status_by_model.get(model, self.server.default_status)  # type: ignore[attr-defined]

        payload = (
            {"id": "ok", "model": model}
            if status == 200
            else {"error": {"message": f"simulated {status}", "code": str(status)}}
        )
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


class ThreadedHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True


def _start_server() -> ThreadedHTTPServer:
    server = ThreadedHTTPServer(("127.0.0.1", 0), FakeUpstreamHandler)
    server.request_models = []  # type: ignore[attr-defined]
    server.status_by_model = {}  # type: ignore[attr-defined]
    server.default_status = 200  # type: ignore[attr-defined]
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server


def _post_json(port: int, payload: dict) -> tuple[int, str]:
    conn = http.client.HTTPConnection("127.0.0.1", port, timeout=10)
    body = json.dumps(payload).encode("utf-8")
    conn.request("POST", REQUEST_PATH, body=body, headers={"Content-Type": "application/json"})
    resp = conn.getresponse()
    content = resp.read().decode("utf-8", errors="replace")
    status = resp.status
    conn.close()
    return status, content


def _wait_for_health(port: int, timeout_s: float = 10.0) -> None:
    start = time.time()
    while time.time() - start < timeout_s:
        try:
            conn = http.client.HTTPConnection("127.0.0.1", port, timeout=1)
            conn.request("GET", "/health")
            resp = conn.getresponse()
            _ = resp.read()
            conn.close()
            if resp.status == 200:
                return
        except OSError:
            time.sleep(0.1)
    raise RuntimeError("model-injector proxy did not become healthy in time")


def _write_model(model_file: Path, model: str) -> None:
    model_file.parent.mkdir(parents=True, exist_ok=True)
    model_file.write_text(f"{model}\n", encoding="utf-8")


def _write_cooldown(state_dir: Path, provider: str, seconds_from_now: int = 60) -> None:
    expiry = int(time.time()) + seconds_from_now
    state_dir.mkdir(parents=True, exist_ok=True)
    (state_dir / f"ratelimit-{provider}").write_text(f"{expiry}\n", encoding="utf-8")


def _clear_cooldowns(state_dir: Path) -> None:
    if not state_dir.exists():
        return
    for path in state_dir.glob("ratelimit-*"):
        path.unlink(missing_ok=True)


def _assert(cond: bool, message: str) -> None:
    if not cond:
        raise AssertionError(message)


def main() -> int:
    upstream = _start_server()
    runtime = tempfile.TemporaryDirectory(prefix="model-injector-it-")
    runtime_root = Path(runtime.name)
    state_dir = runtime_root / "credit-gate"
    model_file = state_dir / "current-model"

    listen_port = 43000 + (os.getpid() % 1000)
    env = os.environ.copy()
    env.update(
        {
            "UPSTREAM_HOST": "127.0.0.1",
            "UPSTREAM_PORT": str(upstream.server_port),
            "LISTEN_PORT": str(listen_port),
            "MODEL_FILE": str(model_file),
            "XDG_RUNTIME_DIR": str(runtime_root),
            "DEFAULT_MODEL": CASCADE_MODELS[0],
            "PYTHONUNBUFFERED": "1",
        }
    )

    injector = subprocess.Popen(
        ["python3", "scripts/ops/model-injector-proxy.py"],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        env=env,
    )

    try:
        _wait_for_health(listen_port)

        # Scenario 1: provider cooldown causes skip to next provider.
        _clear_cooldowns(state_dir)
        _write_model(model_file, CASCADE_MODELS[0])
        _write_cooldown(state_dir, "groq")
        upstream.default_status = 200  # type: ignore[attr-defined]
        upstream.status_by_model = {}  # type: ignore[attr-defined]
        before = len(upstream.request_models)  # type: ignore[attr-defined]
        status, _ = _post_json(listen_port, {"model": None, "input": "ping"})
        after_models = upstream.request_models[before:]  # type: ignore[attr-defined]
        _assert(status == 200, f"scenario1 expected 200, got {status}")
        _assert(after_models == [CASCADE_MODELS[1]], f"scenario1 expected mistral, got {after_models}")

        # Scenario 2: MAX_FAILOVER_ATTEMPTS limits provider switches.
        _clear_cooldowns(state_dir)
        _write_model(model_file, CASCADE_MODELS[0])
        upstream.default_status = 500  # type: ignore[attr-defined]
        upstream.status_by_model = {}  # type: ignore[attr-defined]
        before = len(upstream.request_models)  # type: ignore[attr-defined]
        status, _ = _post_json(listen_port, {"model": None, "input": "ping"})
        attempts = upstream.request_models[before:]  # type: ignore[attr-defined]
        expected_attempts = CASCADE_MODELS[: MAX_FAILOVER_ATTEMPTS + 1]
        _assert(status == 500, f"scenario2 expected 500, got {status}")
        _assert(
            attempts == expected_attempts,
            f"scenario2 expected attempts {expected_attempts}, got {attempts}",
        )

        # Scenario 3: all providers exhausted returns 503 from circuit breaker.
        _clear_cooldowns(state_dir)
        _write_model(model_file, CASCADE_MODELS[0])
        for provider in CASCADE_PROVIDERS:
            _write_cooldown(state_dir, provider)
        upstream.default_status = 200  # type: ignore[attr-defined]
        upstream.status_by_model = {}  # type: ignore[attr-defined]
        before = len(upstream.request_models)  # type: ignore[attr-defined]
        status, body = _post_json(listen_port, {"model": None, "input": "ping"})
        attempts = upstream.request_models[before:]  # type: ignore[attr-defined]
        _assert(status == 503, f"scenario3 expected 503, got {status}")
        _assert("All providers exhausted" in body, f"scenario3 unexpected body: {body}")
        _assert(len(attempts) == 0, f"scenario3 expected no upstream attempts, got {attempts}")

        print("provider_cascade_integration: PASS (3 scenarios)")
        return 0
    finally:
        injector.terminate()
        try:
            injector.wait(timeout=5)
        except subprocess.TimeoutExpired:
            injector.kill()
            injector.wait(timeout=2)
        upstream.shutdown()
        upstream.server_close()
        runtime.cleanup()


if __name__ == "__main__":
    raise SystemExit(main())
