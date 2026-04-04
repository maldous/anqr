import { logTestResult } from "./log-test-result.mjs";

export async function assertCondition(testName, condition, errorMessage) {
  try {
    if (!condition) {
      throw new Error(errorMessage);
    }
    logTestResult(testName, true, "Condition met");
  } catch (error) {
    logTestResult(testName, false, error.message);
    throw error;
  }
}
