import { describe, it, expect } from "vitest";
import type { GeometryDiagnostics } from "./geometry-diagnostics.contract";

describe("contracts/analyze/geometry-diagnostics", () => {
  describe("GeometryDiagnostics", () => {
    it("accepts valid geometry diagnostics with all fields", () => {
      const diagnostics: GeometryDiagnostics = {
        corners: {
          topLeft: { x: 10, y: 10 },
          topRight: { x: 100, y: 10 },
          bottomLeft: { x: 10, y: 100 },
          bottomRight: { x: 100, y: 100 },
        },
        boundingBox: {
          minX: 10,
          minY: 10,
          maxX: 100,
          maxY: 100,
          width: 90,
          height: 90,
        },
        topEdgePx: 90,
        leftEdgePx: 90,
        estimatedRotationDeg: 0,
      };
      expect(diagnostics.corners.topLeft.x).toBe(10);
      expect(diagnostics.boundingBox.width).toBe(90);
    });

    it("accepts negative rotation values", () => {
      const diagnostics: GeometryDiagnostics = {
        corners: {
          topLeft: { x: 0, y: 0 },
          topRight: { x: 1, y: 0 },
          bottomLeft: { x: 0, y: 1 },
          bottomRight: { x: 1, y: 1 },
        },
        boundingBox: {
          minX: 0,
          minY: 0,
          maxX: 1,
          maxY: 1,
          width: 1,
          height: 1,
        },
        topEdgePx: 1,
        leftEdgePx: 1,
        estimatedRotationDeg: -45,
      };
      expect(diagnostics.estimatedRotationDeg).toBe(-45);
    });

    it("accepts fractional pixel values", () => {
      const diagnostics: GeometryDiagnostics = {
        corners: {
          topLeft: { x: 10.5, y: 10.5 },
          topRight: { x: 100.3, y: 10.7 },
          bottomLeft: { x: 10.2, y: 100.8 },
          bottomRight: { x: 100.1, y: 100.9 },
        },
        boundingBox: {
          minX: 10.2,
          minY: 10.5,
          maxX: 100.3,
          maxY: 100.9,
          width: 90.1,
          height: 90.4,
        },
        topEdgePx: 89.8,
        leftEdgePx: 90.3,
        estimatedRotationDeg: 2.5,
      };
      expect(diagnostics.corners.topLeft.x).toBe(10.5);
      expect(diagnostics.boundingBox.width).toBeCloseTo(90.1);
    });

    it("accepts zero rotation", () => {
      const diagnostics: GeometryDiagnostics = {
        corners: {
          topLeft: { x: 0, y: 0 },
          topRight: { x: 50, y: 0 },
          bottomLeft: { x: 0, y: 50 },
          bottomRight: { x: 50, y: 50 },
        },
        boundingBox: {
          minX: 0,
          minY: 0,
          maxX: 50,
          maxY: 50,
          width: 50,
          height: 50,
        },
        topEdgePx: 50,
        leftEdgePx: 50,
        estimatedRotationDeg: 0,
      };
      expect(diagnostics.estimatedRotationDeg).toBe(0);
    });

    it("accepts 360 degree rotation (full circle)", () => {
      const diagnostics: GeometryDiagnostics = {
        corners: {
          topLeft: { x: 0, y: 0 },
          topRight: { x: 1, y: 0 },
          bottomLeft: { x: 0, y: 1 },
          bottomRight: { x: 1, y: 1 },
        },
        boundingBox: {
          minX: 0,
          minY: 0,
          maxX: 1,
          maxY: 1,
          width: 1,
          height: 1,
        },
        topEdgePx: 1,
        leftEdgePx: 1,
        estimatedRotationDeg: 360,
      };
      expect(diagnostics.estimatedRotationDeg).toBe(360);
    });
  });
});
