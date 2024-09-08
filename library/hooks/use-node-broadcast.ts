import { useClient } from "@xmtp/react-sdk";
import { useCallback, useState } from "react";
import { invitation } from "@xmtp/proto";

export const useNodeBroadcast = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { client } = useClient();

  const broadcast = useCallback(
    async (recipient: string, consentProofBase64: string, message: string) => {
      if (!client) {
        throw new Error("Client not initialized");
      }
      setIsLoading(true);
      setError(null);

      try {
        // Convert consentProof from Base64 to Uint8Array
        const consentProofUint8Array = new Uint8Array(
          Buffer.from(consentProofBase64, "base64")
        );

        const consentProof = invitation.ConsentProofPayload.decode(
          consentProofUint8Array
        );

        const conversation = await client.conversations.newConversation(
          recipient,
          undefined,
          consentProof
        );

        console.log("Conversation created: ", conversation.topic);

        await conversation.send(message);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setIsLoading(false);
      }
    },
    [client]
  );

  return { broadcast, isLoading, error };
};
