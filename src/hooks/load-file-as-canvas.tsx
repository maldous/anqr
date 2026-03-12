/**
 * Load a File as a canvas element
 */
export async function loadFileAsCanvas(file: File): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
        }
        resolve(canvas);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      const dataUrl = e.target?.result;
      if (typeof dataUrl === 'string') {
        img.src = dataUrl;
      } else {
        reject(new Error('Invalid file data'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
