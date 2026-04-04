// Generated from ../scripts/contracts-check.mjs:50

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { allowedSchemaImportSources } from "./allowed-schema-import-sources.mjs";
import { collectFiles } from "./collect-files.mjs";
import { contractsRoot } from "./contracts-root.mjs";
import { errors } from "./errors.mjs";
import { fileExists } from "./file-exists.mjs";
import { forbiddenNamePattern } from "./forbidden-name-pattern.mjs";
import { pathExists } from "./path-exists.mjs";
import { repoRoot } from "./repo-root.mjs";
import { schemaCarryingPackages } from "./schema-carrying-packages.mjs";
import { logInfo, logError } from "./logger.mjs";

export async function main() {
  if (!(await pathExists(contractsRoot))) {
    logInfo("contracts-check: packages/contracts/ does not exist yet; structural checks skipped.");
    return;
  }

  const rootEntries = await readdir(contractsRoot, { withFileTypes: true });
  const packageDirs = rootEntries
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(contractsRoot, entry.name))
    .filter((dirPath) => path.join(dirPath, "package.json"));

  const actualPackageDirs = [];
  for (const dirPath of packageDirs) {
    if (await fileExists(path.join(dirPath, "package.json"))) {
      actualPackageDirs.push(dirPath);
    }
  }

  if (actualPackageDirs.length === 0) {
    logInfo(
      "contracts-check: no packages/contracts/* workspace packages yet; structural checks skipped.",
    );
    return;
  }

  for (const packageDir of actualPackageDirs) {
    const packageName = path.basename(packageDir);
    const packageJsonPath = path.join(packageDir, "package.json");
    const readmePath = path.join(packageDir, "README.md");
    const srcDir = path.join(packageDir, "src");
    const indexPath = path.join(srcDir, "index.ts");
    const isSchemaCarrying = schemaCarryingPackages.has(packageName);

    if (!(await fileExists(readmePath))) {
      errors.push(`${path.relative(repoRoot, packageDir)}: missing README.md`);
    }
    if (!(await pathExists(srcDir))) {
      errors.push(`${path.relative(repoRoot, packageDir)}: missing src/ directory`);
      continue;
    }
    if (!(await fileExists(indexPath))) {
      errors.push(`${path.relative(repoRoot, packageDir)}: missing src/index.ts`);
    }

    const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));
    if (packageJson.type !== "module") {
      errors.push(`${path.relative(repoRoot, packageJsonPath)}: package type must be "module"`);
    }
    if (packageJson.sideEffects !== false) {
      errors.push(`${path.relative(repoRoot, packageJsonPath)}: sideEffects must be false`);
    }
    if (!packageJson.exports || !packageJson.exports["."]) {
      errors.push(
        `${path.relative(repoRoot, packageJsonPath)}: exports["."] must point at the public entrypoint`,
      );
    }
    const expectedName = `@anqr/contracts-${packageName}`;
    if (packageJson.name !== expectedName) {
      errors.push(
        `${path.relative(repoRoot, packageJsonPath)}: package name must be ${expectedName}`,
      );
    }

    const files = await collectFiles(srcDir);
    for (const filePath of files) {
      if (/\.(spec|test)\.ts$/.test(filePath)) continue;
      const relativePath = path.relative(repoRoot, filePath);
      const baseName = path.basename(filePath);
      const isIndex = baseName === "index.ts";

      if (filePath.endsWith(".tsx")) {
        errors.push(`${relativePath}: contracts must not use .tsx files`);
      }
      if (!isIndex && !filePath.endsWith(".contract.ts")) {
        errors.push(`${relativePath}: non-entrypoint contract files must end with .contract.ts`);
      }
      if (!isIndex && forbiddenNamePattern.test(baseName)) {
        errors.push(
          `${relativePath}: contract filenames must stay noun-oriented and avoid runtime concepts`,
        );
      }

      const content = await readFile(filePath, "utf8");
      if (/\bexport\s+default\b/.test(content)) {
        errors.push(`${relativePath}: default exports are forbidden in contracts`);
      }

      if (!isIndex) {
        if (isSchemaCarrying) {
          const lines = content.split("\n");
          for (const line of lines) {
            const hasRuntimeImport = /^\s*import\s+(?!type\b)/.test(line);
            if (hasRuntimeImport && !allowedSchemaImportSources.test(line)) {
              errors.push(
                `${relativePath}: schema-carrying contracts may only import runtime values from zod, @ts-rest/core, or tslib`,
              );
            }
          }
        } else if (/^\s*import\s+(?!type\b)/m.test(content)) {
          errors.push(`${relativePath}: contract files must use type-only imports`);
        }
      }

      if (/\bexport\s+(?:async\s+)?function\b/.test(content)) {
        errors.push(`${relativePath}: helper functions do not belong in contracts`);
      }
      if (/\bexport\s+class\b/.test(content)) {
        errors.push(`${relativePath}: classes do not belong in contracts`);
      }

      if (isSchemaCarrying) {
        if (/\bexport\s+(?:let|var)\b/.test(content)) {
          errors.push(`${relativePath}: only export const is allowed in schema-carrying contracts`);
        }
      } else if (/\bexport\s+(?:const|let|var)\b/.test(content)) {
        errors.push(`${relativePath}: runtime value exports do not belong in contracts`);
      }
    }
  }

  if (errors.length > 0) {
    logError("contracts-check failed:");
    for (const error of errors) logError(`- ${error}`);
    process.exitCode = 1;
    return;
  }

  logInfo(`contracts-check: validated ${actualPackageDirs.length} contract package(s)`);
}
