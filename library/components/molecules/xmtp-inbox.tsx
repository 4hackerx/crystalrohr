import { ContentTypeId } from "@xmtp/content-type-primitives";
import {
  ContentTypeReaction,
  type Reaction,
} from "@xmtp/content-type-reaction";
import {
  ContentTypeAttachment,
  ContentTypeRemoteAttachment,
  type Attachment,
} from "@xmtp/content-type-remote-attachment";
import { ContentTypeReply, type Reply } from "@xmtp/content-type-reply";
import { ContentTypeText } from "@xmtp/content-type-text";
import {
  CachedMessage,
  ConsentState,
  getAttachment,
  useAttachment,
  useCanMessage,
  useClient,
  useConsent,
  useConversations,
  useLastMessage,
  useMessages,
  useReactions,
  useReply,
  useSendMessage,
  useStartConversation,
  useStreamConversations,
  useStreamMessages,
  type CachedConversation,
} from "@xmtp/react-sdk";
import { format, isSameDay } from "date-fns";
import { ArrowUpIcon, ChevronLeftIcon, CircleIcon } from "lucide-react";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Button } from "../atoms/button";

export const Inbox: React.FC = () => {
  const { loadConsentList } = useConsent();
  const [selectedConversation, setSelectedConversation] = useState<
    CachedConversation | undefined
  >(undefined);
  const [isNewMessage, setIsNewMessage] = useState(false);

  const handleConversationClick = useCallback((convo: CachedConversation) => {
    setSelectedConversation(convo);
    setIsNewMessage(false);
  }, []);

  const handleStartNewConversation = useCallback(() => {
    setIsNewMessage(true);
  }, []);

  const handleStartNewConversationSuccess = useCallback(
    (convo?: CachedConversation) => {
      setSelectedConversation(convo);
      setIsNewMessage(false);
    },
    []
  );

  useEffect(() => {
    void loadConsentList();
  }, [loadConsentList]);

  const { conversations, isLoading } = useConversations();
  useStreamConversations();

  const previews = conversations.map((conversation) => (
    <ConversationCard
      key={conversation.topic}
      conversation={conversation}
      isSelected={conversation.topic === selectedConversation?.topic}
      onConversationClick={handleConversationClick}
    />
  ));

  return (
    <div className="flex flex-col w-full">
      <div className="p-4 bg-gray-100">
        <Button onClick={handleStartNewConversation} className="w-full">
          New message
        </Button>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/3 overflow-y-auto border-r border-gray-200">
          {!previews.length && !isLoading && (
            <p className="p-4 text-gray-500">
              It looks like you don&rsquo;t have any conversations yet. Create
              one to get started
            </p>
          )}
          {isLoading ? (
            <div className="p-4">
              <div className="animate-pulse space-y-4">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ) : (
            previews
          )}
        </div>
        <div className="w-2/3 flex flex-col">
          {isNewMessage ? (
            <NewMessage onSuccess={handleStartNewConversationSuccess} />
          ) : selectedConversation ? (
            <Messages conversation={selectedConversation} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a conversation to display its messages or start a new
              conversation
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

type ConversationCardProps = {
  conversation: CachedConversation;
  isSelected: boolean;
  onConversationClick?: (conversation: CachedConversation) => void;
};

const ConversationCard: React.FC<ConversationCardProps> = ({
  conversation,
  onConversationClick,
  isSelected,
}) => {
  const lastMessage = useLastMessage(conversation.topic);
  const { entries } = useConsent();

  const handlePreviewClick = useCallback(() => {
    onConversationClick?.(conversation);
  }, [conversation, onConversationClick]);

  return (
    <ConversationPreviewCard
      conversation={conversation}
      isSelected={isSelected}
      onClick={handlePreviewClick}
      lastMessage={lastMessage}
      consentState={
        entries[conversation.peerAddress]?.permissionType ?? "unknown"
      }
    />
  );
};

type ConversationPreviewCardProps = {
  conversation: CachedConversation;
  lastMessage?: CachedMessage;
  onClick?: (conversation: CachedConversation) => void;
  isSelected?: boolean;
  consentState: ConsentState;
};

const ConversationPreviewCard: React.FC<ConversationPreviewCardProps> = ({
  conversation,
  onClick,
  isSelected,
  lastMessage,
  consentState,
}) => {
  const { allow, deny } = useConsent();
  const attachment = lastMessage ? getAttachment(lastMessage) : undefined;
  let content: any;
  if (attachment) {
    content = attachment.filename;
  } else if (typeof lastMessage?.content === "string") {
    content = lastMessage.content;
  } else if (lastMessage?.contentFallback) {
    content = lastMessage.contentFallback;
  }

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter") {
        onClick?.(conversation);
      }
    },
    [conversation, onClick]
  );

  const handleClick = useCallback(() => {
    onClick?.(conversation);
  }, [conversation, onClick]);

  const handleAllow = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      await allow([conversation.peerAddress]);
    },
    [allow, conversation.peerAddress]
  );

  const handleDeny = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      await deny([conversation.peerAddress]);
    },
    [deny, conversation.peerAddress]
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
      className={`p-4 border-b border-gray-200 hover:bg-gray-50 ${
        isSelected ? "bg-blue-50" : ""
      }`}
    >
      <div className="font-semibold truncate">{conversation.peerAddress}</div>
      <div className="text-sm text-gray-500 truncate">{content}</div>
      <div className="mt-2 flex justify-between items-center">
        <div className="text-xs text-gray-400">
          {lastMessage?.sentAt && format(lastMessage.sentAt, "PPp")}
        </div>
        <div className="text-xs font-medium">{consentState}</div>
        <div className="flex space-x-2">
          <button
            className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded bg-blue-100 hover:bg-blue-200"
            onClick={handleAllow}
          >
            Allow
          </button>
          <button
            className="text-xs text-red-600 hover:text-red-800 px-2 py-1 rounded bg-red-100 hover:bg-red-200"
            onClick={handleDeny}
          >
            Deny
          </button>
        </div>
      </div>
    </div>
  );
};

