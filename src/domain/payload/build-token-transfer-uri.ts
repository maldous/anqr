import type { EthereumEIP681Params } from "../../modules/payload-generators/types";
import { appendGasParams } from "./append-gas-params";

export function buildTokenTransferURI(params: EthereumEIP681Params): string {
  let uri = `ethereum:${params.tokenAddress}`;
  if (params.chainId && params.chainId !== 1) {
    uri += `@${params.chainId}`;
  }
  uri += "/transfer";

  const queryParams = new URLSearchParams();
  queryParams.set("address", params.targetAddress);
  if (params.tokenValue) {
    queryParams.set("uint256", params.tokenValue);
  }
  appendGasParams(queryParams, params);

  uri += `?${queryParams.toString()}`;
  return uri;
}
