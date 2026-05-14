import { spawn } from "node:child_process";

export function spawnTuiAndCapture(
  messageText: string,
  captureMs = 15_000,
): Promise<{ output: string; exitCode: number | null }> {
  return new Promise((resolve) => {
    let output = "";
    let child: ReturnType<typeof spawn>;
    try {
      child = spawn(
        "script",
        ["-qc", `openclaw tui --message "${messageText}"`, "/dev/null"],
        {
          env: { ...process.env, NO_COLOR: "1", TERM: "dumb" },
          stdio: ["pipe", "pipe", "pipe"],
        },
      );
    } catch {
      resolve({ output: "", exitCode: 1 });
      return;
    }

    child.stdout?.on("data", (data: Buffer) => {
      output += data.toString();
    });
    child.stderr?.on("data", (data: Buffer) => {
      output += data.toString();
    });

    const timer = setTimeout(() => {
      child.kill("SIGTERM");
      setTimeout(() => {
        child.kill("SIGKILL");
        resolve({ output, exitCode: null });
      }, 2_000);
    }, captureMs);

    child.on("exit", (code) => {
      clearTimeout(timer);
      resolve({ output, exitCode: code });
    });
  });
}
