"use client";

import Canvas from "@/components/molecules/canvas";
import { XMTPConnect } from "@/components/molecules/xmtp-connect";
import useCaptureStills from "@/hooks/use-capture-stills";
import useJobNotifier from "@/hooks/use-job-notifier";
import { useNodeBroadcast } from "@/hooks/use-node-broadcast";
import { useNodeService } from "@/hooks/use-node-service";
import { useVisionFunctions } from "@/hooks/use-vision-functions";
import { config, galadriel } from "@/providers/wagmi/config";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Address } from "viem";
import { switchChain } from "@wagmi/core";

type NodeDetails = {
  address: Address;
  stake: bigint;
  isActive: boolean;
  isTrusted: boolean;
  totalJobsCompleted: bigint;
  reputation: bigint;
};

const Dashboard = () => {
  const [stakeAmount, setStakeAmount] = useState("");
  const [nodeDetails, setNodeDetails] = useState<NodeDetails | null>({
    address: "0x",
    stake: BigInt(1000),
    isActive: true,
    isTrusted: false,
    totalJobsCompleted: BigInt(5),
    reputation: BigInt(100),
  });

  const [nodeJobs, setNodeJobs] = useState<bigint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  const [startChatExecuted, setStartChatExecuted] = useState(false);

  const {
    registerNode,
    deactivateNode,
    getNodeJobs,
    getNodeDetails,
    submitJobResult,
    getNodeIdFromAddress,
    distributeRewards,
    withdrawRewards,
    nodeId,
    setNodeId,
  } = useNodeService();
  const {
    canvasRef,
    captureSliced,
    sceneRef,
    videoRef,
    slicedRef,
    stopPolling,
    startPolling,
    stopUploadPolling,
    startUploadPolling,
    capturedImages,
    capturedScenes,
    processStatus,
    lastEvent,
  } = useCaptureStills();

  const { startChat, chatId } = useVisionFunctions();

  const {
    broadcast,
    isLoading: isBroadcasting,
    error: broadcastError,
  } = useNodeBroadcast();

  const notifier = useJobNotifier(
    "0xB754369b3a7C430d7E94c14f33c097C398a0caa5",
    "15",
  );

  const sendToCLient = {
    jobId: "15",
    chatId: chatId,
    capturedScenes: capturedScenes,
    processStatus: processStatus,
  };

  const handleBroadcast = () => {
    broadcast(
      "0xB754369b3a7C430d7E94c14f33c097C398a0caa5",
      "CoQBMHhlOTJjYjhiMzIzN2RiZWQyODk2NmVhNGZmZDYyNGJjNDEzN2UyYTI2ZDUyOWFjZDNkNjVmZDllM2YxMjc5OTQ4MzA3MGUzMTU2MTY3MWU4ZWM2ZmYwNjE1YTE0MWY4ZTA4MTdiZWE3YjljYWYxODQ1NmIyYjBlMDI3ZWJlMTJmNTFjEO+E/JOdMhgB",
      JSON.stringify(sendToCLient),
    );
  };

  useEffect(() => {
    (async () => {
      if (lastEvent === "all_complete" && !startChatExecuted) {
        await switchChain(config, { chainId: galadriel.id });
        startChat(capturedImages);
        setStartChatExecuted(true);
      }
    })();

    handleBroadcast();
  }, [
    lastEvent,
    processStatus,
    startChatExecuted,
    switchChain,
    startChat,
    capturedImages,
  ]);

  useEffect(() => {
    const fetchNodeDetails = async () => {
      try {
        setIsLoading(true);
        const nodeId = await getNodeIdFromAddress();

        if (!nodeId) return;
        setNodeId(nodeId);
        const jobs = await getNodeJobs(nodeId);
        setNodeJobs(jobs || []);
        const details = await getNodeDetails();

        if (!details) return;
        setNodeDetails(details);
      } catch (error) {
        toast.error("Failed to fetch node details. Please try again.");
        console.error("Error fetching node details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNodeDetails();
  }, []);

  const handleAction = async (
    action: () => Promise<void>,
    successMessage: string,
  ) => {
    try {
      setIsLoading(true);
      await action();
      toast.success(successMessage);
    } catch (error) {
      console.error(`Error: ${successMessage}`, error);
      toast.error(
        `Failed to ${successMessage.toLowerCase()}. Please try again.`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleStake = () => {
    if (
      stakeAmount &&
      !isNaN(parseFloat(stakeAmount)) &&
      parseFloat(stakeAmount) > 0
    ) {
      handleAction(async () => {
        await registerNode();
        setNodeDetails((prev) =>
          prev ? { ...prev, stake: BigInt(stakeAmount), isActive: true } : null,
        );
        setStakeAmount("");
      }, "Successfully staked tokens!");
    } else {
      toast.error("Please enter a valid stake amount.");
    }
  };

  const toggleContribution = () => {
    if (nodeDetails?.isActive && nodeId) {
      handleAction(
        () => deactivateNode(nodeId),
        "Successfully stopped contributing.",
      );
    } else {
      toast.error("Activation not implemented yet.");
    }
  };

  const renderSection = (title: string, content: React.ReactNode) => (
    <div className="bg-gradient-to-r from-[#550EFB] to-[#360C99] border border-[#360C99] rounded-lg p-6 mb-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-white">{title}</h2>
      {content}
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <Canvas {...{ canvasRef }} />

      <h1 className="text-4xl font-bold mb-12 text-center">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#550EFB] to-[#360C99]">
          Node Dashboard
        </span>
      </h1>

      {renderSection(
        "Stake Your Tokens",
        !nodeDetails?.isActive ? (
          <>
            <p className="mb-4">
              Contribute by staking your tokens and earn rewards.
            </p>
            <div className="flex items-center space-x-4">
              <input
                type="number"
                placeholder="Amount to stake"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                className="bg-black text-white border border-[#360C99] rounded p-2 flex-grow"
              />
              <button
                onClick={handleStake}
                disabled={isLoading}
                className="bg-[#550EFB] hover:bg-[#360C99] text-white rounded px-4 py-2"
              >
                Stake
              </button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <p className="text-xl mb-2">Amount Staked:</p>
            <p className="text-3xl font-bold text-white">
              {nodeDetails.stake.toString()} Rohr
            </p>
          </div>
        ),
      )}

      {nodeDetails?.isActive &&
        renderSection(
          "Contribute Resources",
          <>
            <p className="mb-4">
              Start or stop contributing your resources to the network.
            </p>
            <button
              onClick={toggleContribution}
              disabled={isLoading}
              className={`${
                nodeDetails.isActive ? "bg-[#1c074d]" : "bg-[#240a61]"
              } hover:bg-[#360C99] text-white rounded px-4 py-2 flex items-center`}
            >
              {nodeDetails.isActive
                ? "Stop Contributing"
                : "Start Contributing"}
            </button>
          </>,
        )}

      {nodeDetails?.isActive &&
        renderSection(
          "Rewards",
          <div className="flex space-x-4">
            <button
              onClick={() =>
                handleAction(withdrawRewards, "Successfully withdrew rewards!")
              }
              disabled={isLoading}
              className="bg-[#550EFB] hover:bg-[#360C99] text-white rounded px-4 py-2"
            >
              Withdraw Rewards
            </button>
            <button
              onClick={() =>
                nodeId &&
                handleAction(
                  () => distributeRewards(nodeId),
                  "Successfully distributed rewards!",
                )
              }
              disabled={isLoading}
              className="bg-[#550EFB] hover:bg-[#360C99] text-white rounded px-4 py-2"
            >
              Distribute Rewards
            </button>
          </div>,
        )}

      {nodeDetails?.isActive &&
        nodeDetails.isActive &&
        renderSection(
          "Current Jobs",
          <div>
            <div className="mb-4">
              <button
                onClick={() => setIsVideoVisible(!isVideoVisible)}
                className="bg-[#550EFB] hover:bg-[#360C99] text-white rounded px-4 py-2"
              >
                {isVideoVisible ? "Hide Video Player" : "Show Video Player"}
              </button>
            </div>
            {notifier.latestMessage?.url && (
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isVideoVisible ? "max-h-[500px]" : "max-h-0"
                }`}
              >
                <div className="overflow-y-auto" style={{ maxHeight: "500px" }}>
                  <video
                    crossOrigin="anonymous"
                    ref={videoRef}
                    controls
                    preload="metadata"
                    width="560px"
                    height="315px"
                  >
                    <source src={notifier.latestMessage.url} type="video/mp4" />
                  </video>

                  <div className="mt-4 space-x-2">
                    <button
                      onClick={() => captureSliced()}
                      className="bg-[#550EFB] hover:bg-[#360C99] text-white rounded px-4 py-2"
                    >
                      Capture Image
                    </button>
                    <button
                      onClick={() => stopPolling()}
                      className="bg-[#550EFB] hover:bg-[#360C99] text-white rounded px-4 py-2"
                    >
                      Stop polling
                    </button>
                    <button
                      onClick={() => startPolling()}
                      className="bg-[#550EFB] hover:bg-[#360C99] text-white rounded px-4 py-2"
                    >
                      Start polling
                    </button>
                  </div>

                  <div
                    ref={slicedRef}
                    style={{ display: "flex", flexWrap: "wrap" }}
                  ></div>
                  <div
                    ref={sceneRef}
                    style={{ display: "flex", flexWrap: "wrap" }}
                  ></div>
                </div>
              </div>
            )}
            {/* {nodeJobs.length > 0 ? (
    <ul>
    {nodeJobs.map((jobId, index) => (
    <li key={index} className="mb-4">
    <p>Job ID: {jobId.toString()}</p>
<button
onClick={() =>
    handleAction(
    () => submitJobResult(jobId, "Result"),
    "Successfully submitted job result!"
)

}
disabled={isLoading}
className="bg-[#550EFB] hover:bg-[#360C99] text-white rounded px-4 py-2"
>
Submit Result
</button>
</li>
))}
</ul>
) : (
    <p>No current jobs.</p>

)} */}
          </div>,
        )}

      {renderSection(
        "Why Stake?",
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: "🔒",
              title: "Secure the Network",
              description:
                "Help maintain the integrity and security of the blockchain network.",
            },
            {
              icon: "📈",
              title: "Earn Rewards",
              description:
                "Receive staking rewards for your contribution to the network.",
            },
            {
              icon: "🛡️",
              title: "Governance Rights",
              description:
                "Participate in network governance and decision-making processes.",
            },
          ].map(({ icon, title, description }) => (
            <div key={title} className="flex flex-col items-center text-center">
              <div className="text-[#550EFB] text-4xl mb-4">{icon}</div>
              <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
              <p>{description}</p>
            </div>
          ))}
        </div>,
      )}

      <XMTPConnect />
    </div>
  );
};

export default Dashboard;

// "use client";

// import { Input } from "@/components/atoms/input";
// import Canvas from "@/components/molecules/canvas";
// import { XMTPConnect } from "@/components/molecules/xmtp-connect";
// import useCaptureStills from "@/hooks/use-capture-stills";
// import useJobNotifier from "@/hooks/use-job-notifier";
// import { useNodeBroadcast } from "@/hooks/use-node-broadcast";
// import { useNodeService } from "@/hooks/use-node-service";
// import { useVisionFunctions } from "@/hooks/use-vision-functions";
// import { galadriel } from "@/providers/wagmi/config";
// import { useEffect, useState } from "react";
// import { toast } from "sonner";
// import { Address } from "viem";
// import { useSwitchChain } from "wagmi";

// type NodeDetails = {
//   address: Address;
//   stake: bigint;
//   isActive: boolean;
//   isTrusted: boolean;
//   totalJobsCompleted: bigint;
//   reputation: bigint;
// };

// const Dashboard = () => {
//   const { switchChain } = useSwitchChain();

//   const [stakeAmount, setStakeAmount] = useState("");
//   const [nodeDetails, setNodeDetails] = useState<NodeDetails | null>({
//     address: "0x",
//     stake: BigInt(0),
//     isActive: false,
//     isTrusted: false,
//     totalJobsCompleted: BigInt(0),
//     reputation: BigInt(0),
//   });
//   const [nodeJobs, setNodeJobs] = useState<bigint[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isVideoVisible, setIsVideoVisible] = useState(false);
//   const [startChatExecuted, setStartChatExecuted] = useState(false);
//   const [consenter, setConsenter] = useState("");
//   const [pastedConsentProof, setPastedConsentProof] = useState("");

//   const {
//     registerNode,
//     deactivateNode,
//     getNodeJobs,
//     getNodeDetails,
//     submitJobResult,
//     getNodeIdFromAddress,
//     distributeRewards,
//     withdrawRewards,
//     nodeId,
//     setNodeId,
//   } = useNodeService();
//   const {
//     canvasRef,
//     captureSliced,
//     sceneRef,
//     videoRef,
//     slicedRef,
//     stopPolling,
//     startPolling,
//     stopUploadPolling,
//     startUploadPolling,
//     capturedImages,
//     capturedScenes,
//     processStatus,
//     lastEvent,
//   } = useCaptureStills();

//   const { startChat, chatId } = useVisionFunctions();

//   const {
//     broadcast,
//     isLoading: isBroadcasting,
//     error: broadcastError,
//   } = useNodeBroadcast();

//   const notifier = useJobNotifier(consenter, "6");

//   const sendToCLient = {
//     jobId: "6",
//     chatId: chatId,
//     capturedScenes: capturedScenes,
//     processStatus: processStatus,
//   };

//   const handleBroadcast = () => {
//     try {
//       broadcast(consenter, pastedConsentProof, JSON.stringify(sendToCLient));
//     } catch (error) {
//       toast.error(`Failed to broadcast: ${error}`);
//     }
//   };

//   useEffect(() => {
//     if (lastEvent === "all_complete" && !startChatExecuted) {
//       try {
//         switchChain({ chainId: galadriel.id });
//         startChat(capturedImages);
//         setStartChatExecuted(true);
//       } catch (error) {
//         toast.error(`Failed to start chat: ${error}`);
//       }
//     }

//     if (consenter && pastedConsentProof) {
//       handleBroadcast();
//     }
//   }, [
//     lastEvent,
//     processStatus,
//     startChatExecuted,
//     switchChain,
//     startChat,
//     capturedImages,
//     pastedConsentProof,
//     consenter,
//   ]);

//   useEffect(() => {
//     const fetchNodeDetails = async () => {
//       try {
//         alert("calling");
//         setIsLoading(true);
//         const nodeId = await getNodeIdFromAddress();

//         if (!nodeId) return;
//         setNodeId(nodeId);
//         const jobs = await getNodeJobs(nodeId);
//         setNodeJobs(jobs || []);
//         const details = await getNodeDetails();

//         if (!details) return;
//         setNodeDetails(details);
//       } catch (error) {
//         toast.error("Failed to fetch node details. Please try again.");
//         console.error("Error fetching node details:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchNodeDetails();
//   }, []);

//   const handleAction = async (
//     action: () => Promise<void>,
//     successMessage: string
//   ) => {
//     try {
//       setIsLoading(true);
//       await action();
//       toast.success(successMessage);
//     } catch (error) {
//       console.error(`Error: `, error);
//       toast.error(
//         `Failed to ${successMessage.toLowerCase()}. Please try again.`
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleStake = () => {
//     if (
//       stakeAmount &&
//       !isNaN(parseFloat(stakeAmount)) &&
//       parseFloat(stakeAmount) > 0
//     ) {
//       try {
//         handleAction(async () => {
//           await registerNode();
//           setNodeDetails((prev) =>
//             prev
//               ? { ...prev, stake: BigInt(stakeAmount), isActive: true }
//               : null
//           );
//           setStakeAmount("");
//         }, "Successfully staked tokens!");
//       } catch (error) {
//         toast.error(`Failed to stake tokens: ${error}`);
//       }
//     } else {
//       toast.error("Please enter a valid stake amount.");
//     }
//   };

//   const toggleContribution = () => {
//     if (nodeDetails?.isActive && nodeId) {
//       try {
//         handleAction(
//           () => deactivateNode(nodeId),
//           "Successfully stopped contributing."
//         );
//       } catch (error) {
//         toast.error(`Failed to stop contributing: ${error}`);
//       }
//     } else {
//       toast.error("Activation not implemented yet.");
//     }
//   };

//   const renderSection = (title: string, content: React.ReactNode) => (
//     <div className="bg-gradient-to-r from-[#550EFB] to-[#360C99] border border-[#360C99] rounded-lg p-6 mb-8 max-w-2xl mx-auto">
//       <h2 className="text-2xl font-bold mb-4 text-white">{title}</h2>
//       {content}
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-black text-white p-8">
//       <Canvas {...{ canvasRef }} />

//       <h1 className="text-4xl font-bold mb-12 text-center">
//         <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#550EFB] to-[#360C99]">
//           Node Dashboard
//         </span>
//       </h1>

//       {renderSection(
//         "Stake Your Tokens",
//         !nodeDetails?.isActive ? (
//           <>
//             <p className="mb-4">
//               Contribute by staking your tokens and earn rewards.
//             </p>
//             <div className="flex items-center space-x-4">
//               <input
//                 type="number"
//                 placeholder="Amount to stake"
//                 value={stakeAmount}
//                 onChange={(e) => setStakeAmount(e.target.value)}
//                 className="bg-black text-white border border-[#360C99] rounded p-2 flex-grow"
//               />
//               <button
//                 onClick={handleStake}
//                 disabled={isLoading}
//                 className="bg-[#550EFB] hover:bg-[#360C99] text-white rounded px-4 py-2"
//               >
//                 Stake
//               </button>
//             </div>
//           </>
//         ) : (
//           <div className="text-center">
//             <p className="text-xl mb-2">Amount Staked:</p>
//             <p className="text-3xl font-bold text-white">
//               {nodeDetails.stake.toString()} Rohr
//             </p>
//           </div>
//         )
//       )}

//       {nodeDetails?.isActive &&
//         renderSection(
//           "Contribute Resources",
//           <>
//             <p className="mb-4">
//               Start or stop contributing your resources to the network.
//             </p>
//             <button
//               onClick={toggleContribution}
//               disabled={isLoading}
//               className={`${
//                 nodeDetails.isActive ? "bg-[#1c074d]" : "bg-[#240a61]"
//               } hover:bg-[#360C99] text-white rounded px-4 py-2 flex items-center`}
//             >
//               {nodeDetails.isActive
//                 ? "Stop Contributing"
//                 : "Start Contributing"}
//             </button>
//           </>
//         )}

//       {nodeDetails?.isActive &&
//         renderSection(
//           "Rewards",
//           <div className="flex space-x-4">
//             <button
//               onClick={() => {
//                 try {
//                   handleAction(
//                     withdrawRewards,
//                     "Successfully withdrew rewards!"
//                   );
//                 } catch (error) {
//                   toast.error(`Failed to withdraw rewards: ${error}`);
//                 }
//               }}
//               disabled={isLoading}
//               className="bg-[#550EFB] hover:bg-[#360C99] text-white rounded px-4 py-2"
//             >
//               Withdraw Rewards
//             </button>
//             <button
//               onClick={() => {
//                 if (nodeId) {
//                   try {
//                     handleAction(
//                       () => distributeRewards(nodeId),
//                       "Successfully distributed rewards!"
//                     );
//                   } catch (error) {
//                     toast.error(`Failed to distribute rewards: ${error}`);
//                   }
//                 }
//               }}
//               disabled={isLoading}
//               className="bg-[#550EFB] hover:bg-[#360C99] text-white rounded px-4 py-2"
//             >
//               Distribute Rewards
//             </button>
//           </div>
//         )}

//       {nodeDetails?.isActive &&
//         nodeDetails.isActive &&
//         renderSection(
//           "Current Jobs",
//           <div>
//             <div className="mb-4">
//               <button
//                 onClick={() => setIsVideoVisible(!isVideoVisible)}
//                 className="bg-[#550EFB] hover:bg-[#360C99] text-white rounded px-4 py-2"
//               >
//                 {isVideoVisible ? "Hide Video Player" : "Show Video Player"}
//               </button>
//             </div>
//             {notifier.latestMessage?.url && (
//               <div
//                 className={`overflow-hidden transition-all duration-300 ease-in-out ${
//                   isVideoVisible ? "max-h-[500px]" : "max-h-0"
//                 }`}
//               >
//                 <div className="overflow-y-auto" style={{ maxHeight: "500px" }}>
//                   <video
//                     crossOrigin="anonymous"
//                     ref={videoRef}
//                     controls
//                     preload="metadata"
//                     width="560px"
//                     height="315px"
//                   >
//                     <source src={notifier.latestMessage.url} type="video/mp4" />
//                   </video>

//                   <div className="mt-4 space-x-2">
//                     <button
//                       onClick={() => {
//                         try {
//                           captureSliced();
//                         } catch (error) {
//                           toast.error(`Failed to capture image: ${error}`);
//                         }
//                       }}
//                       className="bg-[#550EFB] hover:bg-[#360C99] text-white rounded px-4 py-2"
//                     >
//                       Capture Image
//                     </button>
//                     <button
//                       onClick={() => {
//                         try {
//                           stopPolling();
//                         } catch (error) {
//                           toast.error(`Failed to stop polling: ${error}`);
//                         }
//                       }}
//                       className="bg-[#550EFB] hover:bg-[#360C99] text-white rounded px-4 py-2"
//                     >
//                       Stop polling
//                     </button>
//                     <button
//                       onClick={() => {
//                         try {
//                           startPolling();
//                         } catch (error) {
//                           toast.error(`Failed to start polling: ${error}`);
//                         }
//                       }}
//                       className="bg-[#550EFB] hover:bg-[#360C99] text-white rounded px-4 py-2"
//                     >
//                       Start polling
//                     </button>
//                   </div>

//                   <div
//                     ref={slicedRef}
//                     style={{ display: "flex", flexWrap: "wrap" }}
//                   ></div>
//                   <div
//                     ref={sceneRef}
//                     style={{ display: "flex", flexWrap: "wrap" }}
//                   ></div>
//                 </div>

//                 <div>
//                   <div>
//                     <label
//                       htmlFor="pastedConsentProof"
//                       className="block text-sm font-medium text-gray-700 mb-1"
//                     >
//                       Paste Consent Proof (for testing)
//                     </label>
//                     <Input
//                       id="pastedConsentProof"
//                       value={pastedConsentProof}
//                       onChange={(e) => setPastedConsentProof(e.target.value)}
//                       placeholder="Paste consent proof here"
//                     />
//                   </div>
//                   <div>
//                     <label
//                       htmlFor="consenter"
//                       className="block text-sm font-medium text-gray-700 mb-1"
//                     >
//                       Consenter
//                     </label>
//                     <Input
//                       id="consenter"
//                       value={consenter}
//                       onChange={(e) => setConsenter(e.target.value)}
//                       placeholder="Enter consenter address"
//                     />
//                   </div>
//                 </div>
//               </div>
//             )}
//             {/* {nodeJobs.length > 0 ? (
//     <ul>
//     {nodeJobs.map((jobId, index) => (
//     <li key={index} className="mb-4">
//     <p>Job ID: {jobId.toString()}</p>
// <button
// onClick={() =>
//     handleAction(
//     () => submitJobResult(jobId, "Result"),
//     "Successfully submitted job result!"
// )

// }
// disabled={isLoading}
// className="bg-[#550EFB] hover:bg-[#360C99] text-white rounded px-4 py-2"
// >
// Submit Result
// </button>
// </li>
// ))}
// </ul>
// ) : (
//     <p>No current jobs.</p>

// )} */}
//           </div>
//         )}

//       {renderSection(
//         "Why Stake?",
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           {[
//             {
//               icon: "🔒",
//               title: "Secure the Network",
//               description:
//                 "Help maintain the integrity and security of the blockchain network.",
//             },
//             {
//               icon: "📈",
//               title: "Earn Rewards",
//               description:
//                 "Receive staking rewards for your contribution to the network.",
//             },
//             {
//               icon: "🛡️",
//               title: "Governance Rights",
//               description:
//                 "Participate in network governance and decision-making processes.",
//             },
//           ].map(({ icon, title, description }) => (
//             <div key={title} className="flex flex-col items-center text-center">
//               <div className="text-[#550EFB] text-4xl mb-4">{icon}</div>
//               <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
//               <p>{description}</p>
//             </div>
//           ))}
//         </div>
//       )}

//       <XMTPConnect />
//     </div>
//   );
// };

// export default Dashboard;
