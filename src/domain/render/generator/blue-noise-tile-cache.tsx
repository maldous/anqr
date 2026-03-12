import { generateBlueNoiseTile } from '../dither';

export const blueNoiseTileCache = new Map<string, ReturnType<typeof generateBlueNoiseTile>>();
