import path from "node:path";

import { PROJECT_ROOT } from "./project-root.mjs";
import { PROVIDERS } from "./providers.mjs";
import { buildProviderProbeReport } from "./build-provider-probe-report.mjs";
import { makeProviderProbeProgressCallback } from "./make-provider-probe-progress-callback.mjs";
import { providerProbeResultsWithProgress } from "./provider-probe-results-with-progress.mjs";
import { writeProviderProbeReportFiles } from "./write-provider-probe-report-files.mjs";

export async function runProviderProbeDiagnostics(options = {}) {
  const outputDir = options.outputDir || path.join(PROJECT_ROOT, "reports", "provider-probes");
  const generatedAt = new Date().toISOString();
  const providerIndex = new Map(PROVIDERS.map((provider, index) => [provider.name, index + 1]));
  const progress = options.progress
    ? makeProviderProbeProgressCallback({ total: PROVIDERS.length, providerIndex })
    : null;
  const results = await providerProbeResultsWithProgress(PROVIDERS, progress);
  const report = buildProviderProbeReport(generatedAt, results);
  const paths = await writeProviderProbeReportFiles(outputDir, generatedAt, report);
  return { report, ...paths };
}