type NewMessageProps = {
  onSuccess?: (conversation?: CachedConversation) => void;
};

export const NewMessage: React.FC<NewMessageProps> = ({ onSuccess }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [peerAddress, setPeerAddress] = useState("");
  const [isOnNetwork, setIsOnNetwork] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { startConversation } = useStartConversation();
  const { canMessage } = useCanMessage();

  const handleChange = useCallback((updatedValue: string) => {
    setPeerAddress(updatedValue);
  }, []);

  const handleStartConversation = useCallback(
    async (message: string) => {
      if (peerAddress && isOnNetwork) {
        setIsLoading(true);
        const result = await startConversation(peerAddress, message);
        setIsLoading(false);
        if (result) {
          onSuccess?.(result.cachedConversation);
        }
      }
    },
    [isOnNetwork, onSuccess, peerAddress, startConversation]
  );

  useEffect(() => {
    const checkAddress = async () => {
      if (peerAddress) {
        setIsLoading(true);
        setIsOnNetwork(await canMessage(peerAddress));
        setIsLoading(false);
      } else {
        setIsOnNetwork(false);
      }
    };
    void checkAddress();
  }, [canMessage, peerAddress]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  let subtext: string | undefined;
  let isError = false;
  if (peerAddress === "") {
    subtext = "Enter a 0x wallet address";
  } else if (isLoading) {
    subtext = "Finding address on the XMTP network...";
  } else if (!isOnNetwork) {
    subtext =
      "Sorry, we can't message this address because its owner hasn't used it with XMTP yet";
    isError = true;
  }

  return (
    <div className="p-4">
      <AddressInput
        ref={inputRef}
        subtext={subtext}
        value={peerAddress}
        onChange={handleChange}
        isError={isError}
        avatarUrlProps={{
          address: isOnNetwork ? peerAddress : "",
        }}
      />
      <div className="mt-4">
        <MessageInput
          isDisabled={isLoading || isError}
          onSubmit={handleStartConversation}
        />
      </div>
    </div>
  );
};

type AddressInputProps = {
  ariaLabel?: string;
  resolvedAddress?: {
    displayAddress: string;
    walletAddress?: string;
  };
  subtext?: string;
  avatarUrlProps?: {
    avatarUrl?: string;
    isLoading?: boolean;
    address?: string;
  };
  label?: string;
  onChange?: (value: string) => void;
  isError?: boolean;
  isLoading?: boolean;
  onTooltipClick?: () => void;
  value?: string;
  onLeftIconClick?: () => void;
};

const AddressInput = forwardRef<HTMLInputElement, AddressInputProps>(
  (
    {
      ariaLabel,
      resolvedAddress,
      subtext,
      avatarUrlProps,
      onChange,
      isError,
      isLoading,
      label,
      onLeftIconClick,
      onTooltipClick,
      value,
    },
    ref
  ) => {
    const handleChange = useCallback<
      React.ChangeEventHandler<HTMLInputElement>
    >(
      (event) => {
        onChange?.(event.target.value);
      },
      [onChange]
    );

    const isResolvedAddress = !!resolvedAddress?.displayAddress;

    return (
      <div className="relative">
        {onLeftIconClick && (
          <button
            onClick={onLeftIconClick}
            className="absolute left-3 top-1/2 transform -translate-y-1/2"
          >
            <ChevronLeftIcon className="w-5 h-5 text-gray-400" />
          </button>
        )}
        <div className="mt-1">
          {label && (
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700"
            >
              {label}
            </label>
          )}
          <div className="mt-1 relative rounded-md shadow-sm">
            {isLoading ? (
              <div className="animate-pulse h-10 bg-gray-200 rounded"></div>
            ) : resolvedAddress?.displayAddress ? (
              <div className="py-2 px-3 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                <span
                  data-testid="recipient-wallet-address"
                  className="font-medium"
                >
                  {resolvedAddress.displayAddress}
                </span>
                {resolvedAddress.walletAddress && (
                  <span className="ml-2 text-gray-500">
                    {resolvedAddress.walletAddress}
                  </span>
                )}
              </div>
            ) : (
              <input
                data-testid="message-to-input"
                tabIndex={0}
                id="address"
                type="text"
                spellCheck="false"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                onChange={handleChange}
                value={value}
                aria-label={ariaLabel}
                ref={ref}
                className={`block w-full rounded-md sm:text-sm ${
                  isError
                    ? "border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                }`}
              />
            )}
            {subtext && (
              <p
                className={`mt-2 text-sm ${isError ? "text-red-600" : "text-gray-500"}`}
              >
                {subtext}
              </p>
            )}
          </div>
        </div>
        {onTooltipClick && (
          <button
            onClick={onTooltipClick}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            <CircleIcon className="w-5 h-5 text-gray-400" />
          </button>
        )}
      </div>
    );
  }
);

type MessageInputProps = {
  isDisabled?: boolean;
  onSubmit?: (msg: string) => Promise<void>;
  placeholder?: string;
  submitSrText?: string;
};

const MIN_TEXTAREA_HEIGHT = 32;

export const MessageInput = forwardRef<HTMLTextAreaElement, MessageInputProps>(
  ({ isDisabled, onSubmit, placeholder, submitSrText }, ref) => {
    const textAreaRef = useRef<HTMLTextAreaElement>(null);
    useImperativeHandle<HTMLTextAreaElement | null, HTMLTextAreaElement | null>(
      ref,
      () => textAreaRef.current
    );
    const [value, setValue] = useState("");
    const onChange = (event: React.ChangeEvent<HTMLTextAreaElement>) =>
      setValue(event.target.value);

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent) => {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          if (value) {
            void onSubmit?.(value);
            setValue("");
          }
        }
      },
      [onSubmit, value]
    );

    const handleClick = useCallback(() => {
      if (value) {
        void onSubmit?.(value);
        setValue("");
      }
    }, [onSubmit, value]);

    useLayoutEffect(() => {
      if (textAreaRef?.current?.value) {
        const currentScrollHeight = textAreaRef?.current.scrollHeight;
        textAreaRef.current.style.height = `${Math.max(
          currentScrollHeight,
          MIN_TEXTAREA_HEIGHT
        )}px`;
      } else if (textAreaRef?.current) {
        textAreaRef.current.style.height = `${MIN_TEXTAREA_HEIGHT}px`;
      }
    }, [value]);

    return (
      <div className="relative">
        {placeholder && (
          <label htmlFor="chat" className="sr-only">
            {placeholder}
          </label>
        )}
        <div className="flex items-center">
          <textarea
            name="chat"
            onChange={onChange}
            onKeyDown={handleKeyDown}
            ref={textAreaRef}
            rows={1}
            placeholder={placeholder}
            value={value}
            disabled={isDisabled}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm resize-none"
          />
          <Button
            variant="secondary"
            onClick={handleClick}
            className="ml-2 p-2 rounded-full"
          >
            <ArrowUpIcon className="w-5 h-5 text-white" />
            {submitSrText && <span className="sr-only">{submitSrText}</span>}
          </Button>
        </div>
      </div>
    );
  }
);

