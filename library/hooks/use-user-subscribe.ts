import {
  createConsentMessage,
  createConsentProofPayload,
} from "@xmtp/consent-proof-signature";
import { useCallback, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";

export const useUserSubscribe = () => {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subscribe = useCallback(
    async (nodeAddress: string) => {
      setIsLoading(true);
      setError(null);
      try {
        if (!address) {
          throw new Error("No address found");
        }

        const timestamp = Date.now();
        const message = createConsentMessage(nodeAddress, timestamp);

        const signature = await signMessageAsync({ message });

        const consentProof = createConsentProofPayload(signature, timestamp);
        const consentProofBase64 = Buffer.from(consentProof).toString("base64");

        setIsLoading(false);

        return consentProofBase64;
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setIsLoading(false);
        return null;
      }
    },
    [address, signMessageAsync]
  );

  return { subscribe, isLoading, error };
};
