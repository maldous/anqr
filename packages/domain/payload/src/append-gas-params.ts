/**
 * Append gas-related query parameters to URLSearchParams
 */
export function appendGasParams(
  queryParams: URLSearchParams,
  params: {
    gas?: number;
    gasLimit?: number;
    gasPrice?: string;
  },
): void {
  if (params.gas) queryParams.set("gas", params.gas.toString());
  if (params.gasLimit) queryParams.set("gasLimit", params.gasLimit.toString());
  if (params.gasPrice) queryParams.set("gasPrice", params.gasPrice);
}
