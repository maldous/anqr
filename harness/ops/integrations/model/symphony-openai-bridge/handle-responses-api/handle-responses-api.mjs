import { MODEL_ID } from "../model-id.mjs";
import { parseBody } from "../parse-body.mjs";
import { sendJson } from "../send-json.mjs";
import { logInfo, logWarn, logDebug } from "../logger.mjs";
import { responsesInputToMessages } from "./responses-input-to-messages.mjs";
import { handleStreaming } from "./handle-streaming.mjs";
import { handleNonStreaming } from "./handle-non-streaming.mjs";

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
