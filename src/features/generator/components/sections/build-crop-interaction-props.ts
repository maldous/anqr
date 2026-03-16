import type React from "react";

export function buildCropInteractionProps(cropDrag: {
  beginDragAtPoint: (x: number, y: number) => void;
  finishDrag: () => void;
  handleCropDrag: (e: React.MouseEvent) => void;
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchMove: (e: React.TouchEvent) => void;
  handleTouchEnd: () => void;
}): Record<string, unknown> {
  return {
    tabIndex: 0,
    onMouseDown: (e: React.MouseEvent) => {
      e.preventDefault();
      cropDrag.beginDragAtPoint(e.clientX, e.clientY);
    },
    onMouseUp: cropDrag.finishDrag,
    onMouseLeave: cropDrag.finishDrag,
    onMouseMove: cropDrag.handleCropDrag,
    onTouchStart: cropDrag.handleTouchStart,
    onTouchMove: cropDrag.handleTouchMove,
    onTouchEnd: cropDrag.handleTouchEnd,
  };
}
