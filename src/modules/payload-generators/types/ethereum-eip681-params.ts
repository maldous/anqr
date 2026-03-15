export interface EthereumEIP681Params {
  targetAddress: string;
  chainId?: number;
  functionName?: string;
  value?: string;
  gas?: number;
  gasLimit?: number;
  gasPrice?: string;
  tokenAddress?: string;
  tokenValue?: string;
  functionParams?: Record<string, string>;
}
