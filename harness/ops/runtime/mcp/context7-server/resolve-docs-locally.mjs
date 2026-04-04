// Generated from ../../../../scripts/ops/runtime/mcp/context7-server.mjs:467

import { extractDocumentation } from "./extract-documentation.mjs";
import { extractLibraryId } from "./extract-library-id.mjs";
import { getLibraryDocsCloud } from "./get-library-docs-cloud.mjs";
import { resolveLibraryIdCloud } from "./resolve-library-id-cloud.mjs";
import { sendRequest } from "./send-request.mjs";
import { serverProcess } from "./server-process.mjs";
import { serverReady } from "./server-ready.mjs";
import { logDebug, logInfo, logWarn, logError } from "./logger.mjs";

export async function resolveDocsLocally({ libraryTitle, topic, max_tokens = 5000 }) {
  if (!libraryTitle) {
    logError("resolveDocsLocally called without libraryTitle");
    return { source: "error", documentation: null };
  }

  // -----------------------------------------------------------------------
  // Attempt 1: Local MCP server
  // -----------------------------------------------------------------------
  if (serverReady && serverProcess && !serverProcess.killed) {
    try {
      logDebug(`Resolving docs locally: ${libraryTitle}`, { topic, max_tokens });

      // Step 1 — resolve-library-id via MCP tools/call
      // The MCP tool requires both query and libraryName as required parameters
      const resolveResult = await sendRequest("tools/call", {
        name: "resolve-library-id",
        arguments: {
          query: topic
            ? `Documentation for ${libraryTitle} focusing on ${topic}`
            : `Documentation for ${libraryTitle}`,
          libraryName: libraryTitle,
        },
      });

      const libraryId = extractLibraryId(resolveResult);
      if (libraryId) {
        // Step 2 — query-docs via MCP tools/call
        // The MCP tool requires libraryId and query as required parameters
        const docsArgs = {
          libraryId,
          query: topic || `Documentation and examples for ${libraryTitle}`,
        };

        const docsResult = await sendRequest("tools/call", {
          name: "query-docs",
          arguments: docsArgs,
        });

        const documentation = extractDocumentation(docsResult);
        if (documentation) {
          logInfo(`Resolved docs locally for "${libraryTitle}"`, {
            topic,
            chars: documentation.length,
          });
          return { source: "local", documentation };
        }

        logWarn(`Local get-library-docs returned empty for "${libraryTitle}"`);
      } else {
        logWarn(`Local resolve-library-id returned no ID for "${libraryTitle}"`);
        // Fall through to cloud fallback
      }
    } catch (err) {
      logWarn(`Local MCP request failed for "${libraryTitle}": ${err.message}`);
    }
  } else {
    logDebug("Local MCP server unavailable — skipping to cloud fallback");
  }

  // -----------------------------------------------------------------------
  // Attempt 2: Cloud API fallback
  // -----------------------------------------------------------------------
  logInfo(`Falling back to cloud API for "${libraryTitle}"`);

  try {
    const libraryId = await resolveLibraryIdCloud(libraryTitle);
    if (!libraryId) {
      logWarn(`Cloud could not resolve library ID for "${libraryTitle}"`);
      return { source: "cloud", documentation: null };
    }

    const documentation = await getLibraryDocsCloud(libraryId, topic, max_tokens);
    if (documentation) {
      logInfo(`Resolved docs via cloud for "${libraryTitle}"`, {
        topic,
        chars: documentation.length,
      });
    }
    return { source: "cloud", documentation: documentation || null };
  } catch (err) {
    logError(`Cloud fallback failed for "${libraryTitle}": ${err.message}`);
    return { source: "error", documentation: null };
  }
}
