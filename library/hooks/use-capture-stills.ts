import { useCallback, useRef, useState } from "react";

import useCaptureCanvas from "@/hooks/use-capture-canvas";
import useColourAnalysis from "@/hooks/use-colour-analysis";
import useFileUpload from "@/hooks/use-file-upload";
import usePollingEffect from "@/hooks/use-polling-effect";

type ProcessStatus = "idle" | "capturing" | "uploading" | "complete";
type ProcessEvent =
  | "capture_start"
  | "capture_end"
  | "upload_start"
  | "upload_end"
  | "video_end"
  | "all_complete";

const useCaptureStills = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const slicedRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const colorsRef = useRef<{ r: number; g: number; b: number }[]>([]);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [capturedScenes, setCapturedScenes] = useState<Record<number, string>>(
    {}
  );
  const uploadQueueRef = useRef<{ file: File; timestamp: number }[]>([]);
  const lastUploadTimeRef = useRef<number>(0);
  const [processStatus, setProcessStatus] = useState<ProcessStatus>("idle");
  const [lastEvent, setLastEvent] = useState<ProcessEvent | null>(null);
  const videoEndedRef = useRef<boolean>(false);

  const { canvasRef, setUpCanvas } = useCaptureCanvas(videoRef);
  const { getAverageColor, compareColorSimilarity } = useColourAnalysis();
  const { uploadFile, setFile } = useFileUpload();

  const updateProcessStatus = useCallback((event: ProcessEvent) => {
    setLastEvent(event);
    switch (event) {
      case "capture_start":
        setProcessStatus("capturing");
        break;
      case "upload_start":
        setProcessStatus("uploading");
        break;
      case "video_end":
        videoEndedRef.current = true;
        console.log(
          "Video playback has ended. Processing remaining captures..."
        );
        break;
      case "all_complete":
        setProcessStatus("complete");
        console.log("All captures have been processed and uploaded.");
        break;
      default:
        break;
    }
  }, []);

  const captureImage = useCallback(
    async (
      onCapture: (params: {
        clone: HTMLCanvasElement;
        similar: boolean;
        w: number;
        h: number;
        colWidth: number;
        rowHeight: number;
        accumulatedColors: { r: number; g: number; b: number }[];
      }) => void
    ) => {
      const video = videoRef.current;

      if (!video) {
        throw new Error("No video ref");
      }

      try {
        updateProcessStatus("capture_start");
        const { canvas, context, w, h } = setUpCanvas();
        const clone = canvas.cloneNode(true) as HTMLCanvasElement;
        clone.getContext("2d")?.drawImage(canvas, 0, 0);

        const col = 8;
        const row = 4;
        const colWidth = canvas.width / col;
        const rowHeight = canvas.height / row;
        const accumulatedColors: { r: number; g: number; b: number }[] = [];

        for (let i = 0; i < row; i++) {
          for (let j = 0; j < col; j++) {
            canvas.width = colWidth;
            canvas.height = rowHeight;

            context.clearRect(0, 0, colWidth, rowHeight);
            context.drawImage(
              clone,
              j * colWidth,
              i * rowHeight,
              colWidth,
              rowHeight,
              0,
              0,
              colWidth,
              rowHeight
            );

            accumulatedColors.push(
              getAverageColor(context, colWidth, rowHeight)
            );
          }
        }

        const { similar, newColors } = compareColorSimilarity(
          accumulatedColors,
          colorsRef.current
        );

        colorsRef.current = newColors;

        onCapture({
          clone,
          similar,
          w,
          h,
          colWidth,
          rowHeight,
          accumulatedColors,
        });

        context.clearRect(0, 0, w, h);
        updateProcessStatus("capture_end");
      } catch (e) {
        console.log(e);
      }
    },
    [setUpCanvas, getAverageColor, compareColorSimilarity, updateProcessStatus]
  );

  const captureSliced = useCallback(() => {
    const sliced = slicedRef.current;

    if (!sliced) {
      throw new Error("No sliced ref");
    }

    captureImage(({ w, colWidth, rowHeight, accumulatedColors }) => {
      while (sliced.firstChild) {
        sliced.lastChild && sliced.removeChild(sliced.lastChild);
      }

      sliced.style.width = w + "px";

      accumulatedColors.forEach(({ r, g, b }) => {
        let cell = document.createElement("div");
        cell.style.width = colWidth + "px";
        cell.style.height = rowHeight + "px";
        cell.style.backgroundColor = `rgb(${r},${g},${b})`;
        sliced.appendChild(cell);
      });
    });
  }, [captureImage]);

  const processUploadQueue = useCallback(async () => {
    const now = Date.now();
    if (now - lastUploadTimeRef.current < 5000) {
      return; // Wait at least 5 seconds between uploads
    }

    const nextUpload = uploadQueueRef.current.shift();
    if (nextUpload) {
      try {
        updateProcessStatus("upload_start");
        const url = await uploadFile({ file2: nextUpload.file });
        if (url) {
          setCapturedImages((prev) => [...prev, url]);
          setCapturedScenes((prev) => {
            const timestamp = Math.floor(nextUpload.timestamp);
            return { ...prev, [timestamp]: url };
          });
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        uploadQueueRef.current.unshift(nextUpload);
      } finally {
        updateProcessStatus("upload_end");
        lastUploadTimeRef.current = now;
      }
    }

    console.log(uploadQueueRef.current.length);

    if (uploadQueueRef.current.length === 0 && videoEndedRef.current) {
      updateProcessStatus("all_complete");
    }
  }, [uploadFile, updateProcessStatus]);

  const captureScene = useCallback(() => {
    const scene = sceneRef.current;
    const video = videoRef.current;

    if (!scene || !video) {
      throw new Error("No scene ref or video ref");
    }

    captureImage(async ({ clone, similar }) => {
      if (!similar) {
        const fileName = `capture_${Date.now()}.jpg`;

        clone.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], fileName, { type: "image/jpeg" });
            uploadQueueRef.current.push({ file, timestamp: video.currentTime });
          }
        }, "image/jpeg");
      }
      if (video.ended) {
        updateProcessStatus("video_end");
      }
    });
  }, [captureImage, updateProcessStatus]);

  const [stopPolling, startPolling] = usePollingEffect(captureScene, [], {
    interval: 1000,
    onCleanUp: () => {},
  });

  const [stopUploadPolling, startUploadPolling] = usePollingEffect(
    processUploadQueue,
    [],
    {
      interval: 1000,
      onCleanUp: () => {},
    }
  );

  return {
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
  };
};

export default useCaptureStills;