type ConversationMessagesProps = {
  conversation: CachedConversation;
};

export const Messages: React.FC<ConversationMessagesProps> = ({
  conversation,
}) => {
  const [isSending, setIsSending] = useState(false);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const { messages, isLoading } = useMessages(conversation);
  const { client } = useClient();
  useStreamMessages(conversation);
  const { sendMessage } = useSendMessage();

  const filteredMessages = useMemo(
    () =>
      messages.filter((message) => {
        const contentType = ContentTypeId.fromString(message.contentType);
        return (
          message.content !== undefined &&
          !contentType.sameAs(ContentTypeReaction)
        );
      }),
    [messages]
  );

  const handleSendMessage = useCallback(
    async (message: string) => {
      setIsSending(true);
      await sendMessage(conversation, message);
      setIsSending(false);
      setTimeout(() => messageInputRef.current?.focus(), 0);
    },
    [conversation, sendMessage]
  );

  useEffect(() => {
    messageInputRef.current?.focus();
  }, [conversation]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 bg-gray-100 border-b border-gray-200">
        <AddressInput
          value={conversation.peerAddress}
          avatarUrlProps={{ address: conversation.peerAddress }}
        />
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <MessagesList
          conversation={conversation}
          isLoading={isLoading}
          messages={filteredMessages}
          clientAddress={client?.address}
        />
      </div>
      <div className="p-4 border-t border-gray-200">
        <MessageInput
          isDisabled={isSending}
          onSubmit={handleSendMessage}
          ref={messageInputRef}
          placeholder="Type a message..."
        />
      </div>
    </div>
  );
};

