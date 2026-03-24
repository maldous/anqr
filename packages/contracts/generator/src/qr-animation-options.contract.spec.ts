import { describe, it, expect } from "vitest";
import type { QRAnimationOptions } from "./qr-animation-options.contract";

describe("qr-animation-options.contract", () => {
  describe("QRAnimationOptions interface", () => {
    it("should accept valid animation options", () => {
      const options: QRAnimationOptions = {
        speedMs: 100,
        loop: true,
        bounce: false,
        startFrame: 0,
        maxFrames: 30,
        frameStep: 1,
        interpolate: "none",
        temporalDither: "off",
        seed: 12345,
        pattern: "pulse",
        target: "modules",
        waveAxis: "x",
        pattern2: "none",
        target2: "result",
        waveAxis2: "y",
        moduleJitterPx: 0,
        colorCycle: false,
      };
      expect(options.speedMs).toBe(100);
      expect(options.loop).toBe(true);
      expect(options.maxFrames).toBe(30);
    });

    it("should support all interpolation modes", () => {
      const modes: Array<QRAnimationOptions["interpolate"]> = ["none", "crossfade", "morph"];
      expect(modes).toHaveLength(3);
    });

    it("should support all temporal dither modes", () => {
      const modes: Array<QRAnimationOptions["temporalDither"]> = [
        "off",
        "blue_noise",
        "flicker_safe",
      ];
      expect(modes).toHaveLength(3);
    });

    it("should support dual animation patterns", () => {
      const options: QRAnimationOptions = {
        speedMs: 200,
        loop: true,
        bounce: true,
        startFrame: 0,
        maxFrames: 60,
        frameStep: 1,
        interpolate: "crossfade",
        temporalDither: "blue_noise",
        seed: 54321,
        pattern: "wave",
        target: "both",
        waveAxis: "xy",
        pattern2: "shimmer",
        target2: "modules",
        waveAxis2: "x",
        moduleJitterPx: 2,
        colorCycle: true,
      };
      expect(options.pattern).toBe("wave");
      expect(options.pattern2).toBe("shimmer");
      expect(options.target).toBe("both");
      expect(options.target2).toBe("modules");
    });
  });
});
