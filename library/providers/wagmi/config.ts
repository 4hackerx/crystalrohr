import { getDefaultConfig } from "connectkit";
import { createConfig, http } from "wagmi";
import { anvil, baseSepolia } from "wagmi/chains";

export const config = createConfig(
  getDefaultConfig({
    appName: "Farlensflow",
    walletConnectProjectId:
      process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
    chains: [baseSepolia, anvil],
    multiInjectedProviderDiscovery: true,
    transports: {
      [baseSepolia.id]: http(
        `https://base-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`,
      ),
      [anvil.id]: http(),
    },
  }),
);
