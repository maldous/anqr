import type { EthereumEIP681Params } from "../../modules/payload-generators/types";

/**
 * Generate Ethereum transaction request URI (EIP-681)
 */
export function appendGasParams(queryParams: URLSearchParams, params: EthereumEIP681Params): void {
  if (params.gas) queryParams.set("gas", params.gas.toString());
  if (params.gasLimit) queryParams.set("gasLimit", params.gasLimit.toString());
  if (params.gasPrice) queryParams.set("gasPrice", params.gasPrice);
}
