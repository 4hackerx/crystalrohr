"use client";

import { SIWEConfig, SIWEProvider as _SIWEProvider } from "connectkit";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";

import { CustomSIWEConfig, SIWESession } from "@/types";

export const SESSION_KEY = "did";
const siweConfig: CustomSIWEConfig = {
  getNonce: async () => {
    return "8";
  },
  createMessage: async ({ address, chainId, nonce }) => {
    return "sign this!";
  },
  verifyMessage: async ({ message, signature }) => {
    console.log(message);
    try {
      toast.success("Successfully connected to your wallet.");

      return true;
    } catch (err) {
      console.error("Error during authentication process:", err);
      toast.error("Failed to connect to your wallet. Please try again.");
      return false;
    }
  },
  getSession: async () => {
    try {
      return { address: `0x`, chainId: 0 };
    } catch (err) {
      console.error("Error retrieving session:", err);
      return null;
    }
  },
  signOut: async () => {
    return true;
  },
};

const SIWEProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  return (
    <_SIWEProvider
      {...(siweConfig as SIWEConfig)}
      onSignIn={(session?: SIWESession) => {}}
      onSignOut={() => {
        router.push("/");
      }}
    >
      {children}
    </_SIWEProvider>
  );
};

export default SIWEProvider;
