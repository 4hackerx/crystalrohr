import { useCallback, useState } from "react";
import { Address, decodeEventLog } from "viem";
import {
  useAccount,
  useReadContract,
  useWatchContractEvent,
  useWriteContract,
} from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";

import { config } from "@/providers/wagmi/config";
import core from "@/types/contracts/core-protocol";

const CORE_ADDRESS = core.address as Address;
const CORE_ABI = core.abi;

export function useNodeService() {
  const { address } = useAccount();
  const [nodeId, setNodeId] = useState<bigint | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<bigint | null>(null);
  const [newJobAssignments, setNewJobAssignments] = useState<bigint[]>([]);

  const { writeContract: writeRegisterNode } = useWriteContract();
  const { writeContract: writeDeactivateNode } = useWriteContract();
  const { writeContract: writeSubmitJobResult } = useWriteContract();
  const { writeContract: writeDistributeRewards } = useWriteContract();
  const { writeContract: writeWithdrawRewards } = useWriteContract();

  const { refetch: refetchNodeJobs } = useReadContract({
    address: CORE_ADDRESS,
    abi: CORE_ABI,
    functionName: "getNodeJobs",
    args: [nodeId!],
    query: {
      enabled: !!nodeId,
    },
  });

  const { refetch: refetchNodeDetails } = useReadContract({
    address: CORE_ADDRESS,
    abi: CORE_ABI,
    functionName: "getNodeDetails",
    args: [nodeId!],
    query: {
      enabled: !!nodeId,
    },
  });

  const { refetch: refetchJobDetails } = useReadContract({
    address: CORE_ADDRESS,
    abi: CORE_ABI,
    functionName: "getJobDetails",
    args: [selectedJobId!],
    query: {
      enabled: !!selectedJobId,
    },
  });

  const { refetch: refetchNodeIdFromAddress } = useReadContract({
    address: CORE_ADDRESS,
    abi: CORE_ABI,
    functionName: "nodesThroughAddress",
    args: [address!],
    query: {
      enabled: !!address,
    },
  });

  useWatchContractEvent({
    address: CORE_ADDRESS,
    abi: CORE_ABI,
    eventName: "NodeSelected",
    onLogs(logs) {
      logs.forEach((log) => {
        const { jobId, nodeId: assignedNodeId } = log.args;
        if (jobId && assignedNodeId) {
          handleNewJobAssignment(jobId, assignedNodeId);
        }
      });
    },
  });

  const handleNewJobAssignment = useCallback(
    (jobId: bigint, assignedNodeId: bigint) => {
      if (assignedNodeId === nodeId) {
        setNewJobAssignments((prev) => [...prev, jobId]);
      }
    },
    [nodeId]
  );

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
      const result = await refetchNodeJobs();
      return (result.data || []) as bigint[];
    },
    [refetchNodeJobs]
  );

  const getNodeDetails = useCallback(async (): Promise<{
    address: Address;
    stake: bigint;
    isActive: boolean;
    isTrusted: boolean;
    totalJobsCompleted: bigint;
    reputation: bigint;
  } | null> => {
    const result = await refetchNodeDetails();
    if (result.data) {
      return {
        address: result.data[0],
        stake: result.data[1],
        isActive: result.data[2],
        isTrusted: result.data[3],
        totalJobsCompleted: result.data[4],
        reputation: result.data[5],
      };
    }
    return null;
  }, [refetchNodeDetails]);

  const getJobDetails = useCallback(
    async (jobId: bigint) => {
      setSelectedJobId(jobId);
      const result = await refetchJobDetails();
      if (result.data) {
        return {
          videoId: result.data.videoId,
          requester: result.data.requester,
          nodeId: result.data.nodeId,
          status: result.data.status,
          jobType: result.data.jobType,
          creationTime: result.data.creationTime,
          resultIpfsHash: result.data.resultIpfsHash,
          price: result.data.price,
        };
      }
      return null;
    },
    [refetchJobDetails]
  );

  const getNodeIdFromAddress = useCallback(async (): Promise<bigint | null> => {
    const result = await refetchNodeIdFromAddress();
    if (result.data) {
      return BigInt(result.data);
    }
    return null;
  }, [refetchNodeIdFromAddress]);

  return {
    registerNode,
    deactivateNode,
    getNodeJobs,
    getNodeDetails,
    getJobDetails,
    getNodeIdFromAddress,
    submitJobResult,
    distributeRewards,
    withdrawRewards,
    nodeId,
    setNodeId,
    newJobAssignments,
  };
}
