import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const sourcePath = path.join(repoRoot, 'openapi.yaml');
const targetDir = path.join(repoRoot, 'public');
const targetPath = path.join(targetDir, 'openapi.yaml');

await fs.mkdir(targetDir, { recursive: true });
await fs.copyFile(sourcePath, targetPath);
console.log(
  `[sync-openapi-public] synced ${path.relative(repoRoot, sourcePath)} -> ${path.relative(repoRoot, targetPath)}`
);
