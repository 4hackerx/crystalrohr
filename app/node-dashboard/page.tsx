"use client";

import { XMTPConnect } from "@/components/molecules/xmtp-connect";
import { useNodeService } from "@/hooks/use-node-service";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";

type NodeDetails = {
  nodeId: bigint;
  stake: bigint;
  isActive: boolean;
  isTrusted: boolean;
  totalJobsCompleted: bigint;
  reputation: bigint;
};

const Dashboard = () => {
  const [stakeAmount, setStakeAmount] = useState("");
  const [nodeDetails, setNodeDetails] = useState<NodeDetails | null>({
    nodeId: BigInt(0),
    stake: BigInt(1000),
    isActive: true,
    isTrusted: false,
    totalJobsCompleted: BigInt(5),
    reputation: BigInt(100),
  });
  const [nodeJobs, setNodeJobs] = useState<bigint[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { address } = useAccount();
  const {
    registerNode,
    deactivateNode,
    getNodeJobs,
    getNodeDetails,
    submitJobResult,
    distributeRewards,
    withdrawRewards,
    nodeId,
    setNodeId,
  } = useNodeService();

  useEffect(() => {
    const fetchNodeDetails = async () => {
      if (address) {
        try {
          setIsLoading(true);
          const details = await getNodeDetails(address);

          if (details) {
            setNodeDetails(details);
            if (details.nodeId) {
              setNodeId(details.nodeId);
              const jobs = await getNodeJobs(details.nodeId);
              setNodeJobs(jobs || []);
            }
          }
        } catch (error) {
          console.error("Error fetching node details:", error);
          toast.error("Failed to fetch node details. Please try again.");
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchNodeDetails();
  }, [address, getNodeDetails, getNodeJobs, setNodeId]);

  const handleAction = async (
    action: () => Promise<void>,
    successMessage: string
  ) => {
    try {
      setIsLoading(true);
      await action();
      toast.success(successMessage);
    } catch (error) {
      console.error(`Error: ${successMessage}`, error);
      toast.error(
        `Failed to ${successMessage.toLowerCase()}. Please try again.`
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
          prev ? { ...prev, stake: BigInt(stakeAmount), isActive: true } : null
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
        "Successfully stopped contributing."
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
      <XMTPConnect />
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
        )
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
          </>
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
                  "Successfully distributed rewards!"
                )
              }
              disabled={isLoading}
              className="bg-[#550EFB] hover:bg-[#360C99] text-white rounded px-4 py-2"
            >
              Distribute Rewards
            </button>
          </div>
        )}

      {nodeDetails?.isActive &&
        nodeDetails.isActive &&
        renderSection(
          "Current Jobs",
          nodeJobs.length > 0 ? (
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
          )
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
        </div>
      )}
    </div>
  );
};

export default Dashboard;
