import { formatArgs } from "./install-console-output-guard/format-args.mjs";

const CONSOLE_GUARD_KEY = Symbol.for("anqr.symphony-openai-bridge.console-guard");

export function installConsoleOutputGuard() {
  if (globalThis[CONSOLE_GUARD_KEY]) return;
  globalThis[CONSOLE_GUARD_KEY] = true;

  for (const methodName of ["error", "warn"]) {
    const original = console[methodName].bind(console);
    console[methodName] = (...args) => original(formatArgs(args));
  }
}
