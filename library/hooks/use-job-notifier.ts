import { useState, useEffect, useMemo, useCallback } from "react";
import {
  useConversations,
  useMessages,
  CachedConversation,
  CachedMessage,
  ContentTypeMetadata,
} from "@xmtp/react-sdk";

const useJobNotifier = (address: string, jobId: string) => {
  const [latestMessage, setLatestMessage] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { conversations } = useConversations();

  const conversation = useMemo<CachedConversation<ContentTypeMetadata>>(() => {
    return (
      conversations.find((conv) => conv.peerAddress === address) ||
      ({ peerAddress: address } as CachedConversation<ContentTypeMetadata>)
    );
  }, [conversations, address]);

  const { messages, isLoading: messagesLoading } = useMessages(conversation);

  useEffect(() => {
    if (!messagesLoading && messages) {
      try {
        const jobMessages = messages.filter((msg: CachedMessage) => {
          if (typeof msg.content !== "string") return false;
          try {
            const parsedContent = JSON.parse(msg.content);
            return (
              parsedContent &&
              typeof parsedContent === "object" &&
              "jobId" in parsedContent &&
              parsedContent.jobId === jobId
            );
          } catch {
            return false; // If parsing fails, it's not a valid job message
          }
        });

        if (jobMessages.length > 0) {
          const latestJobMessage = jobMessages.reduce((latest, current) =>
            current.sentAt > latest.sentAt ? current : latest
          );

          try {
            const parsedContent = JSON.parse(
              latestJobMessage.content as string
            );
            setLatestMessage(parsedContent);
          } catch {
            setLatestMessage(null);
            setError("Failed to parse the latest job message");
          }
        } else {
          setLatestMessage(null);
        }
        setIsLoading(false);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        setIsLoading(false);
      }
    }
  }, [messages, messagesLoading, jobId]);

  return {
    latestMessage,
    isLoading: isLoading || messagesLoading,
    error,
  };
};

export default useJobNotifier;
