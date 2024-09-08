import type { Signer } from "@xmtp/react-sdk";
import { useClient } from "@xmtp/react-sdk";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useAccount, useWalletClient } from "wagmi";

export const XMTPConnect = () => {
  const { initialize, isLoading, error, client } = useClient();
  const { data: walletClient } = useWalletClient();
  const { address } = useAccount();
  const toastIdRef = useRef<string | number | undefined>();

  const handleConnect = useCallback(() => {
    if (walletClient) {
      initialize({
        signer: walletClient as unknown as Signer,
        options: { env: "dev" },
      });
    }
  }, [initialize, walletClient]);

  useEffect(() => {
    if (client) return;

    const showToast = () => {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }

      if (error) {
        toastIdRef.current = toast.error("Could not connect to XMTP", {
          description: "Something went wrong",
          action: {
            label: "Try again",
            onClick: handleConnect,
          },
          duration: Infinity,
        });
      } else if (isLoading) {
        toastIdRef.current = toast("Connecting to XMTP", {
          description: "Awaiting signatures...",
          duration: Infinity,
        });
      } else if (!walletClient) {
        toastIdRef.current = toast.error("Wallet not connected", {
          description: "Please connect your wallet first",
          duration: Infinity,
        });
      } else {
        toastIdRef.current = toast("XMTP not connected", {
          description: "Connect to enable analytics updates",
          action: {
            label: "Connect",
            onClick: handleConnect,
          },
          duration: Infinity,
        });
      }
    };

    setTimeout(showToast, 0);

    return () => {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }
    };
  }, [client, error, isLoading, handleConnect, walletClient, address]);

  return null;
};
