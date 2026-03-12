import type { EthereumEIP681Params } from '../../modules/payload-generators/types';
import { buildTokenTransferURI, buildPlainEthURI } from './payments._internal';

export function generateEthereumEIP681(params: EthereumEIP681Params): string {
  return params.tokenAddress ? buildTokenTransferURI(params) : buildPlainEthURI(params);
}
