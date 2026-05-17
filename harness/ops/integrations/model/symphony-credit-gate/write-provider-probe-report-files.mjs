import fs from "node:fs/promises";
import path from "node:path";

import { buildProviderProbeMarkdown } from "./build-provider-probe-markdown.mjs";

export async function writeProviderProbeReportFiles(outputDir, generatedAt, report) {
  await fs.mkdir(outputDir, { recursive: true });
  const stamp = generatedAt.replaceAll(/[:.]/g, "-");
  const jsonPath = path.join(outputDir, `provider-probe-report.${stamp}.json`);
  const mdPath = path.join(outputDir, `provider-probe-report.${stamp}.md`);
  const latestJsonPath = path.join(outputDir, "provider-probe-report.latest.json");
  const latestMdPath = path.join(outputDir, "provider-probe-report.latest.md");
  const jsonText = `${JSON.stringify(report, null, 2)}
`;
  const mdText = buildProviderProbeMarkdown(report);
  await fs.writeFile(jsonPath, jsonText);
  await fs.writeFile(mdPath, mdText);
  await fs.writeFile(latestJsonPath, jsonText);
  await fs.writeFile(latestMdPath, mdText);
  return { jsonPath, mdPath, latestJsonPath, latestMdPath };
}
