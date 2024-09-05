import { useCallback, useState } from "react";
import { Address, decodeEventLog } from "viem";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";

import { config } from "@/providers/wagmi/config";
import core from "@/types/contracts/core-protocol";

const CORE_ADDRESS = core.address as Address;
const CORE_ABI = core.abi;

export function useCaptionService() {
  const { address } = useAccount();
  const [videoId, setVideoId] = useState<bigint | null>(null);
  const [jobId, setJobId] = useState<bigint | null>(null);

  const { writeContract: writeUploadVideo } = useWriteContract();
  const { writeContract: writeCreateJob } = useWriteContract();
  const { writeContract: writeCancelJob } = useWriteContract();
  const { writeContract: writeCreateDispute } = useWriteContract();

  const { data: videoDetails, refetch: refetchVideoDetails } = useReadContract({
    address: CORE_ADDRESS,
    abi: CORE_ABI,
    functionName: "getVideoDetails",
    args: [videoId!],
    query: {
      enabled: !!videoId,
    },
  });

  const { data: jobStatus, refetch: refetchJobStatus } = useReadContract({
    address: CORE_ADDRESS,
    abi: CORE_ABI,
    functionName: "getJobStatus",
    args: [jobId!],
    query: {
      enabled: !!jobId,
    },
  });

  const { data: jobDetails, refetch: refetchJobDetails } = useReadContract({
    address: CORE_ADDRESS,
    abi: CORE_ABI,
    functionName: "getJobDetails",
    args: [jobId!],
    query: {
      enabled: !!jobId,
    },
  });

  const { data: userJobs, refetch: refetchUserJobs } = useReadContract({
    address: CORE_ADDRESS,
    abi: CORE_ABI,
    functionName: "getUserJobs",
    args: [address!],
    query: {
      enabled: !!address,
    },
  });

  const uploadVideo = useCallback(
    (
      ipfsHash: string,
      duration: number,
      isEncrypted: boolean
    ): Promise<void> => {
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
    [writeUploadVideo]
  );

  const createJob = useCallback(
    (videoId: bigint, jobType: number): Promise<void> => {
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
    async (id: bigint) => {
      setVideoId(id);
      await refetchVideoDetails();
      return videoDetails;
    },
    [refetchVideoDetails, videoDetails]
  );

  const getJobStatus = useCallback(
    async (id: bigint) => {
      setJobId(id);
      await refetchJobStatus();
      return jobStatus;
    },
    [refetchJobStatus, jobStatus]
  );

  const getJobDetails = useCallback(
    async (id: bigint) => {
      setJobId(id);
      await refetchJobDetails();
      return jobDetails;
    },
    [refetchJobDetails, jobDetails]
  );

  const getUserJobs = useCallback(async () => {
    if (!address) throw new Error("No user address");
    await refetchUserJobs();
    return userJobs;
  }, [address, refetchUserJobs, userJobs]);

  return {
    uploadVideo,
    getVideoDetails,
    createJob,
    getJobStatus,
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
