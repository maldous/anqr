import { responsesToolsToChatTools } from "./responses-tools-to-chat-tools.mjs";

export function buildChatBody(messages, model, stream, body) {
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
