import fs from "node:fs";
import path from "node:path";
import { MIME } from "./constants.mjs";

export function serveStatic(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  try {
    const content = fs.readFileSync(filePath);
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream", "Cache-Control": "no-store,no-cache,must-revalidate" });
    res.end(content);
  } catch {
    res.writeHead(404, { "Content-Type":"application/json" }); res.end('{"error":"Not found"}');
  }
}
