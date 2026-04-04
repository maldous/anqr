// Generated from ../../../../scripts/ops/runtime/mcp/context7-http-service.mjs:143

import http from "node:http";

import { handleRequest } from "./handle-request.mjs";

export const server = http.createServer(handleRequest);