type MessagesProps = {
  conversation: CachedConversation;
  clientAddress?: string;
  isLoading?: boolean;
  messages?: CachedMessage[];
};

export const MessagesList: React.FC<MessagesProps> = ({
  clientAddress = "",
  conversation,
  isLoading = false,
  messages = [],
}) => {
  if (isLoading && !messages.length) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-gray-300 h-10 w-10"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const renderedDates: Date[] = [];

  return (
    <div data-testid="message-tile-container" className="space-y-4">
      {messages.map((message, idx, filteredMessages) => {
        if (renderedDates.length === 0) {
          renderedDates.push(message.sentAt);
        }
        const lastRenderedDate = renderedDates.at(-1) as Date;
        const isIncoming = message.senderAddress !== clientAddress;
        const isFirstMessage = idx === 0;
        const isLastMessage = idx === filteredMessages.length - 1;
        const isSameDate = isSameDay(lastRenderedDate, message.sentAt);
        const shouldDisplayDate =
          isFirstMessage || isLastMessage || !isSameDate;

        if (shouldDisplayDate && !isLastMessage) {
          renderedDates.push(message.sentAt);
        }

        return (
          <React.Fragment key={message.id}>
            {shouldDisplayDate && (
              <DateDivider date={renderedDates.at(-1) as Date} />
            )}
            <Message
              conversation={conversation}
              message={message}
              isIncoming={isIncoming}
            />
          </React.Fragment>
        );
      })}
    </div>
  );
};

