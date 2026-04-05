import { runProviderProbeDiagnostics } from './integrations/model/symphony-credit-gate/provider-probe-diagnostics.mjs';

export async function runProviderProbeReportCli() {
  try {
    const result = await runProviderProbeDiagnostics({ progress: true });
    const summary = result.report.summary;
    console.log(`provider probes complete: ${summary.healthy} healthy, ${summary.degraded} degraded, ${summary.failed} failed`);
    if (result.report.selector.wouldChoose) {
      console.log(`selector would choose ${result.report.selector.wouldChoose.providerName} via ${result.report.selector.wouldChoose.source} (${result.report.selector.wouldChoose.status})`);
    } else {
      console.log('selector would choose none');
    }
    console.log(`tool-capable: ${result.report.toolSummary.selectable}/${result.report.toolSummary.total} selectable`);
    console.log(`json: ${result.latestJsonPath}`);
    console.log(`markdown: ${result.latestMdPath}`);
    process.exit(0);
  } catch (error) {
    console.error(error?.stack || error?.message || String(error));
    process.exit(1);
  }
}
