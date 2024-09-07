import { http, createConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { Web3AuthConnector } from "@web3auth/web3auth-wagmi-connector";
import { web3AuthConnector } from './connector';
export const wagmiconfig = createConfig({
    chains: [mainnet, sepolia],
  connectors:[
    web3AuthConnector
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})
