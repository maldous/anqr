import { refreshLiveProviderCatalogs } from "./integrations/model/symphony-openai-bridge/refresh-live-provider-catalogs.mjs";
import { reloadProvidersFromCatalogCache } from "./integrations/model/symphony-credit-gate/providers.mjs";

try {
  await refreshLiveProviderCatalogs();
  reloadProvidersFromCatalogCache();
} catch {}

const { runProviderProbeDiagnostics } = await import("./integrations/model/symphony-credit-gate/provider-probe-diagnostics.mjs");

const result = await runProviderProbeDiagnostics();
const summary = result.report.summary;
console.log(`provider probes complete: ${summary.healthy} healthy, ${summary.degraded} degraded, ${summary.failed} failed`);
if (result.report.selector.wouldChoose) {
  console.log(`selector would choose ${result.report.selector.wouldChoose.providerName} via ${result.report.selector.wouldChoose.source} (${result.report.selector.wouldChoose.status})`);
} else {
  console.log("selector would choose none");
}
console.log(`json: ${result.latestJsonPath}`);
console.log(`markdown: ${result.latestMdPath}`);
