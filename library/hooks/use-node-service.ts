import { useCallback, useState } from "react";
import { Address, decodeEventLog } from "viem";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";

import { config } from "@/providers/wagmi/config";
import core from "@/types/contracts/core-protocol";

const CORE_ADDRESS = core.address as Address;
const CORE_ABI = core.abi;

export function useNodeService() {
  const { address } = useAccount();
  const [nodeId, setNodeId] = useState<bigint | null>(null);

  const { writeContract: writeRegisterNode } = useWriteContract();
  const { writeContract: writeDeactivateNode } = useWriteContract();
  const { writeContract: writeSubmitJobResult } = useWriteContract();
  const { writeContract: writeDistributeRewards } = useWriteContract();
  const { writeContract: writeWithdrawRewards } = useWriteContract();

  const { data: nodeJobs, refetch: refetchNodeJobs } = useReadContract({
    address: CORE_ADDRESS,
    abi: CORE_ABI,
    functionName: "getNodeJobs",
    args: [nodeId!],
    query: {
      enabled: !!nodeId,
    },
  });

  const { data: nodeDetails, refetch: refetchNodeDetails } = useReadContract({
    address: CORE_ADDRESS,
    abi: CORE_ABI,
    functionName: "getNodeDetails",
    args: [address!],
    query: {
      enabled: !!address,
    },
  });

  const registerNode = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      writeRegisterNode(
        {
          address: CORE_ADDRESS,
          abi: CORE_ABI,
          functionName: "registerNode",
        },
        {
          onSuccess: async (hash) => {
            try {
              const receipt = await waitForTransactionReceipt(config, {
                hash,
              });
              if (receipt.status !== "success") {
                throw new Error("Register node failed");
              }

              const nodeRegisteredEvent = receipt.logs.find((log) => {
                try {
                  const event = decodeEventLog({
                    abi: CORE_ABI,
                    data: log.data,
                    topics: log.topics,
                  });
                  return event.eventName === "NodeRegistered";
                } catch {
                  return false;
                }
              });

              if (nodeRegisteredEvent) {
                const decodedEvent = decodeEventLog({
                  abi: CORE_ABI,
                  data: nodeRegisteredEvent.data,
                  topics: nodeRegisteredEvent.topics,
                });

                if (
                  decodedEvent.eventName === "NodeRegistered" &&
                  "args" in decodedEvent &&
                  decodedEvent.args.nodeId
                ) {
                  const newNodeId = BigInt(decodedEvent.args.nodeId);
                  setNodeId(newNodeId);
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
  }, [writeRegisterNode]);

  const deactivateNode = useCallback(
    (nodeId: bigint): Promise<void> => {
      return new Promise((resolve, reject) => {
        writeDeactivateNode(
          {
            address: CORE_ADDRESS,
            abi: CORE_ABI,
            functionName: "deactivateNode",
            args: [nodeId],
          },
          {
            onSuccess: async (hash) => {
              try {
                const receipt = await waitForTransactionReceipt(config, {
                  hash,
                });
                if (receipt.status !== "success") {
                  throw new Error("Deactivate node failed");
                }
                setNodeId(null);
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
    [writeDeactivateNode]
  );

  const submitJobResult = useCallback(
    (jobId: bigint, resultIpfsHash: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        writeSubmitJobResult(
          {
            address: CORE_ADDRESS,
            abi: CORE_ABI,
            functionName: "submitJobResult",
            args: [jobId, resultIpfsHash],
          },
          {
            onSuccess: async (hash) => {
              try {
                const receipt = await waitForTransactionReceipt(config, {
                  hash,
                });
                if (receipt.status !== "success") {
                  throw new Error("Submit job result failed");
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
    [writeSubmitJobResult]
  );

  const distributeRewards = useCallback(
    (jobId: bigint): Promise<void> => {
      return new Promise((resolve, reject) => {
        writeDistributeRewards(
          {
            address: CORE_ADDRESS,
            abi: CORE_ABI,
            functionName: "distributeRewards",
            args: [jobId],
          },
          {
            onSuccess: async (hash) => {
              try {
                const receipt = await waitForTransactionReceipt(config, {
                  hash,
                });
                if (receipt.status !== "success") {
                  throw new Error("Distribute rewards failed");
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
    [writeDistributeRewards]
  );

  const withdrawRewards = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      writeWithdrawRewards(
        {
          address: CORE_ADDRESS,
          abi: CORE_ABI,
          functionName: "withdrawRewards",
        },
        {
          onSuccess: async (hash) => {
            try {
              const receipt = await waitForTransactionReceipt(config, {
                hash,
              });
              if (receipt.status !== "success") {
                throw new Error("Withdraw rewards failed");
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
  }, [writeWithdrawRewards]);

  const getNodeJobs = useCallback(
    async (id: bigint): Promise<bigint[]> => {
      setNodeId(id);
      await refetchNodeJobs();
      return (nodeJobs || []) as bigint[];
    },
    [refetchNodeJobs, nodeJobs]
  );

  const getNodeDetails = useCallback(
    async (
      nodeAddress: Address
    ): Promise<{
      nodeId: bigint;
      stake: bigint;
      isActive: boolean;
      isTrusted: boolean;
      totalJobsCompleted: bigint;
      reputation: bigint;
    } | null> => {
      await refetchNodeDetails();
      if (nodeDetails) {
        return {
          nodeId: nodeDetails[0],
          stake: nodeDetails[1],
          isActive: nodeDetails[2],
          isTrusted: nodeDetails[3],
          totalJobsCompleted: nodeDetails[4],
          reputation: nodeDetails[5],
        };
      }
      return null;
    },
    [refetchNodeDetails, nodeDetails]
  );

  return {
    registerNode,
    deactivateNode,
    getNodeJobs,
    getNodeDetails,
    submitJobResult,
    distributeRewards,
    withdrawRewards,
    nodeId,
    setNodeId,
  };
}
