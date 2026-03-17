import type { EthereumEIP681Params } from "@/modules/payload-generators/types";
import { buildPlainEthURI } from "./build-plain-eth-uri";
import { buildTokenTransferURI } from "./build-token-transfer-uri";

export function generateEthereumEIP681(params: EthereumEIP681Params): string {
  return params.tokenAddress ? buildTokenTransferURI(params) : buildPlainEthURI(params);
}
