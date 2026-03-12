/**
 * CropHandler - Manages a draggable/resizable square crop overlay
 * for selecting regions from non-square images
 */

import { createLogger } from '../../../infra/logging/logger';

const _log = createLogger('OVERLAY');

export type { CropRegion, CropHandlerOptions } from './crop-handler.types';
import type { CropRegion, CropHandlerOptions } from './crop-handler.types';

export class CropHandler {
  private readonly container: HTMLElement;
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private image: HTMLImageElement | null = null;
  private region: CropRegion;
  private readonly minSize: number;
  private readonly onCropChange?: (region: CropRegion) => void;
  private isDragging = false;
  private isResizing = false;
  private dragStart = { x: 0, y: 0 };
  private regionStart: CropRegion = { x: 0, y: 0, size: 100 };
  private scale = 1;
  private offsetX = 0;
  private offsetY = 0;

  constructor(options: CropHandlerOptions) {
    this.container = options.container;
    this.minSize = options.minSize ?? 50;
    this.onCropChange = options.onCropChange;
    this.region = options.initialRegion ?? { x: 0, y: 0, size: 100 };

    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.cursor = 'crosshair';
    this.container.appendChild(this.canvas);

    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D context');
    this.ctx = ctx;

    // Set up event listeners
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.canvas.addEventListener('mouseleave', this.handleMouseUp.bind(this));

    // Touch events
    this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), {
      passive: false,
    });
    this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), {
      passive: false,
    });
    this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this), {
      passive: true,
    });

    // Load image
    this.loadImage(options.imageUrl);
  }

  private loadImage(url: string): void {
    this.image = new Image();
    this.image.crossOrigin = 'anonymous';
    this.image.onload = () => {
      this.updateCanvasSize();
      this.draw();
    };
    this.image.src = url;
  }

  private updateCanvasSize(): void {
    const rect = this.container.getBoundingClientRect();
    this.canvas.width = rect.width * window.devicePixelRatio;
    this.canvas.height = rect.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    if (this.image) {
      // Calculate scale to fit image in container
      const containerAspect = rect.width / rect.height;
      const imageAspect = this.image.width / this.image.height;

      if (imageAspect > containerAspect) {
        this.scale = rect.width / this.image.width;
        this.offsetX = 0;
        this.offsetY = (rect.height - this.image.height * this.scale) / 2;
      } else {
        this.scale = rect.height / this.image.height;
        this.offsetX = (rect.width - this.image.width * this.scale) / 2;
        this.offsetY = 0;
      }
    }
  }

  private draw(): void {
    const rect = this.container.getBoundingClientRect();
    this.ctx.clearRect(0, 0, rect.width, rect.height);

    if (!this.image) return;

    // Draw image
    this.ctx.drawImage(
      this.image,
      this.offsetX,
      this.offsetY,
      this.image.width * this.scale,
      this.image.height * this.scale
    );

    // Draw semi-transparent overlay
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, rect.width, rect.height);

    // Cut out crop region (show original image)
    const cropX = this.offsetX + this.region.x * this.scale;
    const cropY = this.offsetY + this.region.y * this.scale;
    const cropSize = this.region.size * this.scale;

    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.rect(cropX, cropY, cropSize, cropSize);
    this.ctx.clip();
    this.ctx.drawImage(
      this.image,
      this.offsetX,
      this.offsetY,
      this.image.width * this.scale,
      this.image.height * this.scale
    );
    this.ctx.restore();

    // Draw crop border
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(cropX, cropY, cropSize, cropSize);

    // Draw resize handle
    const handleSize = 10;
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(
      cropX + cropSize - handleSize,
      cropY + cropSize - handleSize,
      handleSize,
      handleSize
    );
  }

  private getEventPosition(e: MouseEvent | Touch): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }

  private isInCropRegion(pos: { x: number; y: number }): boolean {
    const cropX = this.offsetX + this.region.x * this.scale;
    const cropY = this.offsetY + this.region.y * this.scale;
    const cropSize = this.region.size * this.scale;

    return (
      pos.x >= cropX && pos.x <= cropX + cropSize && pos.y >= cropY && pos.y <= cropY + cropSize
    );
  }

  private isInResizeHandle(pos: { x: number; y: number }): boolean {
    const cropX = this.offsetX + this.region.x * this.scale;
    const cropY = this.offsetY + this.region.y * this.scale;
    const cropSize = this.region.size * this.scale;
    const handleSize = 20;

    return (
      pos.x >= cropX + cropSize - handleSize &&
      pos.x <= cropX + cropSize &&
      pos.y >= cropY + cropSize - handleSize &&
      pos.y <= cropY + cropSize
    );
  }

  private handleMouseDown(e: MouseEvent): void {
    const pos = this.getEventPosition(e);

    if (this.isInResizeHandle(pos)) {
      this.isResizing = true;
    } else if (this.isInCropRegion(pos)) {
      this.isDragging = true;
    }

    this.dragStart = pos;
    this.regionStart = { ...this.region };
  }

  private handleMouseMove(e: MouseEvent): void {
    const pos = this.getEventPosition(e);

    // Update cursor
    if (this.isInResizeHandle(pos)) {
      this.canvas.style.cursor = 'nwse-resize';
    } else if (this.isInCropRegion(pos)) {
      this.canvas.style.cursor = 'move';
    } else {
      this.canvas.style.cursor = 'crosshair';
    }

    if (!(this.isDragging || this.isResizing)) return;
    if (!this.image) return;

    const dx = (pos.x - this.dragStart.x) / this.scale;
    const dy = (pos.y - this.dragStart.y) / this.scale;

    if (this.isResizing) {
      // Resize the crop region (maintain square)
      const delta = Math.max(dx, dy);
      const newSize = Math.max(this.minSize, this.regionStart.size + delta);
      const maxSize = Math.min(this.image.width - this.region.x, this.image.height - this.region.y);
      this.region.size = Math.min(newSize, maxSize);
    } else if (this.isDragging) {
      // Move the crop region
      this.region.x = Math.max(
        0,
        Math.min(this.image.width - this.region.size, this.regionStart.x + dx)
      );
      this.region.y = Math.max(
        0,
        Math.min(this.image.height - this.region.size, this.regionStart.y + dy)
      );
    }

    this.draw();
    this.onCropChange?.(this.region);
  }

  private handleMouseUp(): void {
    this.isDragging = false;
    this.isResizing = false;
  }

  private handleTouchStart(e: TouchEvent): void {
    if (e.touches.length === 1) {
      if (typeof (e as Event).preventDefault === 'function') {
        (e as Event).preventDefault();
      }
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY,
      });
      this.handleMouseDown(mouseEvent);
    }
  }

  private handleTouchMove(e: TouchEvent): void {
    if (e.touches.length === 1) {
      if (typeof (e as Event).preventDefault === 'function') {
        (e as Event).preventDefault();
      }
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY,
      });
      this.handleMouseMove(mouseEvent);
    }
  }

  private handleTouchEnd(): void {
    this.handleMouseUp();
  }

  public getRegion(): CropRegion {
    return { ...this.region };
  }

  public setRegion(region: CropRegion): void {
    this.region = { ...region };
    this.draw();
  }

  public destroy(): void {
    this.canvas.remove();
  }
}
