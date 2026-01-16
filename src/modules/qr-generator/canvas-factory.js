/**
 * Canvas Factory Module
 * Provides environment-agnostic canvas creation
 */

/**
 * Canvas factory interface for environment-agnostic canvas creation.
 * Allows QRGenerator to work in both browser and Node.js (Netlify functions).
 *
 * @typedef {Object} CanvasFactory
 * @property {function(number, number): Promise<HTMLCanvasElement|object>} createCanvas - Creates a canvas with given width/height
 * @property {function(string): Promise<HTMLImageElement|object>} [loadImage] - Optional: loads an image from URL/buffer
 */

/**
 * Default browser canvas factory - uses DOM APIs
 * Exported for reference/extension by custom factories
 */
export const defaultBrowserCanvasFactory = {
  createCanvas: (width, height) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return Promise.resolve(canvas);
  },
  loadImage: (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = (_e) => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });
  },
};
