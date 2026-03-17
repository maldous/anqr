import { generateEthereumEIP681 } from "../../../../../packages/domain/payload/src/payload-generators";
import type { PayloadData } from "./payload-data";

export function serializeEthereumEIP681(payload: PayloadData): string {
  const eth = payload.ethereum;
  if (!eth.targetAddress) return "";
  return generateEthereumEIP681({
    targetAddress: eth.targetAddress,
    chainId: eth.chainId,
    value: eth.value,
    gas: eth.gas,
    gasLimit: eth.gasLimit,
    gasPrice: eth.gasPrice,
    tokenAddress: eth.tokenAddress,
    tokenValue: eth.tokenValue,
    functionName: eth.functionName,
  });
}
