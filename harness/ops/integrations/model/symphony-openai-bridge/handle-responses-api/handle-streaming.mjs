import http from "node:http";

import { PORT } from "../port.mjs";
import { logInfo, logError } from "../logger.mjs";
import { generateId, sseEvent } from "./helpers.mjs";
import { buildChatBody } from "./build-chat-body.mjs";

export function handleStreaming(res, messages, model, body) {
  const responseId = generateId("resp");
  const created = Math.floor(Date.now() / 1000);

  // State tracking for output items
  let outputIndex = 0;
  let textItemId = null;
  let textContent = "";
  let textStarted = false;
  let textFinished = false;
  const toolCalls = new Map();

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });

  // ── Emit initial response.created ──
  sseEvent(res, "response.created", {
    type: "response.created",
    response: {
      id: responseId,
      object: "response",
      created_at: created,
      model,
      status: "in_progress",
      output: [],
    },
  });

  // ── Helpers for emitting output item lifecycle events ──

  let textOutputIndex = -1;

  function startTextItem() {
    if (textStarted) return;
    textStarted = true;
    textItemId = generateId("msg");
    textOutputIndex = outputIndex++;

    sseEvent(res, "response.output_item.added", {
      type: "response.output_item.added",
      output_index: textOutputIndex,
      item: {
        id: textItemId,
        type: "message",
        role: "assistant",
        status: "in_progress",
        content: [],
      },
    });

    sseEvent(res, "response.content_part.added", {
      type: "response.content_part.added",
      output_index: textOutputIndex,
      content_index: 0,
      item_id: textItemId,
      part: { type: "output_text", text: "" },
    });
  }

  function finishTextItem() {
    if (!textStarted || textFinished) return;
    textFinished = true;

    sseEvent(res, "response.output_text.done", {
      type: "response.output_text.done",
      output_index: textOutputIndex,
      content_index: 0,
      item_id: textItemId,
      text: textContent,
    });

    sseEvent(res, "response.content_part.done", {
      type: "response.content_part.done",
      output_index: textOutputIndex,
      content_index: 0,
      item_id: textItemId,
      part: { type: "output_text", text: textContent },
    });

    sseEvent(res, "response.output_item.done", {
      type: "response.output_item.done",
      output_index: textOutputIndex,
      item: {
        id: textItemId,
        type: "message",
        role: "assistant",
        status: "completed",
        content: [{ type: "output_text", text: textContent }],
      },
    });
  }

  function startToolCall(index, id, name) {
    const outputItemId = generateId("fc");
    const itemOutputIndex = outputIndex++;
    toolCalls.set(index, {
      id: id || generateId("call"),
      name: name || "",
      arguments: "",
      outputItemId,
      outputIndex: itemOutputIndex,
    });

    sseEvent(res, "response.output_item.added", {
      type: "response.output_item.added",
      output_index: itemOutputIndex,
      item: {
        id: outputItemId,
        type: "function_call",
        call_id: toolCalls.get(index).id,
        name: name || "",
        arguments: "",
        status: "in_progress",
      },
    });
  }

  function appendToolCallArguments(index, argDelta) {
    const tc = toolCalls.get(index);
    if (!tc) return;
    tc.arguments += argDelta;

    sseEvent(res, "response.function_call_arguments.delta", {
      type: "response.function_call_arguments.delta",
      output_index: tc.outputIndex,
      item_id: tc.outputItemId,
      call_id: tc.id,
      delta: argDelta,
    });
  }

  function finishToolCall(index) {
    const tc = toolCalls.get(index);
    if (!tc) return;

    sseEvent(res, "response.function_call_arguments.done", {
      type: "response.function_call_arguments.done",
      output_index: tc.outputIndex,
      item_id: tc.outputItemId,
      call_id: tc.id,
      arguments: tc.arguments,
    });

    sseEvent(res, "response.output_item.done", {
      type: "response.output_item.done",
      output_index: tc.outputIndex,
      item: {
        id: tc.outputItemId,
        type: "function_call",
        call_id: tc.id,
        name: tc.name,
        arguments: tc.arguments,
        status: "completed",
      },
    });
  }

  // ── Proxy to internal chat completions endpoint ──

  const chatBody = JSON.stringify(buildChatBody(messages, model, true, body));

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
      let buffer = "";

      proxyRes.on("data", (chunk) => {
        buffer += chunk.toString();
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(":")) continue;
          if (trimmed === "data: [DONE]") continue;
          if (!trimmed.startsWith("data: ")) continue;

          try {
            const data = JSON.parse(trimmed.slice(6));
            const choice = data.choices?.[0];
            if (!choice) continue;

            const delta = choice.delta || {};

            // ── Text content ──
            if (typeof delta.content === "string" && delta.content.length > 0) {
              startTextItem();
              textContent += delta.content;
              sseEvent(res, "response.output_text.delta", {
                type: "response.output_text.delta",
                output_index: textOutputIndex,
                content_index: 0,
                item_id: textItemId,
                delta: delta.content,
              });
            }

            // ── Tool calls ──
            if (Array.isArray(delta.tool_calls)) {
              for (const tc of delta.tool_calls) {
                const idx = tc.index ?? 0;

                // New tool call (has id)
                if (tc.id) {
                  // Finish text item first if active
                  if (textStarted && !textFinished) {
                    finishTextItem();
                  }
                  startToolCall(idx, tc.id, tc.function?.name);
                }

                // Argument delta
                if (tc.function?.arguments) {
                  // Handle name arriving in a subsequent chunk
                  const existing = toolCalls.get(idx);
                  if (existing && tc.function.name && !existing.name) {
                    existing.name = tc.function.name;
                  }
                  appendToolCallArguments(idx, tc.function.arguments);
                }
              }
            }
          } catch {
            // Skip unparseable lines
          }
        }
      });

      proxyRes.on("end", () => {
        // Process remaining buffer
        if (buffer.trim().startsWith("data: ") && buffer.trim() !== "data: [DONE]") {
          try {
            const data = JSON.parse(buffer.trim().slice(6));
            const delta = data.choices?.[0]?.delta;
            if (delta?.content) {
              startTextItem();
              textContent += delta.content;
              sseEvent(res, "response.output_text.delta", {
                type: "response.output_text.delta",
                output_index: textOutputIndex,
                content_index: 0,
                item_id: textItemId,
                delta: delta.content,
              });
            }
          } catch {
            // Skip
          }
        }

        // Finish text item if active and not already finished
        finishTextItem();

        // Finish all tool calls
        for (const [idx] of toolCalls) {
          finishToolCall(idx);
        }

        // Build final output array
        const output = [];
        if (textStarted) {
          output.push({
            id: textItemId,
            type: "message",
            role: "assistant",
            status: "completed",
            content: [{ type: "output_text", text: textContent }],
          });
        }
        for (const [, tc] of toolCalls) {
          output.push({
            id: tc.outputItemId,
            type: "function_call",
            call_id: tc.id,
            name: tc.name,
            arguments: tc.arguments,
            status: "completed",
          });
        }

        sseEvent(res, "response.completed", {
          type: "response.completed",
          response: {
            id: responseId,
            object: "response",
            created_at: created,
            model,
            status: "completed",
            output,
            usage: { input_tokens: 0, output_tokens: 0, total_tokens: 0 },
          },
        });

        res.end();
        logInfo(
          `✅ Responses API: streamed ${textContent.length} chars, ${toolCalls.size} tool calls (response=${responseId})`,
        );
      });

      proxyRes.on("error", (err) => {
        logError(`Responses API proxy stream error: ${err.message}`);
        sseEvent(res, "response.failed", {
          type: "response.failed",
          response: {
            id: responseId,
            object: "response",
            status: "failed",
            error: { message: err.message, type: "server_error", code: null },
          },
        });
        res.end();
      });
    },
  );

  proxyReq.on("error", (err) => {
    logError(`Responses API proxy request error: ${err.message}`);
    sseEvent(res, "response.failed", {
      type: "response.failed",
      response: {
        id: responseId,
        object: "response",
        status: "failed",
        error: { message: err.message, type: "server_error", code: null },
      },
    });
    res.end();
  });

  proxyReq.end(chatBody);
}
