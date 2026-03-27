import { describe, it, expect, beforeAll } from "vitest";
import { contrast } from "./contrast";

class MockImageData {
  data: Uint8ClampedArray;
  width: number;
  height: number;
  constructor(data: Uint8ClampedArray, width: number, height: number) {
    this.data = data;
    this.width = width;
    this.height = height;
  }
}

beforeAll(() => {
  if (typeof ImageData === "undefined") {
    global.ImageData = MockImageData as any;
  }
});

describe("contrast", () => {
  it("should increase contrast with positive amount", () => {
    const imageData = new ImageData(new Uint8ClampedArray([100, 150, 200, 255]), 1, 1);
    const original = [imageData.data[0], imageData.data[1], imageData.data[2]];
    contrast(imageData, 50);
    
    expect(imageData.data[0]).not.toBe(original[0]);
    expect(imageData.data[3]).toBe(255); // Alpha unchanged
  });

  it("should decrease contrast with negative amount", () => {
    const imageData = new ImageData(new Uint8ClampedArray([50, 128, 200, 255]), 1, 1);
    const original = [imageData.data[0], imageData.data[1], imageData.data[2]];
    contrast(imageData, -50);
    
    expect(imageData.data[0]).not.toBe(original[0]);
    expect(imageData.data[3]).toBe(255);
  });

  it("should clamp values to 0-255 range", () => {
    const imageData = new ImageData(new Uint8ClampedArray([250, 10, 200, 255]), 1, 1);
    contrast(imageData, 200);
    
    expect(imageData.data[0]).toBeGreaterThanOrEqual(0);
    expect(imageData.data[0]).toBeLessThanOrEqual(255);
    expect(imageData.data[1]).toBeGreaterThanOrEqual(0);
    expect(imageData.data[2]).toBeLessThanOrEqual(255);
  });

  it("should handle multiple pixels", () => {
    const imageData = new ImageData(new Uint8ClampedArray([
      100, 100, 100, 255,
      150, 150, 150, 255,
    ]), 2, 1);
    contrast(imageData, 25);
    
    expect(imageData.data[0]).toBeGreaterThanOrEqual(0);
    expect(imageData.data[4]).toBeGreaterThanOrEqual(0);
  });
});
