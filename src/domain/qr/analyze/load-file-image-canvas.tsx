export async function loadFileImageCanvas(
  file: File
): Promise<
  { canvas: HTMLCanvasElement; error: null } | { canvas: null; error: 'context' | 'load' | 'read' }
> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve({ canvas: null, error: 'context' });
          return;
        }

        ctx.drawImage(img, 0, 0);
        resolve({ canvas, error: null });
      };
      img.onerror = () => resolve({ canvas: null, error: 'load' });
      img.src = event.target?.result as string;
    };

    reader.onerror = () => resolve({ canvas: null, error: 'read' });
    reader.readAsDataURL(file);
  });
}
