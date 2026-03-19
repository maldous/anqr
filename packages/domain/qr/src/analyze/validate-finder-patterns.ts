import { createLogger } from "@/domain/logging";

const qrAnalyzerLog = createLogger("ANALYZER");

export function validateFinderPatterns(matrix: boolean[][], moduleCount: number): void {
  const tlCorners = [
    { row: 0, col: 0, expected: true, name: "TL outer corner" },
    { row: 0, col: 6, expected: true, name: "TL outer top-right" },
    { row: 6, col: 0, expected: true, name: "TL outer bottom-left" },
    { row: 6, col: 6, expected: true, name: "TL outer bottom-right" },
    { row: 1, col: 1, expected: false, name: "TL white ring" },
    { row: 3, col: 3, expected: true, name: "TL center" },
  ];

  const trCorners = [
    { row: 0, col: moduleCount - 1, expected: true, name: "TR outer corner" },
    { row: 0, col: moduleCount - 7, expected: true, name: "TR outer left" },
    { row: 3, col: moduleCount - 4, expected: true, name: "TR center" },
  ];

  const blCorners = [
    { row: moduleCount - 1, col: 0, expected: true, name: "BL outer corner" },
    { row: moduleCount - 7, col: 0, expected: true, name: "BL outer top" },
    { row: moduleCount - 4, col: 3, expected: true, name: "BL center" },
  ];

  const allChecks = [...tlCorners, ...trCorners, ...blCorners];
  let correct = 0;
  let incorrect = 0;

  for (const check of allChecks) {
    const actual = matrix[check.row]?.[check.col] ?? false;
    if (actual === check.expected) {
      correct++;
    } else {
      incorrect++;
      qrAnalyzerLog.debug(`validation: Mismatch ${check.name}`, {
        row: check.row,
        col: check.col,
        expected: check.expected ? "dark" : "light",
        actual: actual ? "dark" : "light",
      });
    }
  }

  qrAnalyzerLog.trace("validation: Finder pattern validation", {
    correct,
    incorrect,
    total: allChecks.length,
    accuracy: `${((correct / allChecks.length) * 100).toFixed(1)}%`,
  });
}
