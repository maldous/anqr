/**
 * QR Generator Filters Module
 * Re-exports filters from overlay module (canonical source) and provides QR-specific preprocessing
 */

// Re-export filter functions from overlay module (canonical source)
// qr-generator delegates all generic image filtering to overlay module
export {
  blur as applyBoxBlur,
  cannyEdge as applyCannyEdge,
  sharpen as applySharpen,
  sobelEdge as applySobelEdge,
} from '../overlay';

// QR-specific preprocessing (kept in qr-generator)
export {
  preprocessImageData,
  preprocessImageData as applyFiltersManual,
} from './filters-preprocess';
