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
  ``;

  const { conversations } = useConversations();

  const conversation = useMemo<CachedConversation<ContentTypeMetadata>>(() => {
    return (
      conversations.find((conv) => conv.peerAddress === address) ||
      ({ peerAddress: address } as CachedConversation<ContentTypeMetadata>)
    );
  }, [conversations, address]);

  const { messages, isLoading: messagesLoading } = useMessages(conversation);

  const parseMessage = useCallback(
    (content: string) => {
      try {
        const parsedContent = JSON.parse(content);
        return (
          parsedContent &&
          typeof parsedContent === "object" &&
          "jobId" in parsedContent &&
          parsedContent.jobId === jobId
        );
      } catch {
        return false;
      }
    },
    [jobId]
  );

  useEffect(() => {
    if (messagesLoading || !messages) return;

    const jobMessages = messages.filter(
      (msg: CachedMessage) =>
        typeof msg.content === "string" && parseMessage(msg.content)
    );

    if (jobMessages.length === 0) {
      setLatestMessage(null);
      setIsLoading(false);
      return;
    }

    const latestJobMessage = jobMessages
      .filter((msg) => msg.senderAddress === address)
      .reduce(
        (latest, current) =>
          current.sentAt > latest.sentAt ? current : latest,
        jobMessages[0] // Provide initial value
      );

    try {
      const parsedContent = JSON.parse(latestJobMessage.content as string);
      setLatestMessage(parsedContent);
      setIsLoading(false);
      setError(null);
    } catch (err) {
      setLatestMessage(null);
      setError("Failed to parse the latest job message");
      setIsLoading(false);
    }
  }, [messages, messagesLoading, parseMessage]);

  return useMemo(
    () => ({
      latestMessage,
      isLoading: isLoading || messagesLoading,
      error,
    }),
    [latestMessage, isLoading, messagesLoading, error]
  );
};

export default useJobNotifier;
