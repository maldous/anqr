// ---------------------------------------------------------------------------
// 8. Crypto address parser
// ---------------------------------------------------------------------------
export function parseCryptoPayload(payload: string): Record<string, string | null> {
  const result: Record<string, string | null> = {
    network: null,
    address: null,
    addressPreview: null,
    amount: null,
    label: null,
    message: null,
    explorerUrl: null,
    networkColor: null,
  };

  const lowerPayload = payload.toLowerCase();
  let network = 'Unknown';
  let address = payload;
  let queryString = '';

  if (lowerPayload.startsWith('bitcoin:')) {
    network = 'Bitcoin';
    result.networkColor = 'orange';
    const content = payload.slice(8);
    [address, queryString] = content.split('?');
    result.explorerUrl = `https://www.blockchain.com/btc/address/${address}`;
  } else if (lowerPayload.startsWith('ethereum:')) {
    network = 'Ethereum';
    result.networkColor = 'purple';
    const content = payload.slice(9);
    [address, queryString] = content.split('?');
    result.explorerUrl = `https://etherscan.io/address/${address}`;
  } else if (lowerPayload.startsWith('litecoin:')) {
    network = 'Litecoin';
    result.networkColor = 'gray';
    const content = payload.slice(9);
    [address, queryString] = content.split('?');
    result.explorerUrl = `https://blockchair.com/litecoin/address/${address}`;
  } else if (lowerPayload.startsWith('dogecoin:')) {
    network = 'Dogecoin';
    result.networkColor = 'yellow';
    const content = payload.slice(9);
    [address, queryString] = content.split('?');
    result.explorerUrl = `https://dogechain.info/address/${address}`;
  }

  result.network = network;
  result.address = address;
  result.addressPreview =
    address.length > 20 ? `${address.slice(0, 10)}...${address.slice(-10)}` : address;

  if (queryString) {
    const params = new URLSearchParams(queryString);
    result.amount = params.get('amount');
    result.label = params.get('label');
    result.message = params.get('message') || params.get('memo');
  }

  return result;
}
