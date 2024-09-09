import { useCallback, useState } from "react";
import { Address, decodeEventLog, defineChain, http } from "viem";
import { useReadContract, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";

import { config } from "@/providers/wagmi/config";

import core from "@/types/contracts/ai-caption";

const CHAT_ADDRESS = core.address as Address;
const CHAT_ABI = core.abi;

const MESSAGE =
  "Create a JSON array where each entry is a concise sentence description tailored for a visually impaired audience. These descriptions should summarize the main elements—characters, expressions, setting, actions, and mood—of each video still sequentially from the first to the last. Use the following format: Brief description of first image for a visually impaired audience, Brief description of second image for a visually impaired audience., Continue with concise descriptions for each subsequent image  Each description should be crafted to convey the essential visual details of the still in a single sentence. 1.Your response must be in JSON, don't put it in a md json tag only an array, 2. don't say this picture simply talk naturally e.g a middle aged woman in a swim suit etc";

const galadrielChain = defineChain({
  id: 696969,
  name: "Galadriel",
  nativeCurrency: {
    symbol: "GAL",
    name: "GAL",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://devnet.galadriel.com/"],
    },
  },
  blockExplorers: {
    default: {
      name: "Galadriel",
      url: "https://explorer.galadriel.com",
    },
  },
  testnet: true,
});

export function useVisionFunctions() {
  const [chatId, setchatId] = useState<number | null>(null);

  const { writeContract: writeStartChat } = useWriteContract();

  const { data: messageHistory, refetch: refetchMessageHistory } =
    useReadContract({
      address: CHAT_ADDRESS,
      abi: CHAT_ABI,
      functionName: "getMessageHistory",
      args: [BigInt(chatId || 0)],
      query: {
        enabled: !!chatId,
      },
      chainId: galadrielChain.id,
    });

  const startChat = useCallback(
    (imageUrls: string[]): Promise<void> => {
      return new Promise((resolve, reject) => {
        writeStartChat(
          {
            address: CHAT_ADDRESS,
            abi: CHAT_ABI,
            functionName: "startChat",
            args: [MESSAGE, imageUrls],
            chainId: galadrielChain.id,
          },
          {
            onSuccess: async (hash) => {
              try {
                const receipt = await waitForTransactionReceipt(config, {
                  hash,
                });
                if (receipt.status !== "success") {
                  throw new Error("Add message failed");
                }

                const chatCreatedEvent = receipt.logs.find((log) => {
                  try {
                    const event = decodeEventLog({
                      abi: CHAT_ABI,
                      data: log.data,
                      topics: log.topics,
                    });
                    return event.eventName === "ChatCreated";
                  } catch {
                    return false;
                  }
                });

                if (chatCreatedEvent) {
                  const decodedEvent = decodeEventLog({
                    abi: CHAT_ABI,
                    data: chatCreatedEvent.data,
                    topics: chatCreatedEvent.topics,
                  });

                  if (
                    decodedEvent.eventName === "ChatCreated" &&
                    "args" in decodedEvent &&
                    decodedEvent.args.chatId
                  ) {
                    const newchatId = Number(decodedEvent.args.chatId);
                    setchatId(newchatId);
                  }
                }
                resolve();
              } catch (error) {
                reject(error);
              }
            },
            onError: reject,
          }
        );
      });
    },
    [writeStartChat, chatId]
  );

  const getMessageHistory = useCallback(
    async (passedChatId?: number) => {
      const currentChatId = passedChatId || chatId;
      if (!currentChatId) {
        throw new Error("Chat ID is not set");
      }
      setchatId(currentChatId);
      await refetchMessageHistory();
      return messageHistory;
    },
    [chatId, refetchMessageHistory, messageHistory]
  );

  return {
    startChat,
    getMessageHistory,
    chatId,
  };
}
