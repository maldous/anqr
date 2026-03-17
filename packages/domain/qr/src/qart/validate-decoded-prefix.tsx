import type { SemanticValidationResult } from "./validation";
import { semanticFailure } from "./semantic-failure";

export function validateDecodedPrefix(
  decoded: string,
  originalData: string,
): SemanticValidationResult | null {
  if (decoded.length < originalData.length) {
    return semanticFailure(
      "LENGTH_TOO_SHORT",
      `Decoded length ${decoded.length} < original length ${originalData.length}`,
      {
        expectedLength: originalData.length,
        actualLength: decoded.length,
      },
    );
  }

  for (let i = 0; i < originalData.length; i++) {
    const expectedByte = originalData.codePointAt(i)!;
    const actualByte = decoded.codePointAt(i)!;
    if (expectedByte !== actualByte) {
      return semanticFailure(
        "BYTE_MISMATCH",
        `Byte mismatch at index ${i}: expected 0x${expectedByte.toString(16)}, got 0x${actualByte.toString(16)}`,
        {
          mismatchIndex: i,
          expectedByte,
          actualByte,
        },
      );
    }
  }

  return null;
}
