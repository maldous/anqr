import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const PORT = Number.parseInt(process.env.STATUS_SERVER_PORT || "18800", 10);
export const PUBLIC_DIR = path.resolve(__dirname, "../public");
export const REPO_ROOT = path.resolve(__dirname, "../../../..");
export const BRIDGE_STATE = process.env.XDG_RUNTIME_DIR
  ? `${process.env.XDG_RUNTIME_DIR}/anqr-bridge-state`
  : "/run/user/1000/anqr-bridge-state";
export const SYMPHONY_STATE_PATH = process.env.XDG_RUNTIME_DIR
  ? `${process.env.XDG_RUNTIME_DIR}/anqr-symphony-state/state.json`
  : "/run/user/1000/anqr-symphony-state/state.json";

export const SERVICES = [
  { id: "symphony-router",  name: "Symphony Router",  url: "http://127.0.0.1:4319/health",  critical: true  },
  { id: "discord-router",   name: "Discord Router",   url: "http://127.0.0.1:18790/health", critical: true  },
  { id: "linear-webhook",   name: "Linear Webhook",   url: "http://127.0.0.1:18795/health", critical: true  },
  { id: "context7-mcp",     name: "Context7 MCP",     url: "http://127.0.0.1:4320/health",  critical: false },
  { id: "openclaw-gateway", name: "OpenClaw Gateway", url: "http://127.0.0.1:18789/health", critical: false },
  { id: "ollama",           name: "Ollama",            url: "http://127.0.0.1:11434/",       critical: false },
  { id: "executor-wt1",     name: "Executor wt1",     url: "http://127.0.0.1:4321/health",  critical: false },
  { id: "executor-wt2",     name: "Executor wt2",     url: "http://127.0.0.1:4322/health",  critical: false },
  { id: "executor-wt3",     name: "Executor wt3",     url: "http://127.0.0.1:4323/health",  critical: false },
  { id: "executor-wt4",     name: "Executor wt4",     url: "http://127.0.0.1:4324/health",  critical: false },
  { id: "executor-wt5",     name: "Executor wt5",     url: "http://127.0.0.1:4325/health",  critical: false },
  { id: "executor-wt6",     name: "Executor wt6",     url: "http://127.0.0.1:4326/health",  critical: false },
  { id: "executor-wt7",     name: "Executor wt7",     url: "http://127.0.0.1:4327/health",  critical: false },
  { id: "executor-wt8",     name: "Executor wt8",     url: "http://127.0.0.1:4328/health",  critical: false },
];

export const MIME = { ".html":"text/html;charset=utf-8",".css":"text/css;charset=utf-8",".js":"application/javascript;charset=utf-8",".json":"application/json",".svg":"image/svg+xml" };
