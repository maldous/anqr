# Handle Responses Api

## Purpose

Handle Responses Api contains the code, configuration, or support files that implement this part of the harness architecture.

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

- `helpers/` - Helpers scope; immediate files include `generate-id.mjs`, `index.mjs`, `sse-event.mjs`.

## Operational Notes

- Current on-disk inventory: 9 immediate file(s) and 1 child directory.
- This README was refreshed against the current source tree rather than older intent docs alone.

## Review Focus

Check that the current implementation in this directory still matches its intended role in the harness architecture.
