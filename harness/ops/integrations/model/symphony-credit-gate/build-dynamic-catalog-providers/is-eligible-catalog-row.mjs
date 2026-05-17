import { extractParamCountB } from "../extract-param-count-b.mjs";
import { supportsTextIO } from "./supports-text-io.mjs";

const EXCLUDED_MODEL_PATTERNS = [
  /whisper/i,
  /transcrib/i,
  /tts/i,
  /speech/i,
  /audio/i,
  /moderat/i,
  /guard/i,
  /embed/i,
  /embedding/i,
  /rerank/i,
  /re-rank/i,
  /ocr/i,
  /vision/i,
  /image/i,
  /translate/i,
  /translation/i,
  /orpheus/i,
  /reward/i,
  /judge/i,
  /evaluator/i,
  /prover/i,
  /reasoning-parser/i,
  /(?:^|[-/])vl(?:$|[-/])/i,
];

const MIN_CODING_PARAMS_B = 14;

export function isEligibleCatalogRow(row) {
  const model = String(row?.model || row?.id || "").trim();
  if (!model) return false;
  if (EXCLUDED_MODEL_PATTERNS.some((pattern) => pattern.test(model))) return false;
  if (!supportsTextIO(row?.raw || row)) return false;
  if (row?.toolSupport === "unsupported") return false;
  const paramB = extractParamCountB(model);
  if (paramB !== null && paramB < MIN_CODING_PARAMS_B) return false;
  return true;
}
