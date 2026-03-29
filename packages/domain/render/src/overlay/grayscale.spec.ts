import { describe, it, expect, beforeAll } from "vitest";
import { grayscale } from "./grayscale";

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

describe("grayscale", () => {
  it("should convert color to grayscale", () => {
    const imageData = new ImageData(new Uint8ClampedArray([255, 0, 0, 255]), 1, 1);
    grayscale(imageData);

    expect(imageData.data[0]).toBe(imageData.data[1]);
    expect(imageData.data[1]).toBe(imageData.data[2]);
    expect(imageData.data[3]).toBe(255); // Alpha unchanged
  });

  it("should not change already grayscale pixels", () => {
    const imageData = new ImageData(new Uint8ClampedArray([128, 128, 128, 255]), 1, 1);
    grayscale(imageData);

    expect(imageData.data[0]).toBe(128);
    expect(imageData.data[1]).toBe(128);
    expect(imageData.data[2]).toBe(128);
  });

  it("should handle black", () => {
    const imageData = new ImageData(new Uint8ClampedArray([0, 0, 0, 255]), 1, 1);
    grayscale(imageData);

    expect(imageData.data[0]).toBe(0);
    expect(imageData.data[1]).toBe(0);
    expect(imageData.data[2]).toBe(0);
  });

  it("should handle white", () => {
    const imageData = new ImageData(new Uint8ClampedArray([255, 255, 255, 255]), 1, 1);
    grayscale(imageData);

    expect(imageData.data[0]).toBe(255);
    expect(imageData.data[1]).toBe(255);
    expect(imageData.data[2]).toBe(255);
  });

  it("should handle multiple pixels", () => {
    const imageData = new ImageData(
      new Uint8ClampedArray([255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255]),
      3,
      1,
    );
    grayscale(imageData);

    // Each pixel should have equal RGB values
    expect(imageData.data[0]).toBe(imageData.data[1]);
    expect(imageData.data[1]).toBe(imageData.data[2]);
    expect(imageData.data[4]).toBe(imageData.data[5]);
    expect(imageData.data[5]).toBe(imageData.data[6]);
    expect(imageData.data[8]).toBe(imageData.data[9]);
    expect(imageData.data[9]).toBe(imageData.data[10]);
  });
});
