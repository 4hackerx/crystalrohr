import { useCallback } from "react";

import { Colour } from "@/utils/colour";

const useColourAnalysis = () => {
  const getAverageColor = useCallback(
    (context: CanvasRenderingContext2D, w: number, h: number) => {
      const a = w * h;
      const data = context.getImageData(0, 0, w, h).data;
      let [r, g, b] = [0, 0, 0];

      for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
      }

      return {
        r: ~~(r / a),
        g: ~~(g / a),
        b: ~~(b / a),
      };
    },
    []
  );

  const compareColorSimilarity = useCallback(
    (
      accumulatedColors: { r: number; g: number; b: number }[],
      prevColors: { r: number; g: number; b: number }[]
    ) => {
      if (prevColors.length === 0) {
        return { similar: false, newColors: accumulatedColors };
      }

      const difference = accumulatedColors.map((color1, i) => {
        const color2 = prevColors[i];
        const [L1, A1, B1] = Colour.rgba2lab(color1.r, color1.g, color1.b);
        const [L2, A2, B2] = Colour.rgba2lab(color2.r, color2.g, color2.b);
        return Colour.deltaE00(L1, A1, B1, L2, A2, B2);
      });

      const average = difference.reduce((a, b) => a + b, 0) / difference.length;

      return {
        similar: average <= 2,
        newColors: accumulatedColors,
      };
    },
    []
  );

  return { getAverageColor, compareColorSimilarity };
};

export default useColourAnalysis;
