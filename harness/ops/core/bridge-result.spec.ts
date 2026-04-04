import { describe, it, expect } from "vitest";
import { inferSymphonyResultFromCompletion, normalizeSymphonyResult } from "./bridge-result.mjs";

describe("bridge-result helpers", () => {
  it("normalizes an existing structured result", () => {
    const result = normalizeSymphonyResult({
      completed: true,
      needsContinuation: false,
      failureClass: "",
      mutationCount: 2,
      changedFiles: [" a.ts ", "", 123 as unknown as string, "b.ts"],
      validationIntent: true,
      toolCallCount: 4,
      stepCount: 3,
    });

    expect(result).toEqual({
      completed: true,
      needsContinuation: false,
      failureClass: null,
      mutationCount: 2,
      changedFiles: ["a.ts", "b.ts"],
      validationIntent: true,
      toolCallCount: 4,
      stepCount: 3,
    });
  });

  it("does NOT infer completion from a stop finish reason (fail closed)", () => {
    const result = inferSymphonyResultFromCompletion({
      finishReason: "stop" as never,
      text: "Completed the task successfully.",
    });

    expect(result).toMatchObject({
      completed: false,
      needsContinuation: false,
    });
  });

  it("preserves explicit completed:true from existing structured result", () => {
    const result = inferSymphonyResultFromCompletion({
      existingResult: {
        completed: true,
        needsContinuation: false,
        failureClass: null,
        mutationCount: 3,
        changedFiles: ["a.ts"],
        validationIntent: true,
        toolCallCount: 5,
        stepCount: 2,
      },
    });

    expect(result).toMatchObject({
      completed: true,
      needsContinuation: false,
      failureClass: null,
    });
  });

  it("infers continuation from a length finish reason", () => {
    const result = inferSymphonyResultFromCompletion({
      finishReason: "length" as never,
      text: "Still working.",
    });

    expect(result).toMatchObject({
      completed: false,
      needsContinuation: true,
      failureClass: null,
    });
  });

  it("infers step-limit failures from tool-calls finish reason", () => {
    const result = inferSymphonyResultFromCompletion({
      finishReason: "tool-calls" as never,
      text: "Partial output.",
    });

    expect(result).toMatchObject({
      completed: false,
      needsContinuation: true,
      failureClass: "step_limit_reached",
    });
  });

  it("does not guess without a finish reason unless explicitly allowed", () => {
    expect(
      inferSymphonyResultFromCompletion({
        text: "Some text without protocol metadata.",
      }),
    ).toBeNull();

    expect(
      inferSymphonyResultFromCompletion({
        text: "Some text without protocol metadata.",
        allowTextOnlyCompletion: true,
      }),
    ).toMatchObject({
      completed: false,
      needsContinuation: false,
      failureClass: "contract_missing",
    });
  });
});
