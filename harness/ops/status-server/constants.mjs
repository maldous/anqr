export const PORT = Number.parseInt(process.env.STATUS_SERVER_PORT || "18800", 10);
export const PUBLIC_DIR = path.resolve(__dirname, "public");
export const REPO_ROOT = path.resolve(__dirname, "../../..");
export const REFRESH_INTERVAL_MS = 30_000;
export const COMMITS_REFRESH_MS = 60_000;
export const ISSUES_REFRESH_MS = 60_000;
export const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css":  "text/css; charset=utf-8",
  ".js":   "application/javascript; charset=utf-8",
  ".json": "application/json",
  ".svg":  "image/svg+xml",
  ".png":  "image/png",
  ".ico":  "image/x-icon",
};