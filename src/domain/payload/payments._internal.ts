import type { EMVMPMParams, EthereumEIP681Params } from '../../modules/payload-generators/types';

/**
 * Generate Ethereum transaction request URI (EIP-681)
 */
function appendGasParams(queryParams: URLSearchParams, params: EthereumEIP681Params): void {
  if (params.gas) queryParams.set('gas', params.gas.toString());
  if (params.gasLimit) queryParams.set('gasLimit', params.gasLimit.toString());
  if (params.gasPrice) queryParams.set('gasPrice', params.gasPrice);
}

export function buildTokenTransferURI(params: EthereumEIP681Params): string {
  let uri = `ethereum:${params.tokenAddress}`;
  if (params.chainId && params.chainId !== 1) {
    uri += `@${params.chainId}`;
  }
  uri += '/transfer';

  const queryParams = new URLSearchParams();
  queryParams.set('address', params.targetAddress);
  if (params.tokenValue) {
    queryParams.set('uint256', params.tokenValue);
  }
  appendGasParams(queryParams, params);

  uri += `?${queryParams.toString()}`;
  return uri;
}

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

export function resolveTipValue(params: EMVMPMParams): number | undefined {
  if (params.tipIndicator === '02') return params.tipFixed;
  if (params.tipIndicator === '03') return params.tipPercentage;
  return undefined;
}

export function buildEMVAdditionalData(params: EMVMPMParams): Record<string, string> {
  const data: Record<string, string> = {};
  if (params.billNumber) data.billNumber = params.billNumber;
  if (params.mobileNumber) data.mobileNumber = params.mobileNumber;
  if (params.storeLabel) data.storeLabel = params.storeLabel;
  if (params.loyaltyNumber) data.loyaltyNumber = params.loyaltyNumber;
  if (params.referenceLabel) data.referenceLabel = params.referenceLabel;
  if (params.customerLabel) data.customerLabel = params.customerLabel;
  if (params.terminalLabel) data.terminalLabel = params.terminalLabel;
  if (params.purposeOfTransaction) data.purposeOfTransaction = params.purposeOfTransaction;
  return data;
}

export { appendGasParams };
