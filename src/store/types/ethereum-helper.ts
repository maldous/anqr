export interface EthereumHelper {
  targetAddress: string;
  chainId?: number;
  value?: string;
  gas?: number;
  gasLimit?: number;
  gasPrice?: string;
  tokenAddress?: string;
  tokenValue?: string;
  functionName?: string;
}
