import React from "react";
import { WagmiProvider as _WagmiProvider } from "wagmi";
import { wagmiconfig } from "./config";

const WagmiProvider = ({ children }: { children: React.ReactNode }) => {
  return <_WagmiProvider config={wagmiconfig}>{children}</_WagmiProvider>;
};

export default WagmiProvider;
