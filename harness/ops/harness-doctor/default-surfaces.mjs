import { resolve } from "node:path";
import { homedir } from "node:os";

/**
 * Default env surfaces derived from the repo template.
 * Each surface is a host-local env file that must stay aligned
 * with the authoritative key inventory in the repo template.
 */
export function defaultSurfaces() {
  return [
    { name: "systemd", path: resolve(homedir(), ".config/systemd/user/anqr-ops.env") },
    { name: "symphony", path: resolve(homedir(), ".config/symphony/anqr.env") },
    { name: "openclaw", path: resolve(homedir(), ".openclaw/.env") },
  ];
}
