import {
  XMTPProvider as _XMTPProvider,
  attachmentContentTypeConfig,
  reactionContentTypeConfig,
  replyContentTypeConfig,
  useClient,
} from "@xmtp/react-sdk";
import React, { useEffect } from "react";
import { useAccount } from "wagmi";

const contentTypeConfigs = [
  attachmentContentTypeConfig,
  reactionContentTypeConfig,
  replyContentTypeConfig,
];

const XMTPProvider = ({ children }: { children: React.ReactNode }) => {
  const { address } = useAccount();
  const { disconnect } = useClient();

  // disconnect XMTP client when the wallet changes
  useEffect(() => {
    void disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  return (
    <_XMTPProvider contentTypeConfigs={contentTypeConfigs}>
      {children}
    </_XMTPProvider>
  );
};

export default XMTPProvider;