type DateDividerProps = {
  date: Date;
};

const DateDivider: React.FC<DateDividerProps> = ({ date }) => (
  <div className="flex items-center my-4">
    <div className="flex-grow border-t border-gray-300"></div>
    <div className="mx-4 text-sm text-gray-500" title={date.toDateString()}>
      {format(date, "PPP")}
    </div>
    <div className="flex-grow border-t border-gray-300"></div>
  </div>
);

type MessageProps = {
  conversation: CachedConversation;
  message: CachedMessage;
  isIncoming?: boolean;
};

export const Message: React.FC<MessageProps> = ({
  conversation,
  message,
  isIncoming,
}) => {
  const contentType = ContentTypeId.fromString(message.contentType);
  return (
    <div
      className={`flex ${isIncoming ? "justify-start" : "justify-end"} mb-4`}
    >
      <div
        className={`max-w-xs lg:max-w-md ${isIncoming ? "bg-gray-200" : "bg-blue-500 text-white"} rounded-lg p-3`}
      >
        {contentType.sameAs(ContentTypeReply) ? (
          <ReplyContent message={message} isIncoming={isIncoming} />
        ) : (
          <MessageContent message={message} isIncoming={isIncoming} />
        )}
        <div
          className="text-xs mt-1 text-gray-500"
          title={message.sentAt.toLocaleString()}
        >
          {format(message.sentAt, "h:mm a")}
        </div>
        <ReactionsBar conversation={conversation} message={message} />
        <ReactionsContent conversation={conversation} message={message} />
      </div>
    </div>
  );
};

type MessageContentProps = {
  message: CachedMessage;
  isIncoming?: boolean;
  isRepliedTo?: boolean;
};

const MessageContent: React.FC<MessageContentProps> = ({
  message,
  isIncoming,
  isRepliedTo,
}) => {
  const contentType = ContentTypeId.fromString(message.contentType);
  let content: any;

  if (contentType.sameAs(ContentTypeText)) {
    content = typeof message.content === "string" ? message.content : undefined;
  }

  if (
    contentType.sameAs(ContentTypeAttachment) ||
    contentType.sameAs(ContentTypeRemoteAttachment)
  ) {
    content = <AttachmentContent message={message} />;
  }

  return (
    <div
      data-testid="message-tile-text"
      className={`${isRepliedTo ? "text-sm" : "text-base"}`}
    >
      {content ??
        message.contentFallback ??
        "This content is not supported by this client"}
    </div>
  );
};

type AttachmentProps = {
  message: CachedMessage;
};

const blobCache = new WeakMap<Uint8Array, string>();

const getBlobURL = (attachment: Attachment) => {
  if (!blobCache.get(attachment.data)) {
    blobCache.set(
      attachment.data,
      URL.createObjectURL(
        new Blob([Buffer.from(attachment.data)], {
          type: attachment.mimeType,
        })
      )
    );
  }

  return blobCache.get(attachment.data)!;
};

