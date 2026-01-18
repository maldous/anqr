/**
 * CropHandler - Manages a draggable/resizable square crop overlay
 * for selecting regions from non-square images
 */

export class CropHandler {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.image = null;
    this.cropRegion = { x: 0, y: 0, size: 1 };
    this.isDragging = false;
    this.isResizing = false;
    this.dragStart = { x: 0, y: 0 };
    this.minSize = options.minSize || 50;
    this.handleSize = options.handleSize || 10;
    this.onUpdate = options.onUpdate || (() => {});

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.canvas.addEventListener('mouseleave', this.handleMouseUp.bind(this));

    // Touch events
    this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
    this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
    this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
  }

  setImage(image) {
    this.image = image;
    this.resetCrop();
    this.draw();
  }

  resetCrop() {
    // Center crop region
    const minDim = Math.min(this.canvas.width, this.canvas.height);
    const size = minDim * 0.8;
    this.cropRegion = {
      x: (this.canvas.width - size) / 2,
      y: (this.canvas.height - size) / 2,
      size: size,
    };
  }

  getCropRegion() {
    return {
      x: this.cropRegion.x / this.canvas.width,
      y: this.cropRegion.y / this.canvas.height,
      size: this.cropRegion.size / Math.min(this.canvas.width, this.canvas.height),
    };
  }

  setCropRegion(region) {
    this.cropRegion = {
      x: region.x * this.canvas.width,
      y: region.y * this.canvas.height,
      size: region.size * Math.min(this.canvas.width, this.canvas.height),
    };
    this.draw();
  }

  draw() {
    if (!this.ctx) return;

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw image if available
    if (this.image) {
      this.ctx.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);
    }

    // Draw overlay
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Clear crop region
    const { x, y, size } = this.cropRegion;
    this.ctx.clearRect(x, y, size, size);

    // Draw image in crop region
    if (this.image) {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.rect(x, y, size, size);
      this.ctx.clip();
      this.ctx.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height);
      this.ctx.restore();
    }

    // Draw crop border
    this.ctx.strokeStyle = '#fff';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x, y, size, size);

    // Draw resize handles
    this.drawHandle(x + size, y + size);
  }

  drawHandle(cx, cy) {
    const hs = this.handleSize;
    this.ctx.fillStyle = '#fff';
    this.ctx.fillRect(cx - hs / 2, cy - hs / 2, hs, hs);
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(cx - hs / 2, cy - hs / 2, hs, hs);
  }

  isInHandle(x, y) {
    const { x: cx, y: cy, size } = this.cropRegion;
    const handleX = cx + size;
    const handleY = cy + size;
    const hs = this.handleSize;
    return (
      x >= handleX - hs &&
      x <= handleX + hs &&
      y >= handleY - hs &&
      y <= handleY + hs
    );
  }

  isInCropRegion(x, y) {
    const { x: cx, y: cy, size } = this.cropRegion;
    return x >= cx && x <= cx + size && y >= cy && y <= cy + size;
  }

  handleMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (this.isInHandle(x, y)) {
      this.isResizing = true;
    } else if (this.isInCropRegion(x, y)) {
      this.isDragging = true;
    }

    this.dragStart = { x, y };
  }

  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Update cursor
    if (this.isInHandle(x, y)) {
      this.canvas.style.cursor = 'nwse-resize';
    } else if (this.isInCropRegion(x, y)) {
      this.canvas.style.cursor = 'move';
    } else {
      this.canvas.style.cursor = 'default';
    }

    if (this.isDragging) {
      const dx = x - this.dragStart.x;
      const dy = y - this.dragStart.y;

      this.cropRegion.x = Math.max(
        0,
        Math.min(this.canvas.width - this.cropRegion.size, this.cropRegion.x + dx)
      );
      this.cropRegion.y = Math.max(
        0,
        Math.min(this.canvas.height - this.cropRegion.size, this.cropRegion.y + dy)
      );

      this.dragStart = { x, y };
      this.draw();
      this.onUpdate(this.getCropRegion());
    }

    if (this.isResizing) {
      const dx = x - this.dragStart.x;
      const dy = y - this.dragStart.y;
      const delta = Math.max(dx, dy);

      const newSize = Math.max(
        this.minSize,
        Math.min(
          Math.min(
            this.canvas.width - this.cropRegion.x,
            this.canvas.height - this.cropRegion.y
          ),
          this.cropRegion.size + delta
        )
      );

      this.cropRegion.size = newSize;
      this.dragStart = { x, y };
      this.draw();
      this.onUpdate(this.getCropRegion());
    }
  }

  handleMouseUp() {
    this.isDragging = false;
    this.isResizing = false;
  }

  handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    this.handleMouseDown({ clientX: touch.clientX, clientY: touch.clientY });
  }

  handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    this.handleMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
  }

  handleTouchEnd() {
    this.handleMouseUp();
  }

  destroy() {
    this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('mouseup', this.handleMouseUp);
    this.canvas.removeEventListener('mouseleave', this.handleMouseUp);
    this.canvas.removeEventListener('touchstart', this.handleTouchStart);
    this.canvas.removeEventListener('touchmove', this.handleTouchMove);
    this.canvas.removeEventListener('touchend', this.handleTouchEnd);
  }
}
