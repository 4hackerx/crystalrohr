"use client";

import {
  ChevronRight,
  Clock,
  Layers,
  Play,
  Upload,
  UploadCloud,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/atoms/button";
import VideoPlayer from "@/components/molecules/video-player";
import { XMTPConnect } from "@/components/molecules/xmtp-connect";
import useFileUpload from "@/hooks/use-file-upload";
import useJobNotifier from "@/hooks/use-job-notifier";
import { useNodeBroadcast } from "@/hooks/use-node-broadcast";
import { useUserService } from "@/hooks/use-user-service";
import { useVisionFunctions } from "@/hooks/use-vision-functions";

type SendToCLient = {
  jobId: string;
  chatId: number | null;
  capturedScenes: Record<number, string>;
  processStatus: string;
};

const VideoProcessingPage = () => {
  const [encryptedJob, setEncryptedJob] = useState(false);
  const [nodeAddress, setNodeAddress] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState("00:00");
  const [captionGenerated, setCaptionGenerated] = useState(false);
  const [captionText, setCaptionText] = useState<string[]>([]);
  const [summary, setSummary] = useState<string>("");

  const { file, setFile, url, setUrl, uploading, uploadFile, handleChange } =
    useFileUpload();
  const {
    uploadVideo,
    getVideoDetails,
    createJob,
    getJobStatus,
    cancelJob,
    getJobDetails,
    getUserJobs,
    createDispute,
    videoId,
    jobId,
    setJobId,
  } = useUserService();

  const {
    broadcast,
    isLoading: isBroadcasting,
    error: broadcastError,
  } = useNodeBroadcast();

  const notifier = useJobNotifier(
    "0xe219E1106b441c9A8D5E12364e07EEE6e896e199",
    "6"
  );

  const sendToNode = {
    jobId: "6",
    url: url,
  };

  const handleBroadcast = () => {
    broadcast(
      "0xe219E1106b441c9A8D5E12364e07EEE6e896e199",
      "CoQBMHhlMGNmMTY4Y2U2NjQzNDZjMTkzYTA5NDE0OTJkMWFkMjc4ZTA3ODE5YjlkZDNhMTliZDFjNGRiMDdhY2ZiMzAzNmZkOTI1YzE5MTQ2ZWVmNmI0ZGNmM2EwNTZhNjgwNDY3ZjY4ZDFiYmVjYmIzZDJlN2FjZmU2NWE2MTVmNzYwMzFjEJq045OdMhgB",
      JSON.stringify(sendToNode)
    );
  };

  const { getMessageHistory } = useVisionFunctions();

  const inputFile = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(async () => {
    const uploadedUrl = await uploadFile();
    // if (uploadedUrl) {
    //   try {
    //     await uploadVideo(uploadedUrl, 0, encryptedJob);
    //     toast.success("Video uploaded successfully");
    //   } catch (error) {
    //     toast.error("Error uploading video");
    //   }
    // } else {
    //   toast.error("Error uploading file");
    // }
  }, [uploadFile, uploadVideo, encryptedJob]);

  const handleGenerateCaption = useCallback(async () => {
    // if (!videoId) {
    //   toast.error("No video uploaded");
    //   return;
    // }
    try {
      handleBroadcast();
      setStartTime(Date.now());
      // const newJobId = await createJob(videoId, encryptedJob ? 1 : 0);
      // setJobId(newJobId.jobId);
      toast.success("Caption generation job created");
      setCaptionGenerated(true);
    } catch (error) {
      toast.error("Error creating caption generation job");
    }
  }, [videoId, createJob, setJobId, encryptedJob, handleBroadcast]);

  const handleJobAction = useCallback(
    async (action: () => Promise<any>, successMessage: string) => {
      if (!jobId) {
        toast.error("No active job");
        return;
      }
      try {
        await action();
        toast.success(successMessage);
      } catch (error) {
        toast.error(`Error: ${successMessage.toLowerCase()}`);
      }
    },
    [jobId]
  );

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (startTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        setElapsedTime(
          `${Math.floor(elapsed / 60)}:${(elapsed % 60).toString().padStart(2, "0")}`
        );
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startTime]);

  useEffect(() => {
    const fetchSummary = async () => {
      if (captionGenerated && notifier.latestMessage) {
        try {
          const sendToClient = notifier.latestMessage as SendToCLient;
          const chatId = sendToClient.chatId;

          if (chatId !== null) {
            const messageHistory = await getMessageHistory(chatId);

            if (messageHistory && messageHistory.length > 0) {
              const assistantReply = messageHistory.find(
                (msg) => msg.role === "assistant"
              );
              if (assistantReply && assistantReply.content) {
                const textContent = assistantReply.content.find(
                  (c) => c.contentType === "text"
                );
                if (textContent) {
                  setSummary(textContent.value);
                  return;
                }
              }
            }
          }
        } catch (error) {
          console.error("Error fetching summary:", error);
        }
      }

      // If we haven't returned by now, schedule another attempt
      setTimeout(fetchSummary, 2000);
    };

    fetchSummary();
  }, [captionGenerated, notifier.latestMessage?.chatId, getMessageHistory]);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <XMTPConnect />
      <h1 className="text-4xl font-bold mb-12 text-center">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#550EFB] to-[#360C99]">
          Video Processing Hub
        </span>
      </h1>

      <div className="mx-auto flex flex-col items-center justify-center">
        {/* Video Upload Section */}
        <section className="bg-gradient-to-br from-[#360C99] to-[#550EFB] rounded-2xl p-8 shadow-lg max-w-2xl w-full">
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <Upload className="mr-2" /> Upload Your Video
          </h2>
          {!file ? (
            <div className="bg-black bg-opacity-30 rounded-xl p-6">
              <label
                htmlFor="video-upload"
                className="flex flex-col items-center justify-center w-full h-48 border-2 border-[#550EFB] border-dashed rounded-lg cursor-pointer hover:bg-[#550EFB] hover:bg-opacity-10 transition-all duration-300"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-10 h-10 mb-3 text-[#550EFB]" />
                  <p className="mb-2 text-sm">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-400">
                    MP4, AVI, or MOV (MAX. 800MB)
                  </p>
                </div>
                <input
                  id="video-upload"
                  type="file"
                  ref={inputFile}
                  className="hidden"
                  onChange={handleChange}
                />
              </label>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <p className="mb-2 text-sm">
                {file.name} will be uploaded.{" "}
                <span className="font-semibold">
                  Click &quot;Upload&quot; to start, or cancel
                </span>
              </p>
              {!uploading && (
                <X
                  className="w-5 h-5 self-end cursor-pointer"
                  onClick={() => {
                    setUrl("");
                    setFile(null);
                  }}
                />
              )}
            </div>
          )}
          {uploading && <p className="mt-6">Uploading...</p>}
          {url && <VideoPlayer url={url} />}
          {!url && (
            <Button
              disabled={!file || uploading}
              onClick={handleUpload}
              className="w-full bg-[#1f0a4f] transition-colors duration-300 mt-8 hover:bg-[#360C99]"
            >
              Upload Video <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
          <Button
            disabled={!file || uploading}
            onClick={handleGenerateCaption}
            className="w-full bg-[#1f0a4f] transition-colors duration-300 mt-4 hover:bg-[#360C99]"
          >
            Generate Caption <ChevronRight className="w-4 h-4 ml-2" />
          </Button>

          {/* Caption Generation Progress and Results */}
          {captionGenerated && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">
                Caption Generation Progress
              </h3>
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-2">
                  Generated Summary:
                </h4>
                {summary ? (
                  <div className="space-y-4">
                    {(() => {
                      try {
                        const parsedSummary = JSON.parse(summary);
                        if (Array.isArray(parsedSummary)) {
                          return parsedSummary.map(
                            (paragraph: string, index: number) => (
                              <p key={index}>{paragraph}</p>
                            )
                          );
                        } else {
                          return <p>{summary}</p>;
                        }
                      } catch (error) {
                        if (summary.trim() === "") {
                          return <p>Error: Empty summary</p>;
                        } else {
                          return <p>{summary}</p>;
                        }
                      }
                    })()}
                  </div>
                ) : (
                  <p>Generating summary...</p>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Video Details Section */}
        <section className="mt-8 bg-gradient-to-br from-[#360C99] to-[#550EFB] rounded-2xl p-8 shadow-lg max-w-2xl flex flex-col w-full">
          <h2 className="text-2xl font-semibold mb-6">Live Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Play,
                label: "Process Action",
                value: notifier.latestMessage
                  ? notifier.latestMessage?.processStatus
                  : "N/A",
              },
              {
                icon: Clock,
                label: "Process Time",
                value: elapsedTime,
              },
              {
                icon: Layers,
                label: "Computed Scenes",
                value: notifier.latestMessage?.capturedScenes
                  ? Object.keys(notifier.latestMessage?.capturedScenes).length
                  : 0,
              },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="bg-black bg-opacity-30 p-6 rounded-xl"
              >
                <Icon className="w-8 h-8 mb-4 text-[#550EFB]" />
                <p className="text-sm font-medium mb-2 text-gray-400">
                  {label}
                </p>
                <p className="text-3xl font-bold">{value}</p>
              </div>
            ))}
          </div>

          {[
            { label: "Get Job Status", action: () => getJobStatus(jobId!) },
            { label: "Cancel Job", action: () => cancelJob(jobId!) },
            // { label: "Create Dispute", action: () => createDispute(jobId!) },
            { label: "Get Job Details", action: () => getJobDetails(jobId!) },
            { label: "Get User Jobs", action: getUserJobs },
          ].map(({ label, action }) => (
            <Button
              key={label}
              onClick={() => handleJobAction(action, `${label} successful`)}
              className="w-full bg-[#1f0a4f] hover:bg-[#360C99] transition-colors duration-300 mt-4"
            >
              {label}
            </Button>
          ))}
        </section>
      </div>
    </div>
  );
};

export default VideoProcessingPage;
