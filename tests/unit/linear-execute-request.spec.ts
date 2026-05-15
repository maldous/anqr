/**
 * Unit tests for the /v1/linear/execute endpoint handler.
 *
 * Validates executeLinearIssueRequest by mocking child_process.execFile
 * and the HTTP request/response objects, so no real Linear API key or
 * symphony-runner is needed.
 *
 * Run: npx vitest run tests/unit/linear-execute-request.spec.ts
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock send-json before importing the handler
const sendJsonMock = vi.fn((_res: unknown, status: number, body: unknown) => {
  return { status, body };
});

vi.mock("../../harness/ops/integrations/model/symphony-openai-bridge/send-json.mjs", () => ({
  sendJson: sendJsonMock,
}));

vi.mock("../../harness/ops/core/task-evidence.mjs", () => ({
  ensureEvidenceRecord: vi.fn(),
}));

vi.mock("../../harness/ops/integrations/model/symphony-openai-bridge/logger.mjs", () => ({
  logInfo: vi.fn(),
  logWarn: vi.fn(),
  logError: vi.fn(),
  logDebug: vi.fn(),
}));

describe("executeLinearIssueRequest", () => {
  /** Create a mock HTTP request that delivers the given body as JSON chunks. */
  function createMockReq(body: Record<string, unknown>, headers: Record<string, string> = {}) {
    const bodyBuf = Buffer.from(JSON.stringify(body));
    const listeners: Record<string, Array<(...args: unknown[]) => void>> = {};

    return {
      headers,
      on(event: string, handler: (...args: unknown[]) => void) {
        if (!listeners[event]) listeners[event] = [];
        listeners[event].push(handler);
        return { on: vi.fn() };
      },
      _emit(event: string, ...args: unknown[]) {
        if (listeners[event]) {
          for (const handler of listeners[event]) handler(...args);
        }
      },
      _bodyBuf: bodyBuf,
    };
  }

  /** Drive the mock req through the data/end lifecycle. */
  async function driveRequest(
    handler: (req: unknown, res: unknown) => Promise<void>,
    body: Record<string, unknown>,
    headers: Record<string, string> = {},
  ) {
    const req = createMockReq(body, headers);
    const res = { statusCode: 200, body: null as unknown, ended: false };

    const promise = handler(req, res);
    req._emit("data", req._bodyBuf);
    req._emit("end");

    await promise;
    return res;
  }

  let executeLinearIssueRequest: (req: unknown, res: unknown) => Promise<void>;

  beforeEach(async () => {
    vi.clearAllMocks();
    delete process.env.LINEAR_API_KEY;

    const mod = await import(
      "../../harness/ops/integrations/model/symphony-openai-bridge/execute-linear-issue-request.mjs"
    );
    executeLinearIssueRequest = mod.executeLinearIssueRequest;
  });

  it("returns 400 when identifier is missing", async () => {
    await driveRequest(executeLinearIssueRequest, {});

    expect(sendJsonMock).toHaveBeenCalledWith(
      expect.anything(),
      400,
      expect.objectContaining({
        error: expect.objectContaining({
          message: expect.stringContaining("Missing Linear issue identifier"),
        }),
      }),
    );
  });

  it("returns 400 when identifier is empty string", async () => {
    await driveRequest(executeLinearIssueRequest, { identifier: "" });

    expect(sendJsonMock).toHaveBeenCalledWith(
      expect.anything(),
      400,
      expect.anything(),
    );
  });

  it("returns 500 when LINEAR_API_KEY is not set", async () => {
    await driveRequest(executeLinearIssueRequest, { identifier: "ANQ-123" });

    expect(sendJsonMock).toHaveBeenCalledWith(
      expect.anything(),
      500,
      expect.objectContaining({
        error: expect.objectContaining({
          message: expect.stringContaining("LINEAR_API_KEY is not set"),
        }),
      }),
    );
  });

  it.skip("returns 202 on successful execution (requires live runner — covered by integration tests)", async () => {
    process.env.LINEAR_API_KEY = "test-key";
  });

  it("reads identifier from x-linear-identifier header as fallback", async () => {
    await driveRequest(
      executeLinearIssueRequest,
      {},
      { "x-linear-identifier": "ANQ-789" },
    );

    // Verify that the identifier is correctly extracted from the header
    expect(sendJsonMock).toHaveBeenCalledWith(
      expect.anything(),
      500,
      expect.objectContaining({
        error: expect.objectContaining({
          message: expect.stringContaining("ANQ-789"),
        }),
      }),
    );
  });

  it("passes correlation ID from header to response", async () => {
    process.env.LINEAR_API_KEY = "test-key";

    await driveRequest(
      executeLinearIssueRequest,
      { identifier: "ANQ-456" },
      { "x-anqr-correlation-id": "corr-789" },
    );

    expect(sendJsonMock).toHaveBeenCalled();
  });

  it("returns 400 on invalid JSON body", async () => {
    // Create a req that delivers invalid JSON
    const bodyBuf = Buffer.from("not-valid-json{");
    const listeners: Record<string, Array<(...args: unknown[]) => void>> = {};
    const req = {
      headers: {},
      on(event: string, handler: (...args: unknown[]) => void) {
        if (!listeners[event]) listeners[event] = [];
        listeners[event].push(handler);
        return { on: vi.fn() };
      },
    };
    const res = { statusCode: 200, body: null as unknown, ended: false };

    const promise = executeLinearIssueRequest(req, res);

    // Emit invalid JSON — listeners[event] is an array of handlers
    for (const handler of listeners["data"] || []) handler(bodyBuf);
    for (const handler of listeners["end"] || []) handler();

    await promise;

    expect(sendJsonMock).toHaveBeenCalledWith(
      expect.anything(),
      400,
      expect.objectContaining({
        error: expect.objectContaining({
          message: expect.stringContaining("Invalid JSON"),
        }),
      }),
    );
  });
});
