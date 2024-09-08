import { useRef, useCallback } from "react";

const useCaptureCanvas = (videoRef: React.RefObject<HTMLVideoElement>) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const setUpCanvas = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!canvas || !video) {
      throw new Error("Canvas or video not initialized");
    }

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Unable to get 2D context from canvas");
    }

    const w = video.videoWidth;
    const h = video.videoHeight;

    canvas.width = w;
    canvas.height = h;

    context.fillRect(0, 0, w, h);
    context.drawImage(video, 0, 0, w, h);

    return { canvas, context, w, h };
  }, [videoRef]);

  return { canvasRef, setUpCanvas };
};

export default useCaptureCanvas;
