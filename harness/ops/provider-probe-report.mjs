import { runProviderProbeDiagnostics } from "./integrations/model/symphony-credit-gate/provider-probe-diagnostics.mjs";
import { saveProbeCache } from "./integrations/model/symphony-credit-gate/save-probe-cache.mjs";

const result = await runProviderProbeDiagnostics();
saveProbeCache({ lastProbeAt: result.report.generatedAt, probeResults: result.report.results });
const summary = result.report.summary;
console.log(
  `provider probes complete: ${summary.healthy} healthy, ${summary.degraded} degraded, ${summary.failed} failed`,
);
if (result.report.selector.wouldChoose) {
  console.log(
    `selector would choose ${result.report.selector.wouldChoose.providerName} via ${result.report.selector.wouldChoose.source} (${result.report.selector.wouldChoose.status})`,
  );
} else {
  console.log("selector would choose none");
}
console.log(`json: ${result.latestJsonPath}`);
console.log(`markdown: ${result.latestMdPath}`);
await new Promise((resolve) => process.stdout.write("", resolve));
await new Promise((resolve) => process.stderr.write("", resolve));
process.exit(0);
