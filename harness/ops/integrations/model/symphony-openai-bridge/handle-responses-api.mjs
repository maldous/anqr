import http from "node:http";

import { PORT } from "./port.mjs";
import { MODEL_ID } from "./model-id.mjs";
import { parseBody } from "./parse-body.mjs";
import { sendJson } from "./send-json.mjs";
import { logInfo, logWarn, logError, logDebug } from "./logger.mjs";

/**
 * Translates OpenAI Responses API (POST /v1/responses) into
 * Chat Completions (POST /v1/chat/completions) internally, then
 * converts the response back to the Responses API format.
 *
 * Spec reference: https://developers.openai.com/api/reference/resources/responses
 *
 * This enables the OpenAI Codex CLI (which requires wire_api = "responses")
 * to use the Symphony bridge's provider selection and tool execution.
 */

// ── Helpers ─────────────────────────────────────────────────────────────

function generateId(prefix) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function sseEvent(res, eventType, data) {
  res.write(`event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`);
}

// ── Request translation: input → messages ──────────────────────────────

/**
 * Extracts text content from a Responses API content field.
 * Content can be a string, or an array of content parts
 * (input_text, output_text, text, refusal, or plain strings).
 */
function extractTextContent(content) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content))
    return typeof content === "object" ? JSON.stringify(content) : String(content || "");

  return content
    .map((part) => {
      if (typeof part === "string") return part;
      if (part.type === "input_text" || part.type === "text") return part.text || "";
      if (part.type === "output_text") return part.text || "";
      if (part.type === "refusal") return part.refusal || "";
      return "";
    })
    .join("");
}

/**
 * Translates Responses API `input` (plus optional `instructions`) into
 * Chat Completions `messages` array.
 *
 * Handles:
 * - String input → single user message
 * - Array of typed items: message, function_call, function_call_output
 * - Array of simplified items: { role, content }
 * - Grouping of function_call items onto preceding assistant messages
 */
function responsesInputToMessages(input, instructions) {
  const messages = [];

  // instructions → system message
  if (typeof instructions === "string" && instructions.trim()) {
    messages.push({ role: "system", content: instructions });
  }

  // Simple string input
  if (typeof input === "string") {
    messages.push({ role: "user", content: input });
    return messages;
  }

  if (!Array.isArray(input)) {
    messages.push({ role: "user", content: String(input || "") });
    return messages;
  }

  // Process array of conversation items
  for (const item of input) {
    if (typeof item === "string") {
      messages.push({ role: "user", content: item });
      continue;
    }
    if (!item || typeof item !== "object") continue;

    const itemType = item.type;

    // ── function_call: attach as tool_call on the last assistant message ──
    if (itemType === "function_call") {
      const toolCall = {
        id: item.call_id || item.id || generateId("call"),
        type: "function",
        function: {
          name: item.name || "unknown",
          arguments:
            typeof item.arguments === "string"
              ? item.arguments
              : JSON.stringify(item.arguments || {}),
        },
      };

      // Find or create the assistant message to attach this tool_call to
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && lastMsg.role === "assistant") {
        if (!lastMsg.tool_calls) lastMsg.tool_calls = [];
        lastMsg.tool_calls.push(toolCall);
      } else {
        // No preceding assistant message — create a synthetic one
        messages.push({
          role: "assistant",
          content: null,
          tool_calls: [toolCall],
        });
      }
      continue;
    }

    // ── function_call_output: convert to tool message ──
    if (itemType === "function_call_output") {
      const output =
        typeof item.output === "string" ? item.output : JSON.stringify(item.output || "");
      messages.push({
        role: "tool",
        tool_call_id: item.call_id || item.id || "",
        content: output,
      });
      continue;
    }

    // ── message item (type: "message" or implicit) ──
    // Map "developer" → "system" — the Responses API uses "developer" role
    // but the AI SDK / Chat Completions only accepts "system".
    const rawRole = item.role || "user";
    const role = rawRole === "developer" ? "system" : rawRole;
    const content = extractTextContent(item.content);
    messages.push({ role, content });
  }

  return messages;
}

