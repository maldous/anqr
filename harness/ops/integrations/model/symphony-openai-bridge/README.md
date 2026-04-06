# ANQR Symphony OpenAI Bridge

## 1. Directory Overview

This directory contains the OpenAI bridge implementation for the ANQR (Agentic Number Query Runner) Symphony orchestration system. It provides an abstraction layer that translates between the Symphony provider-agnostic interface and OpenAI-compatible API endpoints, enabling OpenAI models to be used within the multi-provider credit-gate routing system.

The bridge handles authentication, request formatting, response parsing, error normalization, and streaming support for OpenAI-compatible APIs including OpenAI itself, Azure OpenAI, and other OpenAI-compatible endpoints.

## 2. File Summaries

### Core Bridge Implementation

- **index.mjs** - Main module exporting the public API including `createChatCompletion`, `createChatCompletionStream`, `listModels`, and configuration constants. Provides the primary interface for making OpenAI API calls.

- **runtime.mjs** - Runtime carry-forward that imports and executes the main index module. Provides a CLI entry point for direct execution when needed.

- **create-chat-completion.mjs** - Implements non-streaming chat completion requests. Formats requests according to OpenAI API spec, handles authentication, and parses responses.

- **create-chat-completion-stream.mjs** - Implements streaming chat completion requests. Handles Server-Sent Events (SSE) parsing for real-time token delivery.

- **list-models.mjs** - Implements model listing functionality. Queries the OpenAI-compatible endpoint for available models.

- **normalize-request.mjs** - Utility for normalizing request payloads between different OpenAI-compatible formats. Handles variations in parameter names and structures.

- **normalize-response.mjs** - Utility for normalizing response payloads to a consistent internal format. Handles variations in response structure between different OpenAI-compatible providers.

- **handle-errors.mjs** - Error handling utilities that map OpenAI API errors to standardized error types and codes.

## 3. Overall Directory Function

This directory provides the OpenAI integration layer for the Symphony orchestration system. It enables:

- **Multi-Provider Support**: Works with OpenAI, Azure OpenAI, and any OpenAI-compatible endpoint
- **Streaming Support**: Full support for streaming responses via SSE
- **Authentication**: API key and Azure AD token support
- **Error Normalization**: Consistent error handling across different OpenAI-compatible providers
- **Request/Response Transformation**: Adapts between internal and provider-specific formats

The bridge integrates with the credit-gate to provide OpenAI models as part of the multi-provider selection system, allowing the orchestrator to route requests to OpenAI endpoints alongside other provider types.

## 4. Usage Instructions

This directory is primarily used through imports from other harness modules. The index.mjs facade is the canonical entry point:

```javascript
import { createChatCompletion } from "./ops/integrations/model/symphony-openai-bridge/index.mjs";
```

### Creating a Chat Completion

```javascript
const response = await createChatCompletion({
  model: "gpt-4",
  messages: [{ role: "user", content: "Hello, world!" }],
  temperature: 0.7,
});
console.log(response.choices[0].message.content);
```

### Creating a Streaming Chat Completion

```javascript
const stream = await createChatCompletionStream({
  model: "gpt-4",
  messages: [{ role: "user", content: "Hello, world!" }],
});

for await (const chunk of stream) {
  console.log(chunk.choices[0].delta.content);
}
```

### Listing Available Models

```javascript
const models = await listModels();
console.log(models.data.map(m => m.id));
```

## 5. Dependencies

### Internal Dependencies

- **../../lib/logger.mjs** - Logger factory for bridge logging output
- **../symphony-credit-gate/providers.mjs** - Provider configuration (used for model definitions)
- **../../lib/search/hybrid-search.mjs** - Optional RAG integration for context augmentation

### External Dependencies

- **Node.js** - ESM modules with .mjs extension
- **fetch** - For HTTP requests (built-in since Node.js 18)
- **eventsource** - For SSE streaming (if not using native fetch streaming)

### Configuration Dependencies

- **OPENAI_API_KEY** - API key for OpenAI authentication
- **OPENAI_BASE_URL** - Base URL for OpenAI-compatible endpoint (default: https://api.openai.com/v1)
- **OPENAI_ORG** - Optional organization ID for OpenAI API
- **AZURE_OPENAI_API_VERSION** - Azure API version (for Azure OpenAI)

## 6. Additional Comments

- **Provider Agnostic**: The bridge works with any OpenAI-compatible endpoint, not just official OpenAI APIs.

- **Streaming Optimization**: Uses native fetch streaming where available for efficient token-by-token delivery.

- **Token Counting**: Includes basic token counting for usage tracking and cost estimation.

- **Retry Logic**: Implements automatic retry with exponential backoff for transient failures.

- **Timeout Handling**: Configurable request timeouts to prevent hanging on slow provider responses.

- **Rate Limiting Support**: Compatible with provider rate limits and supports custom rate limit handling.