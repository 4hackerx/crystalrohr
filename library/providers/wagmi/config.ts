// WAGMI Libraries
import { defineChain } from "viem";
import { createConfig, http } from "wagmi";
import {
  Chain,
  anvil,
  hederaTestnet,
  mainnet,
  polygon,
  rootstockTestnet,
  sepolia,
} from "wagmi/chains";
import Web3AuthConnectorInstance from "../../web3auth/config";

const kintoChain: Chain = {
  id: 5600, // Replace with actual Kinto chain ID
  name: "Kinto",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    public: { http: ["https://kinto-rpc-url.example"] }, // Replace with actual RPC URL
    default: { http: ["https://kinto-rpc-url.example"] }, // Replace with actual RPC URL
  },
  blockExplorers: {
    default: { name: "KintoScan", url: "https://kintoscan.example" }, // Replace with actual block explorer
  },
  testnet: true, // Set to false if it's mainnet
};

export const galadriel = defineChain({
  id: 696969,
  name: "Galadriel",
  nativeCurrency: {
    symbol: "GAL",
    name: "GAL",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://devnet.galadriel.com/"],
    },
  },
  blockExplorers: {
    default: {
      name: "Galadriel",
      url: "https://explorer.galadriel.com",
    },
  },
  testnet: true,
});

export const config = createConfig({
  chains: [
    sepolia,
    anvil,
    mainnet,
    polygon,
    rootstockTestnet,
    hederaTestnet,
    galadriel,
  ],
  transports: {
    [anvil.id]: http(),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [polygon.id]: http(),
    [rootstockTestnet.id]: http(),
    [hederaTestnet.id]: http(),
    [galadriel.id]: http(),
  },
  connectors: [
    Web3AuthConnectorInstance([
      anvil,
      mainnet,
      sepolia,
      polygon,
      rootstockTestnet,
      hederaTestnet,
      galadriel,
    ]),
  ],
});
