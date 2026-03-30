import { describe, it, expect, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useDynamicTestId } from "./use-dynamic-test-id";
import { getRegistry } from "@anqr/ui-web";

describe("useDynamicTestId", () => {
  beforeEach(() => {
    // Clear registry between tests
    const registry = getRegistry();
    registry.usedBySource.clear();
    registry.countsByBase.clear();
  });

  it("should use data-testid when provided", () => {
    const { result } = renderHook(() =>
      useDynamicTestId({ "data-testid": "custom-id" }, "fallback"),
    );

    expect(result.current).toBe("custom-id");
  });

  it("should use id when data-testid not provided", () => {
    const { result } = renderHook(() => useDynamicTestId({ id: "my-id" }, "fallback"));

    expect(result.current).toBe("my-id");
  });

  it("should use name when data-testid and id not provided", () => {
    const { result } = renderHook(() => useDynamicTestId({ name: "my-name" }, "fallback"));

    expect(result.current).toBe("my-name");
  });

  it("should use aria-label with fallback prefix", () => {
    const { result } = renderHook(() =>
      useDynamicTestId({ "aria-label": "Close Button" }, "btn"),
    );

    expect(result.current).toBe("btn-close-button");
  });

  it("should use title with fallback prefix", () => {
    const { result } = renderHook(() => useDynamicTestId({ title: "Submit Form" }, "btn"));

    expect(result.current).toBe("btn-submit-form");
  });

  it("should use placeholder with fallback prefix", () => {
    const { result } = renderHook(() => useDynamicTestId({ placeholder: "Enter name" }, "input"));

    expect(result.current).toContain("input-enter-name");
  });

  it("should use react id with fallback prefix as last resort", () => {
    const { result } = renderHook(() => useDynamicTestId({}, "component"));

    expect(result.current).toMatch(/^component-/);
  });

  it("should return stable value across re-renders", () => {
    const { result, rerender } = renderHook(() => useDynamicTestId({ id: "stable" }, "fallback"));

    const firstValue = result.current;
    rerender();
    const secondValue = result.current;

    expect(firstValue).toBe(secondValue);
    expect(firstValue).toBe("stable");
  });

  it("should handle changing props", () => {
    const { result, rerender } = renderHook(
      ({ props }) => useDynamicTestId(props, "fallback"),
      {
        initialProps: { props: { id: "initial" } },
      },
    );

    expect(result.current).toBe("initial");

    rerender({ props: { id: "updated" } });
    expect(result.current).toBe("updated");
  });

  it("should prioritize data-testid over all other props", () => {
    const { result } = renderHook(() =>
      useDynamicTestId(
        {
          "data-testid": "explicit-id",
          id: "my-id",
          name: "my-name",
          "aria-label": "label",
        },
        "fallback",
      ),
    );

    expect(result.current).toBe("explicit-id");
  });

  it("should handle empty placeholder", () => {
    const { result } = renderHook(() => useDynamicTestId({ placeholder: "   " }, "input"));

    expect(result.current).toMatch(/^input-/);
  });

  it("should allocate unique ids for duplicate bases", () => {
    const { result: result1 } = renderHook(() => useDynamicTestId({ id: "button" }, "btn"));
    const { result: result2 } = renderHook(() => useDynamicTestId({ id: "button" }, "btn"));

    expect(result1.current).toBe("button");
    expect(result2.current).toBe("button-2");
  });

  it("should memoize result based on dependencies", () => {
    let callCount = 0;
    const { result, rerender } = renderHook(
      ({ props, prefix }) => {
        callCount++;
        return useDynamicTestId(props, prefix);
      },
      {
        initialProps: { props: { id: "test" }, prefix: "fallback" },
      },
    );

    const initialCallCount = callCount;
    const initialValue = result.current;

    // Re-render with same props should use memoized value
    rerender({ props: { id: "test" }, prefix: "fallback" });

    expect(result.current).toBe(initialValue);
    expect(callCount).toBeGreaterThan(initialCallCount); // Hook body re-runs, but useMemo prevents recalculation
  });
});
