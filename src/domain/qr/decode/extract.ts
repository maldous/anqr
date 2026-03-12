export { calculateLocation } from './calculate-location';
export { extractModuleMatrix } from './extract-module-matrix';

// Re-export from canonical source
export {
  getModuleCountForVersion as getModuleCountFromVersion,
  getVersionFromModuleCount,
} from '../../../modules/qr-spec/index';
