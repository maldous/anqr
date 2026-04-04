import http from "node:http";

import { OPENCLAW_GATEWAY_HOST } from "./openclaw-gateway-host.mjs";
import { OPENCLAW_GATEWAY_PORT } from "./openclaw-gateway-port.mjs";
import { OPENCLAW_GATEWAY_TOKEN } from "./openclaw-gateway-token.mjs";

export async function isOpenClawAvailable() {
  if (!OPENCLAW_GATEWAY_TOKEN) {
    return false;
  }

  return new Promise((resolve) => {
    const req = http.request(
      {
        hostname: OPENCLAW_GATEWAY_HOST,
        port: OPENCLAW_GATEWAY_PORT,
        path: "/health",
        method: "GET",
        timeout: 3000,
      },
      (res) => {
        resolve(res.statusCode === 200);
      },
    );

    req.on("error", () => resolve(false));
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}
