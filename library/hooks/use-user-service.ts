import { useCallback, useState } from "react";
import { Address, decodeEventLog } from "viem";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";

import { config } from "@/providers/wagmi/config";
import core from "@/types/contracts/core-protocol";

const CORE_ADDRESS = core.address as Address;
const CORE_ABI = core.abi;

export function useUserService() {
  const { address } = useAccount();
  const [videoId, setVideoId] = useState<bigint | null>(null);
  const [jobId, setJobId] = useState<bigint | null>(null);
  const [nodeId, setNodeId] = useState<bigint | null>(null);

  const { writeContract: writeUploadVideo } = useWriteContract();
  const { writeContract: writeCreateJob } = useWriteContract();
  const { writeContract: writeCancelJob } = useWriteContract();
  const { writeContract: writeCreateDispute } = useWriteContract();

  const { refetch: refetchVideoDetails } = useReadContract({
    address: CORE_ADDRESS,
    abi: CORE_ABI,
    functionName: "getVideoDetails",
    args: [videoId!],
    query: {
      enabled: !!videoId,
    },
  });

  const { refetch: refetchJobStatus } = useReadContract({
    address: CORE_ADDRESS,
    abi: CORE_ABI,
    functionName: "getJobStatus",
    args: [jobId!],
    query: {
      enabled: !!jobId,
    },
  });

  const { refetch: refetchJobDetails } = useReadContract({
    address: CORE_ADDRESS,
    abi: CORE_ABI,
    functionName: "getJobDetails",
    args: [jobId!],
    query: {
      enabled: !!jobId,
    },
  });

  const { refetch: refetchUserJobs } = useReadContract({
    address: CORE_ADDRESS,
    abi: CORE_ABI,
    functionName: "getUserJobs",
    args: [address!],
    query: {
      enabled: !!address,
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

  const uploadVideo = useCallback(
    (
      ipfsHash: string,
      duration: number,
      isEncrypted: boolean
    ): Promise<{ videoId: bigint }> => {
      return new Promise((resolve, reject) => {
        writeUploadVideo(
          {
            address: CORE_ADDRESS,
            abi: CORE_ABI,
            functionName: "uploadVideo",
            args: [ipfsHash, BigInt(duration), isEncrypted],
          },
          {
            onSuccess: async (hash) => {
              try {
                const receipt = await waitForTransactionReceipt(config, {
                  hash,
                });
                if (receipt.status !== "success") {
                  throw new Error("Upload video failed");
                }

                const videoUploadedEvent = receipt.logs.find((log) => {
                  try {
                    const event = decodeEventLog({
                      abi: CORE_ABI,
                      data: log.data,
                      topics: log.topics,
                    });
                    return event.eventName === "VideoUploaded";
                  } catch {
                    return false;
                  }
                });

                if (videoUploadedEvent) {
                  const decodedEvent = decodeEventLog({
                    abi: CORE_ABI,
                    data: videoUploadedEvent.data,
                    topics: videoUploadedEvent.topics,
                  });

                  if (
                    decodedEvent.eventName === "VideoUploaded" &&
                    "args" in decodedEvent &&
                    decodedEvent.args.videoId
                  ) {
                    const newVideoId = BigInt(decodedEvent.args.videoId);
                    setVideoId(newVideoId);
                    resolve({ videoId: newVideoId });
                  }
                }
              } catch (error) {
                reject(error);
              }
            },
            onError: reject,
          }
        );
      });
    },
    [writeUploadVideo]
  );

  const createJob = useCallback(
    (videoId: bigint, jobType: number): Promise<{ jobId: bigint }> => {
      return new Promise((resolve, reject) => {
        writeCreateJob(
          {
            address: CORE_ADDRESS,
            abi: CORE_ABI,
            functionName: "createJob",
            args: [videoId, jobType],
          },
          {
            onSuccess: async (hash) => {
              try {
                const receipt = await waitForTransactionReceipt(config, {
                  hash,
                });
                if (receipt.status !== "success") {
                  throw new Error("Create job failed");
                }

                const jobCreatedEvent = receipt.logs.find((log) => {
                  try {
                    const event = decodeEventLog({
                      abi: CORE_ABI,
                      data: log.data,
                      topics: log.topics,
                    });
                    return event.eventName === "JobCreated";
                  } catch {
                    return false;
                  }
                });

                if (jobCreatedEvent) {
                  const decodedEvent = decodeEventLog({
                    abi: CORE_ABI,
                    data: jobCreatedEvent.data,
                    topics: jobCreatedEvent.topics,
                  });

                  if (
                    decodedEvent.eventName === "JobCreated" &&
                    "args" in decodedEvent &&
                    decodedEvent.args.jobId
                  ) {
                    const newJobId = BigInt(decodedEvent.args.jobId);
                    setJobId(newJobId);
                    resolve({ jobId: newJobId });
                  }
                }
              } catch (error) {
                reject(error);
              }
            },
            onError: reject,
          }
        );
      });
    },
    [writeCreateJob]
  );

  const cancelJob = useCallback(
    (jobId: bigint): Promise<void> => {
      return new Promise((resolve, reject) => {
        writeCancelJob(
          {
            address: CORE_ADDRESS,
            abi: CORE_ABI,
            functionName: "cancelJob",
            args: [jobId],
          },
          {
            onSuccess: async (hash) => {
              try {
                const receipt = await waitForTransactionReceipt(config, {
                  hash,
                });
                if (receipt.status !== "success") {
                  throw new Error("Cancel job failed");
                }
                setJobId(null);
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
    [writeCancelJob]
  );

  const createDispute = useCallback(
    (jobId: bigint): Promise<void> => {
      return new Promise((resolve, reject) => {
        writeCreateDispute(
          {
            address: CORE_ADDRESS,
            abi: CORE_ABI,
            functionName: "createDispute",
            args: [jobId],
          },
          {
            onSuccess: async (hash) => {
              try {
                const receipt = await waitForTransactionReceipt(config, {
                  hash,
                });
                if (receipt.status !== "success") {
                  throw new Error("Create dispute failed");
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
    [writeCreateDispute]
  );

  const getVideoDetails = useCallback(
    async (
      id: bigint
    ): Promise<{
      ipfsHash: string;
      duration: number;
      uploader: string;
      isEncrypted: boolean;
    }> => {
      setVideoId(id);
      const result = await refetchVideoDetails();
      if (!result.data) throw new Error("No video details found");
      return {
        ipfsHash: result.data[0],
        duration: Number(result.data[1]),
        uploader: result.data[2],
        isEncrypted: result.data[3],
      };
    },
    [refetchVideoDetails]
  );

  const getJobStatus = useCallback(
    async (id: bigint): Promise<{ status: number }> => {
      setJobId(id);
      const result = await refetchJobStatus();
      if (!result.data) throw new Error("No job status found");
      return { status: Number(result.data) };
    },
    [refetchJobStatus]
  );

  const getJobDetails = useCallback(
    async (
      id: bigint
    ): Promise<{
      videoId: bigint;
      requester: string;
      nodeId: bigint;
      status: number;
      jobType: number;
      creationTime: number;
      resultIpfsHash: string;
      price: number;
    }> => {
      setJobId(id);
      const result = await refetchJobDetails();
      if (!result.data) throw new Error("No job details found");
      return {
        videoId: result.data.videoId,
        requester: result.data.requester,
        nodeId: result.data.nodeId,
        status: Number(result.data.status),
        jobType: Number(result.data.jobType),
        creationTime: Number(result.data.creationTime),
        resultIpfsHash: result.data.resultIpfsHash,
        price: Number(result.data.price),
      };
    },
    [refetchJobDetails]
  );

  const getUserJobs = useCallback(async (): Promise<number[]> => {
    const result = await refetchUserJobs();
    if (!result.data) throw new Error("No user jobs found");
    return result.data.map(Number);
  }, [refetchUserJobs]);

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

  return {
    uploadVideo,
    getVideoDetails,
    createJob,
    getJobStatus,
    setNodeId,
    getNodeDetails,
    cancelJob,
    getJobDetails,
    getUserJobs,
    createDispute,
    videoId,
    setVideoId,
    jobId,
    setJobId,
  };
}
