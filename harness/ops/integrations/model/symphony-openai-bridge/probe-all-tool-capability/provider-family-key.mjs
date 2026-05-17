export function providerFamilyKey(providerDef) {
  return providerDef.baseProviderName || providerDef.name;
}
