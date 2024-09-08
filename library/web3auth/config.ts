// Web3Auth Libraries
import { Web3AuthConnector } from "@web3auth/web3auth-wagmi-connector";
import { Web3Auth } from "@web3auth/modal";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK, WALLET_ADAPTERS } from "@web3auth/base";
import { Chain } from "wagmi/chains";
import { WalletServicesPlugin } from "@web3auth/wallet-services-plugin";

export let web3AuthInstance:Web3Auth;
export default function Web3AuthConnectorInstance(chains: Chain[]) {
  // Create Web3Auth Instance
  const name = "CrystalRohr";

  const chainConfig = {
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    chainId: "0x" + chains[0].id.toString(16),
    rpcTarget: chains[0].rpcUrls.default.http[0], // This is the public RPC we have added, please pass on your own endpoint while creating an app
    displayName: chains[0].name,
    tickerName: chains[0].nativeCurrency?.name,
    ticker: chains[0].nativeCurrency?.symbol,
    blockExplorerUrl: chains[0].blockExplorers?.default.url[0] as string,
  };

  const privateKeyProvider = new EthereumPrivateKeyProvider({ config: { chainConfig } });

  web3AuthInstance = new Web3Auth({
    clientId: "BAf-TMvY5A8y73hRyyj_GBRkUmd_Yz5bZ8sFvExZp9Zl40BzI8LBktJ2piFwoeP5HxMWoPG8yD23vYwRXtkHa8M",
    chainConfig,
    privateKeyProvider,
    uiConfig: {
      appName: name,
      loginMethodsOrder: ["github", "google"],
      defaultLanguage: "en",
      modalZIndex: "2147483647",
      logoLight: "https://web3auth.io/images/web3authlog.png",
      logoDark: "https://web3auth.io/images/web3authlogodark.png",
      uxMode: "redirect",
      mode: "light",
    },
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
    enableLogging: true,
  });

  const walletServicesPlugin = new WalletServicesPlugin({
    walletInitOptions: {
      whiteLabel: {
        showWidgetButton: true,
      }
    }
  });
  web3AuthInstance.addPlugin(walletServicesPlugin);

  const modalConfig = {
    [WALLET_ADAPTERS.OPENLOGIN]: {
      label: "openlogin",
      loginMethods: {
        facebook: {
          // it will hide the facebook option from the Web3Auth modal.
          name: "facebook login",
          showOnModal: false,
        },
      },
      // setting it to false will hide all social login methods from modal.
      showOnModal: true,
    },
  }
  const addAllChains = async ()=>{
   
    await web3AuthInstance.addChain({
      chainNamespace: CHAIN_NAMESPACES.EIP155,
      chainId: "0x128",
      rpcTarget: "https://testnet.hashio.io/api",
      displayName: "Hedera Testnet",
      blockExplorerUrl: "https://hashscan.io/testnet/",
      ticker: "HBAR",
      tickerName: "HBAR",
      logo: "https://cryptologos.cc/logos/hedera-hbar-logo.png?v=033",
    });
    await web3AuthInstance.addChain({
      chainNamespace: CHAIN_NAMESPACES.EIP155,
      chainId: "0xa788",
      rpcTarget: "http://35.215.120.180:8545",
      displayName: "Kinto Testnet",
      blockExplorerUrl: "https://explorer.kinto.xyz",
      ticker: "ETH",
      tickerName: "ETH",
      logo: "https://pbs.twimg.com/profile_images/1658109577081044992/ZBpLvGSb_400x400.jpg",
    });
    await web3AuthInstance.addChain({
      chainNamespace: CHAIN_NAMESPACES.EIP155,
      chainId: "0xa96",
      rpcTarget: "https://rpc-testnet.morphl2.io",
      displayName: "Morph Testnet",
      blockExplorerUrl: "https://explorer-testnet.morphl2.io/",
      ticker: "ETH",
      tickerName: "ETH",
      logo: "https://morphl2brand.notion.site/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2Ffcab2c10-8da9-4414-aa63-4998ddf62e78%2F64fbcffc-0e7c-45e1-8900-1bb36dc90924%2FFrame_1597882262.png?table=block&id=0e6a22c3-ed4e-4c25-9575-11b95b1eade9&spaceId=fcab2c10-8da9-4414-aa63-4998ddf62e78&width=2000&userId=&cache=v2",
    });
    await web3AuthInstance.addChain({
      chainNamespace: CHAIN_NAMESPACES.EIP155,
      chainId: "0x1e",
      rpcTarget: "https://rootstock.drpc.org",
      displayName: "Rootstock Mainnet",
      blockExplorerUrl: "https://explorer.rootstock.io/",
      ticker: "RBTC",
      tickerName: "RBTC",
      logo: "https://pbs.twimg.com/profile_images/1592915327343624195/HPPSuVx3_400x400.jpg",
    });
  }

  addAllChains();

  return Web3AuthConnector({
      web3AuthInstance,
      modalConfig,
  });
}