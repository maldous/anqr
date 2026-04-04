import { getLibraryDocsCloud } from "./get-library-docs-cloud.mjs";
import { refreshToolRegistry } from "./refresh-tool-registry.mjs";
import { resolveLibraryIdCloud } from "./resolve-library-id-cloud.mjs";
import { resolveLibraryIdLocal } from "./resolve-library-id-local.mjs";
import { getDocumentationLocal } from "./get-documentation-local.mjs";
import { serverProcess } from "./server-process.mjs";
import { serverReady } from "./server-ready.mjs";
import { logDebug, logInfo, logWarn, logError } from "./logger.mjs";

export async function resolveDocsLocally({ libraryTitle, topic, max_tokens = 5000 }) {
  const normalizedTitle = String(libraryTitle || "").trim();
  if (!normalizedTitle) {
    logError("resolveDocsLocally called without libraryTitle");
    return { source: "error", documentation: null };
  }

  if (serverReady && serverProcess && !serverProcess.killed) {
    try {
      logDebug(`Resolving docs locally: ${normalizedTitle}`, { topic, max_tokens });

      const registry = await refreshToolRegistry();
      let libraryId = normalizedTitle.startsWith("/") ? normalizedTitle : null;

      if (!libraryId) {
        libraryId = await resolveLibraryIdLocal(registry, normalizedTitle, topic);
      }

      if (libraryId) {
        const documentation = await getDocumentationLocal(
          registry,
          libraryId,
          normalizedTitle,
          topic,
          max_tokens,
        );

        if (documentation) {
          logInfo(`Resolved docs locally for "${normalizedTitle}"`, {
            topic,
            libraryId,
            chars: documentation.length,
          });
          return { source: "local", documentation };
        }

        logWarn(`Local documentation tool returned empty for "${normalizedTitle}"`, {
          libraryId,
          docsTool: registry?.docsTool?.name,
        });
      } else {
        logWarn(`Local resolve-library-id returned no ID for "${normalizedTitle}"`, {
          resolveTool: registry?.resolveTool?.name,
        });
      }
    } catch (err) {
      logWarn(`Local MCP request failed for "${normalizedTitle}": ${err.message}`);
    }
  } else {
    logDebug("Local MCP server unavailable — skipping to cloud fallback");
  }

  logInfo(`Falling back to cloud API for "${normalizedTitle}"`);

  try {
    const libraryId = normalizedTitle.startsWith("/")
      ? normalizedTitle
      : await resolveLibraryIdCloud(normalizedTitle, topic);

    if (!libraryId) {
      logWarn(`Cloud could not resolve library ID for "${normalizedTitle}"`);
      return { source: "cloud", documentation: null };
    }

    const documentation = await getLibraryDocsCloud(libraryId, topic, max_tokens, normalizedTitle);
    if (documentation) {
      logInfo(`Resolved docs via cloud for "${normalizedTitle}"`, {
        topic,
        libraryId,
        chars: documentation.length,
      });
    }
    return { source: "cloud", documentation: documentation || null };
  } catch (err) {
    logError(`Cloud fallback failed for "${normalizedTitle}": ${err.message}`);
    return { source: "error", documentation: null };
  }
}