const AttachmentContent: React.FC<AttachmentProps> = ({ message }) => {
  const { attachment, status } = useAttachment(message);

  if (status === "error") {
    return <div className="text-red-500">Unable to load attachment</div>;
  }

  if (status === "loading" || !attachment) {
    return <div className="text-gray-500">Loading...</div>;
  }

  const blobURL = getBlobURL(attachment);

  if (attachment.mimeType.startsWith("image/")) {
    return (
      <div className="max-w-xs">
        <img src={blobURL} alt="" className="rounded-lg" />
      </div>
    );
  }

  if (attachment.mimeType.startsWith("audio/")) {
    return (
      <audio controls src={blobURL} className="w-full">
        <a href={blobURL} className="text-blue-500 hover:underline">
          Download instead
        </a>
      </audio>
    );
  }

  if (attachment.mimeType.startsWith("video/")) {
    return (
      <video controls autoPlay className="max-w-xs rounded-lg">
        <source src={blobURL} type="video/mp4" />
        Video messages not supported.
      </video>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <svg
        className="w-5 h-5 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <a
        href={blobURL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 hover:underline"
      >
        {attachment.filename}
      </a>
    </div>
  );
};

type ReactionsBarProps = {
  conversation: CachedConversation;
  message: CachedMessage;
};

const availableReactionEmojis = ["👍", "👎", "❤️"];

export const ReactionsBar: React.FC<ReactionsBarProps> = ({
  conversation,
  message,
}) => {
  const { sendMessage } = useSendMessage();
  const handleClick = useCallback(
    (emoji: string) => {
      void sendMessage<Reaction>(
        conversation,
        {
          content: emoji,
          schema: "unicode",
          reference: message.id,
          action: "added",
        },
        ContentTypeReaction
      );
    },
    [conversation, message.id, sendMessage]
  );

  return (
    <div className="flex space-x-2 mt-2">
      {availableReactionEmojis.map((emoji) => (
        <button
          type="button"
          key={emoji}
          onClick={() => handleClick(emoji)}
          className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <span className="text-lg">{emoji}</span>
        </button>
      ))}
    </div>
  );
};

type ReactionsContentProps = {
  conversation: CachedConversation;
  message: CachedMessage;
};

export const ReactionsContent: React.FC<ReactionsContentProps> = ({
  conversation,
  message,
}) => {
  const { client } = useClient();
  const { sendMessage } = useSendMessage();
  const reactions = useReactions(message);

  const emojiReactions = useMemo(
    () =>
      reactions
        .filter((reaction) => reaction.schema === "unicode")
        .reduce(
          (acc, reaction) => {
            const count = (acc?.[reaction.content]?.count ?? 0) + 1;
            const senderAddresses =
              acc?.[reaction.content]?.senderAddresses ?? [];
            return {
              ...acc,
              [reaction.content]: {
                count,
                senderAddresses: [...senderAddresses, reaction.senderAddress],
              },
            };
          },
          {} as Record<
            string,
            {
              count: number;
              senderAddresses: string[];
            }
          >
        ),
    [reactions]
  );

  const emojiCount = useCallback(
    (emoji: string) => emojiReactions[emoji]?.count ?? 0,
    [emojiReactions]
  );

  const handleClick = useCallback(
    (emoji: string) => {
      const hasReacted = emojiReactions[emoji].senderAddresses.includes(
        client?.address ?? ""
      );
      void sendMessage<Reaction>(
        conversation,
        {
          content: emoji,
          schema: "unicode",
          reference: message.id,
          action: hasReacted ? "removed" : "added",
        },
        ContentTypeReaction
      );
    },
    [client?.address, conversation, emojiReactions, message.id, sendMessage]
  );

  return (
    reactions.length > 0 && (
      <div className="flex flex-wrap gap-2 mt-2">
        {availableReactionEmojis.map((emoji) => {
          const count = emojiCount(emoji);
          return count > 0 ? (
            <button
              type="button"
              key={emoji}
              onClick={() => handleClick(emoji)}
              className="bg-gray-100 rounded-full px-2 py-1 text-sm flex items-center space-x-1 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <span>{emoji}</span>
              <span className="font-medium">{count}</span>
            </button>
          ) : null;
        })}
      </div>
    )
  );
};

type ReplyProps = {
  message: CachedMessage;
  isIncoming?: boolean;
};

export const ReplyContent: React.FC<ReplyProps> = ({ message, isIncoming }) => {
  const { originalMessage } = useReply(message);

  const reply = message.content as Reply;
  const replyMessage = {
    ...message,
    content: reply.content,
    contentType: new ContentTypeId(reply.contentType).toString(),
  } satisfies CachedMessage;

  return (
    <div className="space-y-2">
      <div className="border-l-4 border-gray-300 pl-2">
        {originalMessage ? (
          <MessageContent
            message={originalMessage}
            isIncoming={isIncoming}
            isRepliedTo
          />
        ) : (
          <div className="text-sm text-gray-500 italic">
            Loading original message...
          </div>
        )}
      </div>
      <div>
        <MessageContent message={replyMessage} isIncoming={isIncoming} />
      </div>
    </div>
  );
};
