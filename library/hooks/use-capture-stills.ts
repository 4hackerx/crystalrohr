import { useCallback, useRef } from "react";

import useCaptureCanvas from "@/hooks/use-capture-canvas";
import useColourAnalysis from "@/hooks/use-colour-analysis";
import usePollingEffect from "@/hooks/use-polling-effect";

const useCaptureStills = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const slicedRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const colorsRef = useRef<{ r: number; g: number; b: number }[]>([]);

  const { canvasRef, setUpCanvas } = useCaptureCanvas(videoRef);
  const { getAverageColor, compareColorSimilarity } = useColourAnalysis();

  const captureImage = useCallback(
    (
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

        console.log("Scene just changed? ", !similar);

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
      } catch (e) {
        console.log(e);
      }
    },
    [setUpCanvas, getAverageColor, compareColorSimilarity]
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

  const captureScene = useCallback(() => {
    const scene = sceneRef.current;

    console.log(colorsRef.current);

    if (!scene) {
      throw new Error("No scene ref");
    }

    captureImage(({ clone, similar }) => {
      if (!similar) {
        const img = new Image();
        img.src = clone.toDataURL();
        scene.appendChild(img);
      }
    });
  }, [captureImage]);

  const [stopPolling, startPolling] = usePollingEffect(captureScene, [], {
    interval: 1000,
    onCleanUp: () => {},
  });

  return {
    canvasRef,
    captureSliced,
    sceneRef,
    videoRef,
    slicedRef,
    stopPolling,
    startPolling,
  };
};

export default useCaptureStills;
