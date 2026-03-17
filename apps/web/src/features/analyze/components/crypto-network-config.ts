export type CryptoNetworkConfig = {
  name: string;
  color: string;
  explorerBaseUrl: string;
  prefix: string;
};

export const CRYPTO_NETWORK_CONFIG: CryptoNetworkConfig[] = [
  {
    name: "Bitcoin",
    color: "orange",
    explorerBaseUrl: "https://www.blockchain.com/btc/address/",
    prefix: "bitcoin:",
  },
  {
    name: "Ethereum",
    color: "purple",
    explorerBaseUrl: "https://etherscan.io/address/",
    prefix: "ethereum:",
  },
  {
    name: "Litecoin",
    color: "gray",
    explorerBaseUrl: "https://blockchair.com/litecoin/address/",
    prefix: "litecoin:",
  },
  {
    name: "Dogecoin",
    color: "yellow",
    explorerBaseUrl: "https://dogechain.info/address/",
    prefix: "dogecoin:",
  },
];
