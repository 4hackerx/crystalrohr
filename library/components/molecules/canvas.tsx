import * as React from "react";

interface CanvasProps extends React.CanvasHTMLAttributes<HTMLCanvasElement> {
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

const Canvas = ({ canvasRef, ...props }: CanvasProps): JSX.Element => {
  return <canvas hidden ref={canvasRef} {...props} />;
};

export default Canvas;
