"use client";

import { useModal, useSIWE } from "connectkit";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

import { Button } from "@/components/atoms/button";
import { SESSION_KEY } from "@/providers/siwe";
import { useStore } from "@/store/useStore";
import { SIWESession } from "@/types";
import { ellipsisAddress } from "@/utils";

const CustomSIWEButton = () => {
  const [isClient, setIsClient] = useState(false);

  const { setOpen } = useModal();
  const { isConnected } = useAccount();
  const setDid = useStore((store) => store.setDid);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const { data, isReady, isRejected, isLoading, isSignedIn, signOut, signIn } =
    useSIWE();

  useEffect(() => {
    (async () => {
      try {
        const sessionStr = localStorage.getItem(SESSION_KEY);
        if (!sessionStr) return null;
        const sessionObj = JSON.parse(sessionStr) as SIWESession;
        setDid(sessionObj.did!);
      } catch (err) {
        console.error("Error retrieving session:", err);
      }
    })();
  }, [setDid]);

  const handleSignIn = async () => {
    await signIn()?.then((session?: SIWESession) => {
      // Do something when signed in
    });
  };

  /** Wallet is connected and signed in */
  if (isSignedIn && isClient) {
    return (
      <>
        <Button
          onClick={() => setOpen(true)}
          className="bg-zinc-800 text-white hover:bg-zinc-700 rounded-lg py-3"
        >
          {ellipsisAddress(data?.address)}
        </Button>
      </>
    );
  }

  /** Wallet is connected, but not signed in */
  if (isConnected && isClient) {
    return (
      <>
        <Button
          className="bg-zinc-800 text-white hover:bg-zinc-700 rounded-lg py-3"
          onClick={handleSignIn}
          disabled={isLoading}
        >
          {isRejected // User Rejected
            ? "Try Again"
            : isLoading // Waiting for signing request
              ? "Awaiting request..."
              : // Waiting for interaction
                "Sign In"}
        </Button>
      </>
    );
  }

  /** A wallet needs to be connected first */
  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-zinc-800 text-white hover:bg-zinc-700 rounded-lg py-3"
      >
        Connect Wallet
      </Button>
    </>
  );
};

export default CustomSIWEButton;
