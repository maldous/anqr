# Handle Responses Api

## Purpose

Directory for OpenAI-compatible bridge execution and tool exposure; immediate files include `build-chat-body.mjs`, `extract-text-content.mjs`, `handle-non-streaming.mjs`, `handle-responses-api.mjs`, and others, with child directories `helpers/`.

## Contents

- 9 immediate files
- 1 child directory

## Key Files

- `build-chat-body.mjs` - Exports `buildChatBody`, the main helper defined in this file.
- `extract-text-content.mjs` - Exports `extractTextContent`, the main helper defined in this file.
- `handle-non-streaming.mjs` - Exports `handleNonStreaming`, the main helper defined in this file.
- `handle-responses-api.mjs` - Exports `handleResponsesApi`, the main helper defined in this file.
- `handle-streaming.mjs` - Exports `handleStreaming`, the main helper defined in this file.
- `helpers.mjs` - Re-export facade that assembles the public surface for this directory.
- `index.mjs` - Re-export facade that assembles the public surface for this directory.
- `responses-input-to-messages.mjs` - Exports `responsesInputToMessages`, the main helper defined in this file.
- `responses-tools-to-chat-tools.mjs` - Exports `responsesToolsToChatTools`, the main helper defined in this file.

## Subdirectories

- `helpers/` - Directory for OpenAI-compatible bridge execution and tool exposure; immediate files include `generate-id.mjs`, `index.mjs`, `sse-event.mjs`.

## Operational Notes

- Current on-disk inventory: 9 immediate files and 1 child directory.
- This README was aligned to the current directory contents rather than older architectural intent documents alone.

## Review Focus

Check whether the external-system contract in this directory still matches live usage and the intended control-plane boundaries.
