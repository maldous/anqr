import type { EMVMPMParams } from "../../modules/payload-generators/types";

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
