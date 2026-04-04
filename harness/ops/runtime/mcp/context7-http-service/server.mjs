import http from "node:http";

import { handleRequest } from "./handle-request.mjs";

export const server = http.createServer(handleRequest);
