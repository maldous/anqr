import type { EthereumEIP681Params } from '../../modules/payload-generators/types';
import { appendGasParams } from './append-gas-params';

export function buildPlainEthURI(params: EthereumEIP681Params): string {
  let uri = `ethereum:${params.targetAddress}`;

  if (params.chainId && params.chainId !== 1) {
    uri += `@${params.chainId}`;
  }

  if (params.functionName) {
    uri += `/${params.functionName}`;
  }

  const queryParams = new URLSearchParams();
  if (params.value) queryParams.set('value', params.value);
  appendGasParams(queryParams, params);

  if (params.functionParams) {
    for (const [key, value] of Object.entries(params.functionParams)) {
      queryParams.set(key, value);
    }
  }

  const paramStr = queryParams.toString();
  if (paramStr) {
    uri += `?${paramStr}`;
  }
  return uri;
}
