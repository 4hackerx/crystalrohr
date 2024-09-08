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
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/atoms/button";
import ProgressStripe from "@/components/atoms/progress-stripe";
import VideoPlayer from "@/components/molecules/video-player";
import { XMTPConnect } from "@/components/molecules/xmtp-connect";
import useFileUpload from "@/hooks/use-file-upload";
import useJobNotifier from "@/hooks/use-job-notifier";
import { useUserService } from "@/hooks/use-user-service";

type CaptionDetails = {
  totalWords: number;
  audioLength: string;
  totalScenes: number;
};

const VideoProcessingPage = () => {
  const [encryptedJob, setEncryptedJob] = useState(false);
  const [nodeAddress, setNodeAddress] = useState("");

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

  const notifier = useJobNotifier(nodeAddress, Number(jobId).toString());

  const inputFile = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(async () => {
    const uploadedUrl = await uploadFile();
    if (uploadedUrl) {
      try {
        await uploadVideo(uploadedUrl, 0, encryptedJob);
        toast.success("Video uploaded successfully");
      } catch (error) {
        toast.error("Error uploading video");
      }
    } else {
      toast.error("Error uploading file");
    }
  }, [uploadFile, uploadVideo, encryptedJob]);

  const handleGenerateCaption = useCallback(async () => {
    if (!videoId) {
      toast.error("No video uploaded");
      return;
    }
    try {
      const newJobId = await createJob(videoId, encryptedJob ? 1 : 0);
      setJobId(newJobId.jobId);
      toast.success("Caption generation job created");
    } catch (error) {
      toast.error("Error creating caption generation job");
    }
  }, [videoId, createJob, setJobId, encryptedJob]);

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
            <>
              <Button
                disabled={!file || uploading}
                onClick={handleUpload}
                className="w-full bg-[#1f0a4f] transition-colors duration-300 mt-8 hover:bg-[#360C99]"
              >
                Upload Video <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                disabled={!file || uploading}
                onClick={handleGenerateCaption}
                className="w-full bg-[#1f0a4f] transition-colors duration-300 mt-4 hover:bg-[#360C99]"
              >
                Generate Caption <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </>
          )}

          {url && <ProgressStripe percentage={100} color="purple" />}
        </section>

        {/* Video Details Section */}
        <section className="mt-8 bg-gradient-to-br from-[#360C99] to-[#550EFB] rounded-2xl p-8 shadow-lg max-w-2xl flex flex-col w-full">
          <h2 className="text-2xl font-semibold mb-6">Live Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Play,
                label: "Process Action",
                value: notifier.latestMessage,
              }, // TODO:
              { icon: Clock, label: "Process Time", value: 0 }, // TODO:
              { icon: Layers, label: "Computed Scenes", value: 0 }, // TODO:
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
            { label: "Create Dispute", action: () => createDispute(jobId!) },
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
