import { collectProjectFiles } from "./collect-project-files.mjs";
import { computeFingerprint } from "./compute-fingerprint.mjs";
import { createHybridSearchIndex } from "./create-hybrid-search-index.mjs";
import { indexFingerprint } from "./index-fingerprint.mjs";
import { indexedDocCount } from "./indexed-doc-count.mjs";
import { miniSearchIndex } from "./mini-search-index.mjs";

export async function warmSearchIndex(options = {}) {
  const { rootDir = process.cwd() } = options;
  const projectFiles = await collectProjectFiles(rootDir);
  const fp = computeFingerprint(projectFiles);
  const rebuilt = !miniSearchIndex || fp !== indexFingerprint;

  if (rebuilt) {
    createHybridSearchIndex(projectFiles);
  }

  return {
    indexed: miniSearchIndex !== null,
    documentCount: indexedDocCount,
    rebuilt,
  };
}
