import { Move } from 'lucide-react';
import type { CropOverlayStyle } from './crop-overlay-style.type';

export function CropOverlayIndicator({
  cropOverlayStyle,
}: Readonly<{ cropOverlayStyle: CropOverlayStyle }>) {
  return (
    <>
      <div className="absolute inset-0 bg-black/50 pointer-events-none" />
      <div
        className="absolute border-2 border-white shadow-lg pointer-events-none"
        style={{
          left: cropOverlayStyle.left,
          top: cropOverlayStyle.top,
          width: cropOverlayStyle.width,
          height: cropOverlayStyle.height,
          boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
        }}
      >
        <div className="absolute -top-1 -left-1 w-3 h-3 bg-white border border-gray-400 rounded-sm" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-white border border-gray-400 rounded-sm" />
        <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white border border-gray-400 rounded-sm" />
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white border border-gray-400 rounded-sm" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Move className="h-6 w-6 text-white/70" />
        </div>
      </div>
    </>
  );
}