// ── Request translation: tools ─────────────────────────────────────────

/**
 * Converts Responses API tool definitions to Chat Completions format.
 *
 * Responses API:  { type: "function", name, description, parameters, strict }
 * Chat Completions: { type: "function", function: { name, description, parameters, strict } }
 */
function responsesToolsToChatTools(tools) {
  if (!Array.isArray(tools) || tools.length === 0) return undefined;

  return tools
    .filter((t) => t.type === "function")
    .map((t) => ({
      type: "function",
      function: {
        name: t.name,
        description: t.description || "",
        parameters: t.parameters || { type: "object", properties: {} },
        ...(t.strict !== undefined ? { strict: t.strict } : {}),
      },
    }));
}

// ── Build the internal proxy body ──────────────────────────────────────

function buildChatBody(messages, model, stream, body) {
  const chatBody = { model, messages, stream };

  // Forward tools
  const chatTools = responsesToolsToChatTools(body.tools);
  if (chatTools && chatTools.length > 0) {
    chatBody.tools = chatTools;
  }

  // Forward tool_choice
  if (body.tool_choice !== undefined) {
    chatBody.tool_choice = body.tool_choice;
  }

  // Forward optional parameters
  if (typeof body.temperature === "number") chatBody.temperature = body.temperature;
  if (typeof body.max_output_tokens === "number") chatBody.max_tokens = body.max_output_tokens;
  if (typeof body.top_p === "number") chatBody.top_p = body.top_p;
  if (typeof body.parallel_tool_calls === "boolean")
    chatBody.parallel_tool_calls = body.parallel_tool_calls;

  return chatBody;
}

// ── Streaming handler ──────────────────────────────────────────────────

function handleStreaming(res, messages, model, body) {
  const responseId = generateId("resp");
  const created = Math.floor(Date.now() / 1000);

  // State tracking for output items
  let outputIndex = 0;
  let textItemId = null;
  let textContent = "";
  let textStarted = false;
  let textFinished = false;
  const toolCalls = new Map(); // index → { id, name, arguments, outputItemId, outputIndex }

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

// ── Non-streaming handler ──────────────────────────────────────────────

function handleNonStreaming(res, messages, model, body) {
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

// ── Main handler ───────────────────────────────────────────────────────

export async function handleResponsesApi(req, res) {
  logInfo(`📨 Responses API request received`);

  let body;
  try {
    body = await parseBody(req);
  } catch (err) {
    logWarn(`Responses API: invalid request body: ${err.message}`);
    return sendJson(res, 400, {
      error: { message: "Invalid request body", type: "invalid_request_error", code: null },
    });
  }

  const model = body.model || MODEL_ID;
  const input = body.input;
  const instructions = body.instructions || null;
  const stream = body.stream !== false; // Default to streaming per spec

  if (input === undefined || input === null) {
    return sendJson(res, 400, {
      error: {
        message: "Missing required field: input",
        type: "invalid_request_error",
        code: null,
      },
    });
  }

  const messages = responsesInputToMessages(input, instructions);

  if (messages.length === 0) {
    return sendJson(res, 400, {
      error: {
        message: "Input produced no messages — provide at least one message or string",
        type: "invalid_request_error",
        code: null,
      },
    });
  }

  logInfo(`📨 Responses API: model=${model}, messages=${messages.length}, stream=${stream}`);
  logDebug(
    `Responses API input: type=${typeof input}, isArray=${Array.isArray(input)}, tools=${body.tools?.length || 0}`,
  );

  if (stream) {
    req.setTimeout(0);
    handleStreaming(res, messages, model, body);
  } else {
    handleNonStreaming(res, messages, model, body);
  }
}
