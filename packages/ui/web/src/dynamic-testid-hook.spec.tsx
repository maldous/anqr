import { describe, it, expect, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useDynamicTestId } from "./dynamic-testid-hook";

describe("useDynamicTestId", () => {
  beforeEach(() => {
    const bag = globalThis as Record<string, unknown>;
    delete bag["__ANQR_DYNAMIC_TESTID_REGISTRY__"];
  });

  // ── Basic behavior ─────────────────────────────────────────────

  it("returns a string", () => {
    const { result } = renderHook(() => useDynamicTestId({}, "button"));
    expect(typeof result.current).toBe("string");
  });

  it("includes fallback prefix", () => {
    const { result } = renderHook(() => useDynamicTestId({}, "input"));
    expect(result.current).toContain("input");
  });

  it("uses explicit testId when provided", () => {
    const { result } = renderHook(() => useDynamicTestId({ testId: "custom-id" }, "button"));
    expect(result.current).toBe("custom-id");
  });

  it("uses label in testid when provided", () => {
    const { result } = renderHook(() => useDynamicTestId({ label: "Submit Form" }, "button"));
    expect(result.current).toContain("submit-form");
  });

  it("uses aria-label in testid when provided", () => {
    const { result } = renderHook(() => useDynamicTestId({ "aria-label": "Close Dialog" }, "button"));
    expect(result.current).toContain("close-dialog");
  });

  it("uses title in testid when provided", () => {
    const { result } = renderHook(() => useDynamicTestId({ title: "Save Document" }, "button"));
    expect(result.current).toContain("save-document");
  });

  it("uses name in testid when provided", () => {
    const { result } = renderHook(() => useDynamicTestId({ name: "email" }, "input"));
    expect(result.current).toContain("email");
  });

  it("uses id in testid when provided", () => {
    const { result } = renderHook(() => useDynamicTestId({ id: "field-1" }, "input"));
    expect(result.current).toContain("field-1");
  });

  // ── Stability ──────────────────────────────────────────────────

  it("returns same id across renders with same props", () => {
    const { result, rerender } = renderHook(() => useDynamicTestId({ label: "Save" }, "button"));
    const first = result.current;
    rerender();
    const second = result.current;
    expect(first).toBe(second);
  });

  it("returns same id when props object changes but values same", () => {
    const { result, rerender } = renderHook(
      ({ props }) => useDynamicTestId(props, "button"),
      { initialProps: { props: { label: "Save" } } }
    );
    const first = result.current;
    rerender({ props: { label: "Save" } });
    const second = result.current;
    expect(first).toBe(second);
  });

  // ── Uniqueness ─────────────────────────────────────────────────

  it("generates different ids for different hook instances", () => {
    const { result: result1 } = renderHook(() => useDynamicTestId({}, "button"));
    const { result: result2 } = renderHook(() => useDynamicTestId({}, "button"));
    expect(result1.current).not.toBe(result2.current);
  });

  it("appends suffix for duplicate base from different sources", () => {
    const { result: result1 } = renderHook(() => useDynamicTestId({ label: "Save" }, "button"));
    const { result: result2 } = renderHook(() => useDynamicTestId({ label: "Save" }, "button"));
    expect(result1.current).toBeTruthy();
    expect(result2.current).toBeTruthy();
    expect(result1.current).not.toBe(result2.current);
  });

  // ── Priority order ─────────────────────────────────────────────

  it("prioritizes testId over label", () => {
    const { result } = renderHook(() =>
      useDynamicTestId({ testId: "explicit", label: "Save" }, "button")
    );
    expect(result.current).toBe("explicit");
  });

  it("prioritizes label over aria-label", () => {
    const { result } = renderHook(() =>
      useDynamicTestId({ label: "Save", "aria-label": "Close" }, "button")
    );
    expect(result.current).toContain("save");
    expect(result.current).not.toContain("close");
  });

  it("prioritizes aria-label over title", () => {
    const { result } = renderHook(() =>
      useDynamicTestId({ "aria-label": "Close", title: "Info" }, "button")
    );
    expect(result.current).toContain("close");
    expect(result.current).not.toContain("info");
  });

  it("prioritizes title over name", () => {
    const { result } = renderHook(() =>
      useDynamicTestId({ title: "Field", name: "email" }, "input")
    );
    expect(result.current).toContain("field");
    expect(result.current).not.toContain("email");
  });

  it("prioritizes name over id", () => {
    const { result } = renderHook(() =>
      useDynamicTestId({ name: "email", id: "field-1" }, "input")
    );
    expect(result.current).toContain("email");
    expect(result.current).not.toContain("field-1");
  });

  // ── Normalization ──────────────────────────────────────────────

  it("normalizes label with spaces", () => {
    const { result } = renderHook(() => useDynamicTestId({ label: "Save Document" }, "button"));
    expect(result.current).toContain("save-document");
  });

  it("normalizes label with special characters", () => {
    const { result } = renderHook(() => useDynamicTestId({ label: "Save & Continue!" }, "button"));
    expect(result.current).toContain("save");
    expect(result.current).toContain("continue");
    expect(result.current).not.toContain("&");
    expect(result.current).not.toContain("!");
  });

  it("normalizes to lowercase", () => {
    const { result } = renderHook(() => useDynamicTestId({ label: "SAVE" }, "button"));
    expect(result.current).toContain("save");
    expect(result.current).not.toContain("SAVE");
  });

  // ── Edge cases ─────────────────────────────────────────────────

  it("handles empty props object", () => {
    const { result } = renderHook(() => useDynamicTestId({}, "control"));
    expect(result.current).toBeTruthy();
    expect(result.current).toContain("control");
  });

  it("handles whitespace-only label", () => {
    const { result } = renderHook(() => useDynamicTestId({ label: "   " }, "button"));
    expect(result.current).toBeTruthy();
  });

  it("handles empty string label", () => {
    const { result } = renderHook(() => useDynamicTestId({ label: "" }, "button"));
    expect(result.current).toBeTruthy();
  });

  it("handles undefined values in props", () => {
    const { result } = renderHook(() =>
      useDynamicTestId({ label: undefined, title: undefined }, "button")
    );
    expect(result.current).toBeTruthy();
  });

  it("handles null values in props", () => {
    const { result } = renderHook(() =>
      useDynamicTestId({ label: null as unknown as string }, "button")
    );
    expect(result.current).toBeTruthy();
  });
});
