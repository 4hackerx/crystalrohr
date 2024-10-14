"use client";

import { useClient } from "@xmtp/react-sdk";
import { useEffect, useRef, useState } from "react";

import { Alert, AlertDescription } from "@/components/atoms/alert";
import { Button } from "@/components/atoms/button";
import { Input } from "@/components/atoms/input";
import { XMTPConnect } from "@/components/molecules/xmtp-connect";
import { Inbox } from "@/components/molecules/xmtp-inbox";
import useFileUpload from "@/hooks/use-file-upload";
import useJobNotifier from "@/hooks/use-job-notifier";
import { useNodeBroadcast } from "@/hooks/use-node-broadcast";
import { useUserSubscribe } from "@/hooks/use-user-subscribe";

export default function Home() {
  const { file, url, uploading, uploadFile, handleChange } = useFileUpload();
  const inputFile = useRef<HTMLInputElement>(null);
  const { client } = useClient();

  const [jobId, setJobId] = useState("job123");
  const [nodeAddress, setNodeAddress] = useState("");
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");
  const [consentProof, setConsentProof] = useState("");
  const [pastedConsentProof, setPastedConsentProof] = useState("");

  const notifier = useJobNotifier(
    "0xe219E1106b441c9A8D5E12364e07EEE6e896e199",
    jobId
  );

  useEffect(() => {
    setTimeout(() => {
      setJobId("job124");
    }, 20000);

    return () => {};
  }, [jobId]);

  const {
    subscribe,
    isLoading: isSubscribing,
    error: subscribeError,
  } = useUserSubscribe();
  const {
    broadcast,
    isLoading: isBroadcasting,
    error: broadcastError,
  } = useNodeBroadcast();

  const handleSubscribe = async () => {
    const result = await subscribe(nodeAddress);
    if (result) {
      setConsentProof(result);
    }
  };

  const handleBroadcast = () => {
    broadcast(recipient, pastedConsentProof || consentProof, message);
  };

  const copyConsentProof = () => {
    navigator.clipboard.writeText(consentProof);
    alert("Consent proof copied to clipboard!");
  };

  return (
    <main className="w-full min-h-screen m-auto flex flex-col justify-center items-center">
      <XMTPConnect />
      {client && <Inbox />}

      <input
        type="file"
        id="file"
        ref={inputFile}
        onChange={handleChange}
        className="mb-2"
      />
      <Button
        disabled={uploading}
        onClick={async (e) => await uploadFile()}
        className="mb-4"
      >
        {uploading ? "Uploading..." : "Upload"}
      </Button>
      {url && (
        <img src={url} alt="Image from Pinata" className="mb-4 max-w-xs" />
      )}

      <div className="p-4 max-w-md mx-auto space-y-4">
        <h2 className="text-2xl font-bold mb-4">Hook Test UI</h2>
        <div>
          <label
            htmlFor="nodeAddress"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Node Address
          </label>
          <Input
            id="nodeAddress"
            value={nodeAddress}
            onChange={(e) => setNodeAddress(e.target.value)}
            placeholder="Enter node address"
          />
        </div>
        <Button
          onClick={handleSubscribe}
          disabled={isSubscribing}
          className="w-full"
        >
          {isSubscribing ? "Subscribing..." : "Subscribe"}
        </Button>
        {subscribeError && (
          <Alert variant="destructive">
            <AlertDescription>{subscribeError}</AlertDescription>
          </Alert>
        )}
        {consentProof && (
          <div className="space-y-2">
            <Alert>
              <AlertDescription>
                Consent Proof: {consentProof.slice(0, 20)}...
              </AlertDescription>
            </Alert>
            <Button onClick={copyConsentProof} className="w-full">
              Copy Consent Proof
            </Button>
          </div>
        )}
        <div>
          <label
            htmlFor="pastedConsentProof"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Paste Consent Proof (for testing)
          </label>
          <Input
            id="pastedConsentProof"
            value={pastedConsentProof}
            onChange={(e) => setPastedConsentProof(e.target.value)}
            placeholder="Paste consent proof here"
          />
        </div>
        <div>
          <label
            htmlFor="recipient"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Recipient
          </label>
          <Input
            id="recipient"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Enter recipient address"
          />
        </div>
        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Message
          </label>
          <Input
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter message"
          />
        </div>
        <Button
          onClick={handleBroadcast}
          disabled={isBroadcasting || (!consentProof && !pastedConsentProof)}
          className="w-full"
        >
          {isBroadcasting ? "Broadcasting..." : "Broadcast"}
        </Button>
        {broadcastError && (
          <Alert variant="destructive">
            <AlertDescription>{broadcastError}</AlertDescription>
          </Alert>
        )}
      </div>

      <div>NOTIFIER: {JSON.stringify(notifier?.latestMessage)}</div>
    </main>
  );
}
