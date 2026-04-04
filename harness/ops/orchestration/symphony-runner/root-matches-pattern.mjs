import { ROOT } from "./root.mjs";
import { expectedPattern } from "./expected-pattern.mjs";

export const rootMatchesPattern = expectedPattern.test(ROOT);
