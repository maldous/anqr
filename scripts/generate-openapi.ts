import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateOpenApi } from "@ts-rest/open-api";
import { qrApiContract } from "../packages/contracts/api/src";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(repoRoot, "docs", "api");
const outputPath = path.join(outputDir, "qr-api.openapi.json");

const openApiDocument = generateOpenApi(qrApiContract, {
  info: {
    title: "ANQR QR API",
    version: "1.0.0",
    description: "Contract-backed QR generation API hosted at https://anqr.link.",
  },
  servers: [{ url: "https://anqr.link" }],
});

await mkdir(outputDir, { recursive: true });
await writeFile(outputPath, JSON.stringify(openApiDocument, null, 2));
console.log(`Generated ${path.relative(repoRoot, outputPath)}`);
