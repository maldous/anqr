import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { YieldController } from "./generation-class-yieldcontroller";

describe("YieldController", () => {
  let controller: YieldController;

  beforeEach(() => {
    controller = new YieldController();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("reset", () => {
    it("sets lastYieldTime to current time", () => {
      const now = 1000;
      const spy = vi.spyOn(performance, "now").mockReturnValue(now);

      controller.reset();

      expect(spy).toHaveBeenCalled();
    });

    it("can be called multiple times", () => {
      const spy = vi.spyOn(performance, "now").mockReturnValue(1000);

      controller.reset();
      controller.reset();
      controller.reset();

      expect(spy).toHaveBeenCalled();
    });
  });

  describe("shouldYield", () => {
    it("returns false immediately after reset", () => {
      vi.spyOn(performance, "now").mockReturnValue(1000);
      controller.reset();

      vi.spyOn(performance, "now").mockReturnValue(1005);
      expect(controller.shouldYield()).toBe(false);
    });

    it("returns true after YIELD_INTERVAL_MS has passed", () => {
      vi.spyOn(performance, "now").mockReturnValue(1000);
      controller.reset();

      vi.spyOn(performance, "now").mockReturnValue(1017);
      expect(controller.shouldYield()).toBe(true);
    });

    it("returns false before YIELD_INTERVAL_MS has passed", () => {
      vi.spyOn(performance, "now").mockReturnValue(1000);
      controller.reset();

      vi.spyOn(performance, "now").mockReturnValue(1015);
      expect(controller.shouldYield()).toBe(false);
    });

    it("returns true at exactly YIELD_INTERVAL_MS (16ms)", () => {
      vi.spyOn(performance, "now").mockReturnValue(1000);
      controller.reset();

      vi.spyOn(performance, "now").mockReturnValue(1016);
      expect(controller.shouldYield()).toBe(true);
    });
  });

  describe("yieldIfNeeded", () => {
    it("does not yield when time has not elapsed", async () => {
      vi.spyOn(performance, "now").mockReturnValue(1000);
      controller.reset();

      vi.spyOn(performance, "now").mockReturnValue(1005);
      const result = await controller.yieldIfNeeded();

      expect(result).toBe(false);
    });

    it("yields when time has elapsed", async () => {
      vi.spyOn(performance, "now")
        .mockReturnValueOnce(1000) // reset
        .mockReturnValueOnce(1020) // shouldYield check
        .mockReturnValueOnce(1020); // after yield

      controller.reset();

      const promise = controller.yieldIfNeeded();
      vi.runAllTimers();
      const result = await promise;

      expect(result).toBe(true);
    });

    it("updates lastYieldTime after yielding", async () => {
      vi.spyOn(performance, "now")
        .mockReturnValueOnce(1000) // reset
        .mockReturnValueOnce(1020) // shouldYield check
        .mockReturnValueOnce(1025); // after yield update

      controller.reset();

      const promise = controller.yieldIfNeeded();
      vi.runAllTimers();
      await promise;

      // Next check should be relative to the new time
      vi.spyOn(performance, "now").mockReturnValue(1030);
      expect(controller.shouldYield()).toBe(false);
    });

    it("does not yield twice in quick succession", async () => {
      vi.spyOn(performance, "now")
        .mockReturnValueOnce(1000) // reset
        .mockReturnValueOnce(1020) // first shouldYield
        .mockReturnValueOnce(1025) // after first yield
        .mockReturnValueOnce(1030); // second shouldYield (only 5ms later)

      controller.reset();

      const promise1 = controller.yieldIfNeeded();
      vi.runAllTimers();
      const result1 = await promise1;
      expect(result1).toBe(true);

      const result2 = await controller.yieldIfNeeded();
      expect(result2).toBe(false);
    });
  });

  describe("integration", () => {
    it("tracks elapsed time correctly across multiple calls", () => {
      vi.spyOn(performance, "now")
        .mockReturnValueOnce(1000) // reset
        .mockReturnValueOnce(1015) // first check (15ms elapsed, should not yield)
        .mockReturnValueOnce(1020); // second check (20ms elapsed from reset, should yield)

      controller.reset();

      // First check at 1015 (15ms elapsed, should not yield)
      expect(controller.shouldYield()).toBe(false);

      // Second check at 1020 (20ms elapsed from reset, should yield)
      expect(controller.shouldYield()).toBe(true);
    });
  });
});
