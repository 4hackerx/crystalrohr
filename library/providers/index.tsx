"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

import ConnectKitProvider from "./connectkit";
import SIWEProvider from "./siwe";
import WagmiProvider from "./wagmi";

const queryClient = new QueryClient();

const RootProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <WagmiProvider>
      <QueryClientProvider client={queryClient}>
        <SIWEProvider>
          <ConnectKitProvider>{children}</ConnectKitProvider>
        </SIWEProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default RootProvider;
