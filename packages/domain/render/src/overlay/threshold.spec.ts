import { describe, it, expect, beforeAll } from "vitest";
import { threshold } from "./threshold";

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

describe("threshold", () => {
  it("should threshold above level to white", () => {
    const imageData = new ImageData(new Uint8ClampedArray([200, 200, 200, 255]), 1, 1);
    threshold(imageData, 128);
    
    expect(imageData.data[0]).toBe(255);
    expect(imageData.data[1]).toBe(255);
    expect(imageData.data[2]).toBe(255);
    expect(imageData.data[3]).toBe(255); // Alpha unchanged
  });

  it("should threshold below level to black", () => {
    const imageData = new ImageData(new Uint8ClampedArray([50, 50, 50, 255]), 1, 1);
    threshold(imageData, 128);
    
    expect(imageData.data[0]).toBe(0);
    expect(imageData.data[1]).toBe(0);
    expect(imageData.data[2]).toBe(0);
  });

  it("should handle mixed pixels", () => {
    const imageData = new ImageData(new Uint8ClampedArray([
      200, 200, 200, 255,
      50, 50, 50, 255,
    ]), 2, 1);
    threshold(imageData, 128);
    
    expect(imageData.data[0]).toBe(255);
    expect(imageData.data[4]).toBe(0);
  });

  it("should handle threshold at 0", () => {
    const imageData = new ImageData(new Uint8ClampedArray([1, 1, 1, 255]), 1, 1);
    threshold(imageData, 0);
    
    expect(imageData.data[0]).toBe(255);
  });

  it("should handle threshold at 255", () => {
    const imageData = new ImageData(new Uint8ClampedArray([254, 254, 254, 255]), 1, 1);
    threshold(imageData, 255);
    
    expect(imageData.data[0]).toBe(0);
  });
});
