import crypto from "node:crypto";

import { VALIDATION_MANIFEST } from "./validation-manifest.mjs";

export function validationManifestHash() {
  return crypto.createHash("sha256").update(JSON.stringify(VALIDATION_MANIFEST)).digest("hex");
}
