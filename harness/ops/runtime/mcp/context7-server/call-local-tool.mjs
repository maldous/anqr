import { sendRequest } from "./send-request.mjs";

export async function callLocalTool(name, args) {
  return sendRequest("tools/call", {
    name,
    arguments: args || {},
  });
}
