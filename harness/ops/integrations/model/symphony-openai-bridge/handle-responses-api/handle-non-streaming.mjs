import http from "node:http";

import { PORT } from "../port.mjs";
import { sendJson } from "../send-json.mjs";
import { logInfo, logError } from "../logger.mjs";
import { generateId } from "./helpers.mjs";
import { buildChatBody } from "./build-chat-body.mjs";

export function handleNonStreaming(res, messages, model, body) {
  const responseId = generateId("resp");
  const created = Math.floor(Date.now() / 1000);

  const chatBody = JSON.stringify(buildChatBody(messages, model, false, body));

  const proxyReq = http.request(
    {
      hostname: "127.0.0.1",
      port: PORT,
      path: "/v1/chat/completions",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(chatBody),
        "x-worktree-id": "codex",
        "x-symphony-origin": "runner",
      },
    },
    (proxyRes) => {
      let data = "";
      proxyRes.on("data", (chunk) => {
        data += chunk.toString();
      });
      proxyRes.on("end", () => {
        try {
          const chatResponse = JSON.parse(data);

          // Check for error responses from the chat completions endpoint
          if (chatResponse.error) {
            return sendJson(res, proxyRes.statusCode || 500, {
              error: chatResponse.error,
            });
          }

          const choice = chatResponse.choices?.[0];
          const message = choice?.message || {};
          const output = [];

          // ── Text content → message output item ──
          if (message.content) {
            output.push({
              id: generateId("msg"),
              type: "message",
              role: "assistant",
              status: "completed",
              content: [{ type: "output_text", text: message.content }],
            });
          }

          // ── Tool calls → function_call output items ──
          if (Array.isArray(message.tool_calls)) {
            for (const tc of message.tool_calls) {
              output.push({
                id: generateId("fc"),
                type: "function_call",
                call_id: tc.id || generateId("call"),
                name: tc.function?.name || "unknown",
                arguments: tc.function?.arguments || "{}",
                status: "completed",
              });
            }
          }

          // If no content and no tool calls, add empty message
          if (output.length === 0) {
            output.push({
              id: generateId("msg"),
              type: "message",
              role: "assistant",
              status: "completed",
              content: [{ type: "output_text", text: "" }],
            });
          }

          const usage = chatResponse.usage
            ? {
                input_tokens: chatResponse.usage.prompt_tokens || 0,
                output_tokens: chatResponse.usage.completion_tokens || 0,
                total_tokens: chatResponse.usage.total_tokens || 0,
              }
            : { input_tokens: 0, output_tokens: 0, total_tokens: 0 };

          sendJson(res, 200, {
            id: responseId,
            object: "response",
            created_at: created,
            model,
            status: "completed",
            output,
            usage,
          });

          const textLength = output
            .filter((o) => o.type === "message")
            .reduce((sum, o) => sum + (o.content?.[0]?.text?.length || 0), 0);
          const toolCallCount = output.filter((o) => o.type === "function_call").length;
          logInfo(
            `✅ Responses API: returned ${textLength} chars, ${toolCallCount} tool calls (response=${responseId})`,
          );
        } catch (err) {
          logError(`Responses API: failed to parse chat response: ${err.message}`);
          sendJson(res, 502, {
            error: { message: `Bridge error: ${err.message}`, type: "server_error", code: null },
          });
        }
      });
    },
  );

  proxyReq.on("error", (err) => {
    logError(`Responses API proxy error: ${err.message}`);
    sendJson(res, 502, {
      error: { message: `Bridge unavailable: ${err.message}`, type: "server_error", code: null },
    });
  });

  proxyReq.end(chatBody);
}
