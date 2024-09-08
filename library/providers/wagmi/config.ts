 // WAGMI Libraries
import { WagmiProvider, createConfig, http, useAccount, useConnect, useDisconnect } from "wagmi";
import { coinbaseWallet, walletConnect } from "wagmi/connectors";
import { sepolia, mainnet, polygon, Chain,rootstockTestnet,hederaTestnet } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query' 
import Web3AuthConnectorInstance from "../../web3auth/config"


const kintoChain: Chain = {
  id: 5600, // Replace with actual Kinto chain ID
  name: 'Kinto',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    public: { http: ['https://kinto-rpc-url.example'] }, // Replace with actual RPC URL
    default: { http: ['https://kinto-rpc-url.example'] }, // Replace with actual RPC URL
  },
  blockExplorers: {
    default: { name: 'KintoScan', url: 'https://kintoscan.example' }, // Replace with actual block explorer
  },
  testnet: true, // Set to false if it's mainnet
}



export const config = createConfig({
  chains: [mainnet, sepolia, polygon,rootstockTestnet,hederaTestnet],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [polygon.id]: http(),
    [rootstockTestnet.id]:  http(),
    [hederaTestnet.id]:http()
  },
  connectors: [
    Web3AuthConnectorInstance([sepolia, mainnet,  polygon,rootstockTestnet,hederaTestnet]),
  ],
});