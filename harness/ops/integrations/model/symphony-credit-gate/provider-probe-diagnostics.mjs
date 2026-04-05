import path from "node:path";

import { PROJECT_ROOT } from "./project-root.mjs";
import { buildProviderProbeReport } from "./build-provider-probe-report.mjs";
import { buildProviderProbeResults } from "./build-provider-probe-results.mjs";
import { reloadProvidersFromCatalogCache } from "./providers.mjs";
import { writeProviderProbeReportFiles } from "./write-provider-probe-report-files.mjs";
import { refreshLiveProviderCatalogs } from "../symphony-openai-bridge/refresh-live-provider-catalogs.mjs";

export async function runProviderProbeDiagnostics(options = {}) {
  const outputDir = options.outputDir || path.join(PROJECT_ROOT, "reports", "provider-probes");
  try {
    await refreshLiveProviderCatalogs();
    reloadProvidersFromCatalogCache();
  } catch {}
  const generatedAt = new Date().toISOString();
  const results = await buildProviderProbeResults();
  const report = buildProviderProbeReport(generatedAt, results);
  const paths = await writeProviderProbeReportFiles(outputDir, generatedAt, report);
  return { report, ...paths };
}
