import { describe, it, expect, vi } from "vitest";
import { closeBitmapSource } from "./close-bitmap-source";
import { JSDOM } from "jsdom";

describe("closeBitmapSource", () => {
  it("calls close method on ImageBitmap", () => {
    const mockBitmap = {
      close: vi.fn(),
      width: 100,
      height: 100,
    } as unknown as ImageBitmap;

    closeBitmapSource(mockBitmap);

    expect(mockBitmap.close).toHaveBeenCalled();
  });

  it("does not throw when close method does not exist", () => {
    const mockImage = {
      width: 100,
      height: 100,
    } as unknown as HTMLImageElement;

    expect(() => closeBitmapSource(mockImage)).not.toThrow();
  });

  it("does not throw when source has close but it's not a function", () => {
    const mockSource = {
      close: "not a function",
    } as unknown as ImageBitmap;

    expect(() => closeBitmapSource(mockSource)).not.toThrow();
  });

  it("handles HTMLImageElement without close method", () => {
    const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>");
    const img = dom.window.document.createElement("img");

    expect(() => closeBitmapSource(img as unknown as HTMLImageElement)).not.toThrow();
  });
});
