/**
 * CropHandler - Manages a draggable/resizable square crop overlay
 * for selecting regions from non-square images
 */

export interface CropRegion {
  x: number;
  y: number;
  size: number;
}

export interface CropHandlerOptions {
  container: HTMLElement;
  image: HTMLImageElement | HTMLCanvasElement;
  initialRegion?: CropRegion;
  minSize?: number;
  onChange?: (region: CropRegion) => void;
}

export class CropHandler {
  private container: HTMLElement;
  private image: HTMLImageElement | HTMLCanvasElement;
  private region: CropRegion;
  private minSize: number;
  private onChange?: (region: CropRegion) => void;
  private overlay: HTMLDivElement | null = null;
  private isDragging = false;
  private isResizing = false;
  private dragStart = { x: 0, y: 0 };
  private regionStart: CropRegion = { x: 0, y: 0, size: 100 };

  constructor(options: CropHandlerOptions) {
    this.container = options.container;
    this.image = options.image;
    this.minSize = options.minSize ?? 50;
    this.onChange = options.onChange;
    
    // Initialize region to center of image
    const imgWidth = this.image.width || (this.image as HTMLImageElement).naturalWidth || 100;
    const imgHeight = this.image.height || (this.image as HTMLImageElement).naturalHeight || 100;
    const defaultSize = Math.min(imgWidth, imgHeight) * 0.8;
    
    this.region = options.initialRegion ?? {
      x: (imgWidth - defaultSize) / 2,
      y: (imgHeight - defaultSize) / 2,
      size: defaultSize,
    };
    
    this.createOverlay();
    this.bindEvents();
  }

  private createOverlay(): void {
    this.overlay = document.createElement('div');
    this.overlay.className = 'crop-overlay';
    this.overlay.style.cssText = `
      position: absolute;
      border: 2px dashed #fff;
      box-shadow: 0 0 0 9999px rgba(0,0,0,0.5);
      cursor: move;
      box-sizing: border-box;
    `;
    
    // Add resize handle
    const handle = document.createElement('div');
    handle.className = 'crop-resize-handle';
    handle.style.cssText = `
      position: absolute;
      right: -6px;
      bottom: -6px;
      width: 12px;
      height: 12px;
      background: #fff;
      border: 1px solid #333;
      cursor: se-resize;
      border-radius: 2px;
    `;
    this.overlay.appendChild(handle);
    
    this.container.style.position = 'relative';
    this.container.appendChild(this.overlay);
    
    this.updateOverlayPosition();
  }

  private updateOverlayPosition(): void {
    if (!this.overlay) return;
    
    // Get container dimensions for scaling
    const containerRect = this.container.getBoundingClientRect();
    const imgWidth = this.image.width || (this.image as HTMLImageElement).naturalWidth || 100;
    const imgHeight = this.image.height || (this.image as HTMLImageElement).naturalHeight || 100;
    
    const scaleX = containerRect.width / imgWidth;
    const scaleY = containerRect.height / imgHeight;
    
    this.overlay.style.left = `${this.region.x * scaleX}px`;
    this.overlay.style.top = `${this.region.y * scaleY}px`;
    this.overlay.style.width = `${this.region.size * scaleX}px`;
    this.overlay.style.height = `${this.region.size * scaleY}px`;
  }

  private bindEvents(): void {
    if (!this.overlay) return;
    
    const handle = this.overlay.querySelector('.crop-resize-handle') as HTMLElement;
    
    // Drag events on overlay
    this.overlay.addEventListener('mousedown', (e) => {
      if (e.target === handle) return;
      this.isDragging = true;
      this.dragStart = { x: e.clientX, y: e.clientY };
      this.regionStart = { ...this.region };
      e.preventDefault();
    });
    
    // Resize events on handle
    handle.addEventListener('mousedown', (e) => {
      this.isResizing = true;
      this.dragStart = { x: e.clientX, y: e.clientY };
      this.regionStart = { ...this.region };
      e.preventDefault();
      e.stopPropagation();
    });
    
    // Global mouse events
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));
  }

  private handleMouseMove(e: MouseEvent): void {
    if (!this.isDragging && !this.isResizing) return;
    
    const containerRect = this.container.getBoundingClientRect();
    const imgWidth = this.image.width || (this.image as HTMLImageElement).naturalWidth || 100;
    const imgHeight = this.image.height || (this.image as HTMLImageElement).naturalHeight || 100;
    
    const scaleX = imgWidth / containerRect.width;
    const scaleY = imgHeight / containerRect.height;
    
    const dx = (e.clientX - this.dragStart.x) * scaleX;
    const dy = (e.clientY - this.dragStart.y) * scaleY;
    
    if (this.isDragging) {
      this.region.x = Math.max(0, Math.min(imgWidth - this.region.size, this.regionStart.x + dx));
      this.region.y = Math.max(0, Math.min(imgHeight - this.region.size, this.regionStart.y + dy));
    } else if (this.isResizing) {
      const delta = Math.max(dx, dy);
      const newSize = Math.max(this.minSize, this.regionStart.size + delta);
      const maxSize = Math.min(
        imgWidth - this.region.x,
        imgHeight - this.region.y
      );
      this.region.size = Math.min(newSize, maxSize);
    }
    
    this.updateOverlayPosition();
    this.onChange?.(this.region);
  }

  private handleMouseUp(): void {
    this.isDragging = false;
    this.isResizing = false;
  }

  public getRegion(): CropRegion {
    return { ...this.region };
  }

  public setRegion(region: CropRegion): void {
    this.region = { ...region };
    this.updateOverlayPosition();
  }

  public destroy(): void {
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay);
    }
    this.overlay = null;
  }
}
