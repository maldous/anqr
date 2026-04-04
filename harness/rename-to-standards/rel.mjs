// Generated from ../scripts/rename-to-standards.mjs:56

import path from "node:path";

import { normalize } from "./normalize.mjs";

export const rel = (root, filePath) => normalize(path.relative(root, filePath));
