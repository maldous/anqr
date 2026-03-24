import { execSync } from "node:child_process";
import { writeFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { TuiPexpectResult } from "./helpers.types";

const PEXPECT_SCRIPT = `
import pexpect, json, time, re, os

session_id = os.environ.get("TUI_SESSION", "e2e-default")
message = os.environ.get("TUI_MESSAGE", "Say ok")
timeout_secs = int(os.environ.get("TUI_TIMEOUT", "120"))

result = {
    "connected": False,
    "running": False,
    "idle": False,
    "modelInfo": "",
    "tokenInfo": "",
    "rawLength": 0,
    "elapsed": 0.0,
    "error": ""
}

start = time.time()
cmd = "openclaw tui --no-color --session {} --message '{}'".format(session_id, message)
child = pexpect.spawn(cmd, encoding="utf-8", timeout=timeout_secs + 10)

try:
    child.expect("connected", timeout=30)
    result["connected"] = True

    try:
        child.expect("running", timeout=30)
        result["running"] = True
    except pexpect.TIMEOUT:
        pass

    idx = child.expect(["idle", pexpect.TIMEOUT], timeout=timeout_secs)
    all_output = child.before or ""

    if idx == 0:
        result["idle"] = True
        time.sleep(2)
        try:
            child.expect(pexpect.TIMEOUT, timeout=2)
        except Exception:
            pass
        all_output += (child.before or "")

    stripped = re.sub(r"\\x1b\\[[0-9;]*[a-zA-Z]", "", all_output)
    stripped = re.sub(r"\\x1b\\][^\\x07]*\\x07", "", stripped)
    stripped = re.sub(r"[\\x00-\\x09\\x0b-\\x1f]", "", stripped)
    result["rawLength"] = len(stripped)

    for line in stripped.split("\\n"):
        line = line.strip()
        if "agent" in line and "|" in line:
            result["modelInfo"] = line[:200]
            break

    for line in stripped.split("\\n"):
        line = line.strip()
        if "tokens" in line.lower() and ("/" in line or "%" in line):
            result["tokenInfo"] = line[:200]
            break

except pexpect.TIMEOUT:
    result["error"] = "timeout_before_connected"
except Exception as e:
    result["error"] = str(e)[:200]
finally:
    result["elapsed"] = round(time.time() - start, 1)
    try:
        child.sendcontrol("c")
        time.sleep(0.5)
    except Exception:
        pass
    child.close()

print(json.dumps(result))
`.trimStart();

export function runTuiPromptWithPexpect(
  message: string,
  sessionId: string,
  timeoutSecs: number,
): TuiPexpectResult {
  const defaultResult: TuiPexpectResult = {
    connected: false,
    running: false,
    idle: false,
    modelInfo: "",
    tokenInfo: "",
    rawLength: 0,
    elapsed: 0,
    error: "execSync failed",
  };

  const scriptPath = join(tmpdir(), `openclaw-tui-pexpect-${Date.now()}.py`);
  try {
    writeFileSync(scriptPath, PEXPECT_SCRIPT, "utf-8");

    const cleanEnv = { ...process.env };
    delete cleanEnv.FORCE_COLOR;
    cleanEnv.NO_COLOR = "1";
    cleanEnv.TUI_SESSION = sessionId;
    cleanEnv.TUI_MESSAGE = message;
    cleanEnv.TUI_TIMEOUT = String(timeoutSecs);

    const raw = execSync(`python3 ${scriptPath}`, {
      encoding: "utf-8",
      timeout: (timeoutSecs + 40) * 1000,
      env: cleanEnv,
    });

    const lastLine = raw.trim().split("\n").pop() ?? "{}";
    return JSON.parse(lastLine) as TuiPexpectResult;
  } catch (err) {
    const msg = err instanceof Error ? err.message.slice(0, 200) : "unknown error";
    return { ...defaultResult, error: `execSync failed: ${msg}` };
  } finally {
    try {
      unlinkSync(scriptPath);
    } catch {
      /* cleanup best-effort */
    }
  }
}
