import { describe, it, expect, beforeAll } from "vitest";
import { brightness } from "./brightness";

// Mock ImageData for Node environment
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

describe("brightness", () => {
  it("should increase brightness with positive amount", () => {
    const imageData = new ImageData(new Uint8ClampedArray([100, 100, 100, 255]), 1, 1);
    const result = brightness(imageData, 50);
    
    expect(result.data[0]).toBeGreaterThan(100);
    expect(result.data[1]).toBeGreaterThan(100);
    expect(result.data[2]).toBeGreaterThan(100);
    expect(result.data[3]).toBe(255); // Alpha unchanged
  });

  it("should decrease brightness with negative amount", () => {
    const imageData = new ImageData(new Uint8ClampedArray([150, 150, 150, 255]), 1, 1);
    const result = brightness(imageData, -50);
    
    expect(result.data[0]).toBeLessThan(150);
    expect(result.data[1]).toBeLessThan(150);
    expect(result.data[2]).toBeLessThan(150);
    expect(result.data[3]).toBe(255); // Alpha unchanged
  });

  it("should not change brightness with amount 0", () => {
    const imageData = new ImageData(new Uint8ClampedArray([100, 150, 200, 255]), 1, 1);
    const original = [imageData.data[0], imageData.data[1], imageData.data[2]];
    brightness(imageData, 0);
    
    expect(imageData.data[0]).toBe(original[0]);
    expect(imageData.data[1]).toBe(original[1]);
    expect(imageData.data[2]).toBe(original[2]);
  });

  it("should clamp values to 0-255 range", () => {
    const imageData = new ImageData(new Uint8ClampedArray([250, 250, 250, 255]), 1, 1);
    brightness(imageData, 100);
    
    expect(imageData.data[0]).toBeLessThanOrEqual(255);
    expect(imageData.data[1]).toBeLessThanOrEqual(255);
    expect(imageData.data[2]).toBeLessThanOrEqual(255);
  });

  it("should handle multiple pixels", () => {
    const imageData = new ImageData(new Uint8ClampedArray([
      100, 100, 100, 255,
      150, 150, 150, 255,
    ]), 2, 1);
    brightness(imageData, 25);
    
    expect(imageData.data[0]).toBeGreaterThan(100);
    expect(imageData.data[4]).toBeGreaterThan(150);
  });
});
